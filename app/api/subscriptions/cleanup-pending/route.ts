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

        // Get user's Stripe customer ID
        const [userRecord] = await db
            .select({ stripeCustomerId: users.stripeCustomerId })
            .from(users)
            .where(eq(users.id, user.id))
            .limit(1);

        if (!userRecord?.stripeCustomerId) {
            return NextResponse.json({ error: 'No Stripe customer found' }, { status: 404 });
        }

        // Get all pending payment subscriptions from database
        const pendingDbSubscriptions = await db
            .select()
            .from(subscriptions)
            .where(and(
                eq(subscriptions.userId, user.id),
                eq(subscriptions.status, 'pending_payment')
            ));

        let cleanedUp = 0;

        for (const dbSub of pendingDbSubscriptions) {
            if (!dbSub.stripeSubscriptionId) {
                // If no Stripe subscription ID, just delete the database record
                await db
                    .delete(subscriptions)
                    .where(eq(subscriptions.id, dbSub.id));
                cleanedUp++;
                logger.info('Deleted orphaned database subscription (no Stripe ID)', {
                    subscriptionId: dbSub.id,
                    userId: user.id
                });
                continue;
            }

            try {
                // Check if the Stripe subscription exists and its status
                const stripeSubscription = await stripe.subscriptions.retrieve(dbSub.stripeSubscriptionId);
                
                // If Stripe subscription is cancelled, incomplete_expired, or doesn't exist
                if (stripeSubscription.status === 'canceled' || 
                    stripeSubscription.status === 'incomplete_expired' ||
                    stripeSubscription.status === 'unpaid') {
                    
                    await db
                        .delete(subscriptions)
                        .where(eq(subscriptions.id, dbSub.id));
                    cleanedUp++;
                    
                    logger.info('Deleted stale database subscription', {
                        subscriptionId: dbSub.id,
                        stripeSubscriptionId: dbSub.stripeSubscriptionId,
                        stripeStatus: stripeSubscription.status,
                        userId: user.id
                    });
                }
            } catch (stripeError: any) {
                // If Stripe subscription doesn't exist (404), delete from database
                if (stripeError.statusCode === 404) {
                    await db
                        .delete(subscriptions)
                        .where(eq(subscriptions.id, dbSub.id));
                    cleanedUp++;
                    
                    logger.info('Deleted database subscription for non-existent Stripe subscription', {
                        subscriptionId: dbSub.id,
                        stripeSubscriptionId: dbSub.stripeSubscriptionId,
                        userId: user.id
                    });
                } else {
                    logger.error('Error checking Stripe subscription during cleanup', {
                        error: stripeError.message,
                        subscriptionId: dbSub.id,
                        stripeSubscriptionId: dbSub.stripeSubscriptionId,
                        userId: user.id
                    });
                }
            }
        }

        logger.info('Pending payments cleanup completed', {
            userId: user.id,
            totalChecked: pendingDbSubscriptions.length,
            cleanedUp
        });

        return NextResponse.json({ 
            success: true,
            message: `Cleanup completat. ${cleanedUp} înregistrări șterse.`,
            cleanedUp,
            totalChecked: pendingDbSubscriptions.length
        });

    } catch (error: any) {
        logger.error('Error during pending payments cleanup', {
            error: error.message || 'Unknown error',
            userId: request.headers.get('authorization') || undefined
        });
        
        return NextResponse.json(
            { error: error.message || 'Failed to cleanup pending payments' },
            { status: 500 }
        );
    }
}