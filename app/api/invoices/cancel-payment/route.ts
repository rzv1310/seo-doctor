import { NextRequest, NextResponse } from 'next/server';
import { getUserFromToken } from '@/lib/auth';
import stripe from '@/lib/stripe-server';
import db from '@/database';
import { users, subscriptions } from '@/database/schema';
import { eq, and } from 'drizzle-orm';
import { logger } from '@/lib/logger';



export async function POST(request: NextRequest) {
    try {
        const user = await getUserFromToken(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { invoiceId } = body;

        if (!invoiceId) {
            return NextResponse.json({ error: 'Invoice ID is required' }, { status: 400 });
        }

        // Get user's Stripe customer ID
        const [userRecord] = await db
            .select({ stripeCustomerId: users.stripeCustomerId })
            .from(users)
            .where(eq(users.id, user.id))
            .limit(1);

        if (!userRecord?.stripeCustomerId) {
            return NextResponse.json({ error: 'No Stripe customer found' }, { status: 404 });
        }

        // Get the invoice from Stripe
        const invoice = await stripe.invoices.retrieve(invoiceId);

        // Verify the invoice belongs to this user
        if (invoice.customer !== userRecord.stripeCustomerId) {
            return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
        }

        // Only allow cancelling pending/open invoices
        if (invoice.status !== 'draft' && invoice.status !== 'open') {
            return NextResponse.json({ 
                error: 'Această factură nu poate fi anulată. Doar facturile în așteptare pot fi anulate.' 
            }, { status: 400 });
        }

        try {
            // Cancel the invoice in Stripe
            await stripe.invoices.voidInvoice(invoiceId);
            logger.info('Cancelled pending invoice', {
                invoiceId,
                userId: user.id,
                customerId: userRecord.stripeCustomerId
            });

            // If the invoice has a subscription, also cancel it and clean up database
            if (invoice.subscription) {
                const stripeSubscriptionId = typeof invoice.subscription === 'string' ? invoice.subscription : invoice.subscription.id;
                
                try {
                    const subscription = await stripe.subscriptions.retrieve(stripeSubscriptionId);
                    
                    // Only cancel if subscription is incomplete or past_due
                    if (subscription.status === 'incomplete' || subscription.status === 'past_due') {
                        await stripe.subscriptions.cancel(subscription.id);
                        logger.info('Cancelled related subscription in Stripe', {
                            subscriptionId: subscription.id,
                            userId: user.id
                        });
                    }
                } catch (subError) {
                    logger.error('Failed to cancel related subscription in Stripe', {
                        error: subError instanceof Error ? subError.message : String(subError),
                        subscriptionId: stripeSubscriptionId,
                        userId: user.id
                    });
                    // Continue even if Stripe subscription cancellation fails
                }

                // Also clean up the database subscription record
                try {
                    const deletedSubs = await db
                        .delete(subscriptions)
                        .where(and(
                            eq(subscriptions.stripeSubscriptionId, stripeSubscriptionId),
                            eq(subscriptions.userId, user.id)
                        ));

                    logger.info('Deleted database subscription record', {
                        stripeSubscriptionId,
                        userId: user.id
                    });
                } catch (dbError) {
                    logger.error('Failed to delete database subscription record', {
                        error: dbError instanceof Error ? dbError.message : String(dbError),
                        stripeSubscriptionId,
                        userId: user.id
                    });
                    // Continue even if database cleanup fails
                }
            }

            return NextResponse.json({ 
                success: true,
                message: 'Plata în așteptare a fost anulată cu succes' 
            });
        } catch (stripeError: any) {
            logger.error('Failed to cancel invoice in Stripe', {
                error: stripeError.message || String(stripeError),
                invoiceId,
                userId: user.id
            });
            
            return NextResponse.json(
                { error: 'Nu s-a putut anula plata. Te rugăm să încerci din nou.' },
                { status: 500 }
            );
        }
    } catch (error: any) {
        logger.error('Error cancelling invoice payment', {
            error: error.message || 'Unknown error',
            userId: request.headers.get('authorization') || undefined
        });
        
        return NextResponse.json(
            { error: error.message || 'Failed to cancel invoice payment' },
            { status: 500 }
        );
    }
}