import { NextRequest, NextResponse } from 'next/server';
import { eq, and } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import database, { subscriptions, services, invoices } from '@/database';
import { verifyApiAuth } from '@/lib/auth';
import { logger, withLogging } from '@/lib/logger';

export const POST = withLogging(async (
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) => {
    try {
        const session = await verifyApiAuth(request);

        if (!session.isAuthenticated) {
            logger.auth('Unauthorized subscription attempt', { path: request.url });
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const serviceId = (await params).id;
        logger.info('Subscription attempt', { serviceId, userId: session.user.id });

        // Check if service exists
        const service = await database.query.services.findFirst({
            where: eq(services.id, serviceId),
        });

        if (!service) {
            logger.warn('Service not found for subscription', { serviceId });
            return NextResponse.json({ error: 'Service not found' }, { status: 404 });
        }

        // Check if user already has an active subscription to this service
        const existingSubscription = await database.query.subscriptions.findFirst({
            where: and(
                eq(subscriptions.userId, session.user.id),
                eq(subscriptions.serviceId, serviceId),
                eq(subscriptions.status, 'active')
            ),
        });

        if (existingSubscription) {
            logger.warn('Duplicate subscription attempt', { serviceId, userId: session.user.id });
            return NextResponse.json({
                error: 'You already have an active subscription to this service'
            }, { status: 400 });
        }

        // Get subscription details from request body
        const body = await request.json();
        const {
            planType = 'monthly',
            trialPeriod = 0, // Days of trial (0 means no trial)
            metadata = {},
            couponCode = null,
            quantity = 1
        } = body;

        // Calculate dates
        const now = new Date();
        const startDate = now.toISOString();

        // Set renewal date based on plan type
        const renewalDate = new Date(now);
        if (planType === 'yearly') {
            renewalDate.setFullYear(renewalDate.getFullYear() + 1);
        } else {
            // Default to monthly
            renewalDate.setMonth(renewalDate.getMonth() + 1);
        }

        // Calculate trial end date if applicable
        let trialEndDate = null;
        if (trialPeriod > 0) {
            const trialEnd = new Date(now);
            trialEnd.setDate(trialEnd.getDate() + trialPeriod);
            trialEndDate = trialEnd.toISOString();
        }

        // Calculate actual price based on plan type, quantity, and potential discount
        let subscriptionPrice = service.price;
        if (planType === 'yearly') {
            // Apply 10% discount for yearly subscriptions
            subscriptionPrice = Math.round(subscriptionPrice * 0.9 * 12);
        }

        // Apply quantity multiplier
        subscriptionPrice = subscriptionPrice * quantity;

        // Apply coupon discount if there's a valid coupon (placeholder for coupon logic)
        // Here you would need to implement coupon validation and discount calculation

        // Determine status based on trial period
        const initialStatus = trialPeriod > 0 ? 'trial' : 'active';

        // Create metadata object
        const subscriptionMetadata = {
            ...metadata,
            planType,
            quantity,
            couponCode,
        };

        logger.info('Creating subscription', { serviceId, userId: session.user.id, planType, status: initialStatus });

        const newSubscription = await database.insert(subscriptions).values({
            id: uuidv4(),
            userId: session.user.id,
            serviceId,
            status: initialStatus,
            startDate,
            renewalDate: renewalDate.toISOString(),
            trialEndDate: trialEndDate,
            price: subscriptionPrice,
            usage: 0,
            metadata: JSON.stringify(subscriptionMetadata),
            createdAt: startDate,
            updatedAt: startDate,
        }).returning();

        // Orders table removed - payment tracking now handled through invoices

        // Invoice handling: For trials, set due date to trial end date
        // For active subscriptions, set due date to 14 days
        const dueDate = new Date(now);
        if (initialStatus === 'trial' && trialEndDate) {
            // Due at end of trial
            dueDate.setTime(new Date(trialEndDate).getTime());
        } else {
            // Standard net-14 terms
            dueDate.setDate(dueDate.getDate() + 14);
        }

        // Set invoice status based on trial
        const invoiceStatus = initialStatus === 'trial' ? 'pending' : 'paid';

        // Create an invoice for this order
        const invoiceId = uuidv4();
        await database.insert(invoices).values({
            id: invoiceId,
            userId: session.user.id,
            orderId,
            createdAt: startDate,
            dueDate: dueDate.toISOString(),
            amount: subscriptionPrice,
            status: invoiceStatus,
            stripeInvoiceId: null
        });

        logger.info('Subscription created successfully', {
            subscriptionId: newSubscription[0].id,
            userId: session.user.id,
            serviceId,
            orderId,
            invoiceId
        });

        return NextResponse.json({
            subscription: newSubscription[0],
            orderId,
            invoiceId,
            service: {
                id: service.id,
                name: service.name,
                description: service.description,
                price: service.price,
            },
            planDetails: {
                type: planType,
                quantity,
                isTrialActive: initialStatus === 'trial',
                trialEndsAt: trialEndDate,
                renewalDate: renewalDate.toISOString(),
            },
            message: initialStatus === 'trial'
                ? `Successfully started ${trialPeriod}-day trial for ${service.name}`
                : `Successfully subscribed to ${service.name}`
        });
    } catch (error) {
        logger.error('Error subscribing to service', { error: error instanceof Error ? error.message : String(error) });
        return NextResponse.json({ error: 'Failed to subscribe to service' }, { status: 500 });
    }
});

export const PUT = withLogging(async (
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) => {
    try {
        const session = await verifyApiAuth(request);

        if (!session.isAuthenticated) {
            logger.auth('Unauthorized subscription update attempt', { path: request.url });
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const subscriptionId = (await params).id;
        logger.info('Updating subscription', { subscriptionId, userId: session.user.id });

        // Check if subscription exists and belongs to user
        const existingSubscription = await database.query.subscriptions.findFirst({
            where: and(
                eq(subscriptions.id, subscriptionId),
                eq(subscriptions.userId, session.user.id)
            ),
        });

        if (!existingSubscription) {
            logger.warn('Subscription not found for update', { subscriptionId, userId: session.user.id });
            return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
        }

        // Get update details from request body
        const body = await request.json();
        const {
            status,
            cancelReason,
            renewalDate,
            planType,
            quantity,
            pauseUntil,
            usage,
            notes,
            additionalMetadata = {}
        } = body;

        const now = new Date().toISOString();

        // Parse existing metadata
        const currentMetadata = JSON.parse(existingSubscription.metadata || '{}');

        // Determine renewal date changes
        let newRenewalDate = existingSubscription.renewalDate;
        if (renewalDate) {
            // If renewal date is explicitly provided, use it
            newRenewalDate = renewalDate;
        } else if (planType && planType !== currentMetadata.planType) {
            // If plan type changed, recalculate renewal date
            const renewalDateObj = new Date();
            if (planType === 'yearly') {
                renewalDateObj.setFullYear(renewalDateObj.getFullYear() + 1);
            } else {
                renewalDateObj.setMonth(renewalDateObj.getMonth() + 1);
            }
            newRenewalDate = renewalDateObj.toISOString();
        }

        // Build updated metadata
        const updatedMetadata = {
            ...currentMetadata,
            ...(planType && { planType }),
            ...(quantity && { quantity }),
            ...(notes && { notes }),
            ...additionalMetadata
        };

        // Add cancel reason to metadata if cancelling
        if (status === 'cancelled' && cancelReason) {
            updatedMetadata.cancelReason = cancelReason;
        }

        // If pausing, add pause information
        if (status === 'paused' && pauseUntil) {
            updatedMetadata.pauseReason = additionalMetadata.pauseReason || 'User requested';
            updatedMetadata.pausedAt = now;
            updatedMetadata.pauseUntil = pauseUntil;
        }

        // Build update object
        const updateData: any = {
            updatedAt: now,
            metadata: JSON.stringify(updatedMetadata)
        };

        // Only update fields that were provided
        if (status) {
            updateData.status = status;
        }

        if (status === 'cancelled') {
            updateData.cancelledAt = now;
        }

        if (renewalDate || planType) {
            updateData.renewalDate = newRenewalDate;
        }

        if (usage !== undefined) {
            updateData.usage = usage;
        }

        logger.info('Processing subscription update', { subscriptionId, status, updateFields: Object.keys(updateData) });

        const updatedSubscription = await database
            .update(subscriptions)
            .set(updateData)
            .where(eq(subscriptions.id, subscriptionId))
            .returning();

        // Generate appropriate message based on the update type
        let message = 'Subscription updated successfully';
        if (status === 'cancelled') {
            message = 'Subscription cancelled successfully';
        } else if (status === 'paused') {
            message = 'Subscription paused successfully';
        } else if (planType) {
            message = `Subscription plan changed to ${planType}`;
        } else if (quantity && quantity !== currentMetadata.quantity) {
            message = `Subscription quantity updated to ${quantity}`;
        }

        logger.info('Subscription updated successfully', { subscriptionId, message });
        return NextResponse.json({
            subscription: updatedSubscription[0],
            message,
            updatedFields: Object.keys(updateData).filter(key => key !== 'updatedAt' && key !== 'metadata')
        });
    } catch (error) {
        logger.error('Error updating subscription', { error: error instanceof Error ? error.message : String(error) });
        return NextResponse.json({ error: 'Failed to update subscription' }, { status: 500 });
    }
});
