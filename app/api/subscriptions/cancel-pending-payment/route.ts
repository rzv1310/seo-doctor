import { NextRequest, NextResponse } from 'next/server';
import { getUserFromToken } from '@/lib/auth';
import stripe from '@/lib/stripe-server';
import db from '@/database';
import { subscriptions } from '@/database/schema';
import { eq, and } from 'drizzle-orm';
import { logger } from '@/lib/logger';



export async function POST(request: NextRequest) {
    try {
        const user = await getUserFromToken(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { subscriptionId } = body;

        if (!subscriptionId) {
            return NextResponse.json({ error: 'Subscription ID is required' }, { status: 400 });
        }

        // Get the subscription from database
        const [subscription] = await db
            .select()
            .from(subscriptions)
            .where(and(
                eq(subscriptions.id, subscriptionId),
                eq(subscriptions.userId, user.id)
            ))
            .limit(1);

        if (!subscription) {
            return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
        }

        // Only allow cancelling pending_payment subscriptions
        if (subscription.status !== 'pending_payment') {
            return NextResponse.json({ 
                error: 'Această acțiune este permisă doar pentru abonamente cu plăți în așteptare' 
            }, { status: 400 });
        }

        // Cancel the Stripe subscription if it exists
        if (subscription.stripeSubscriptionId) {
            try {
                await stripe.subscriptions.cancel(subscription.stripeSubscriptionId);
                logger.info('Cancelled pending payment Stripe subscription', {
                    subscriptionId: subscription.stripeSubscriptionId,
                    userId: user.id
                });
            } catch (error) {
                logger.error('Failed to cancel Stripe subscription', {
                    error: error instanceof Error ? error.message : String(error),
                    subscriptionId: subscription.stripeSubscriptionId,
                    userId: user.id
                });
                // Continue even if Stripe cancellation fails
            }
        }

        // Delete the subscription from database
        await db
            .delete(subscriptions)
            .where(eq(subscriptions.id, subscriptionId));

        logger.info('Deleted pending payment subscription', {
            subscriptionId,
            userId: user.id
        });

        return NextResponse.json({ 
            success: true,
            message: 'Plata în așteptare a fost anulată cu succes' 
        });
    } catch (error: any) {
        logger.error('Error cancelling pending payment', {
            error: error.message || 'Unknown error',
            userId: request.headers.get('authorization')
        });
        
        return NextResponse.json(
            { error: error.message || 'Failed to cancel pending payment' },
            { status: 500 }
        );
    }
}