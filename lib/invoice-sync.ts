import { v4 as uuidv4 } from 'uuid';
import db, { invoices, users, subscriptions } from '@/database';
import { eq } from 'drizzle-orm';
import { logger } from './logger';
import stripe from './stripe-server';



export async function syncInvoiceFromStripe(stripeInvoice: any) {
    try {
        logger.info('Syncing invoice from Stripe', {
            invoiceId: stripeInvoice.id,
            customerId: stripeInvoice.customer,
            subscription: stripeInvoice.subscription,
            status: stripeInvoice.status
        });

        // Get user by Stripe customer ID
        const [user] = await db
            .select()
            .from(users)
            .where(eq(users.stripeCustomerId, stripeInvoice.customer))
            .limit(1);

        if (!user) {
            logger.error('User not found for Stripe customer', {
                stripeCustomerId: stripeInvoice.customer,
                invoiceId: stripeInvoice.id
            });
            return null;
        }

        // Get subscription if invoice is for a subscription
        let subscription = null;
        if (stripeInvoice.subscription) {
            const [sub] = await db
                .select()
                .from(subscriptions)
                .where(eq(subscriptions.stripeSubscriptionId, stripeInvoice.subscription))
                .limit(1);
            subscription = sub;
        }

        // Check if invoice already exists
        const [existingInvoice] = await db
            .select()
            .from(invoices)
            .where(eq(invoices.stripeInvoiceId, stripeInvoice.id))
            .limit(1);

        const invoiceData = {
            userId: user.id,
            subscriptionId: subscription?.id || null,
            stripeInvoiceId: stripeInvoice.id,
            stripeCustomerId: stripeInvoice.customer,
            
            // Invoice details
            number: stripeInvoice.number,
            status: stripeInvoice.status,
            currency: stripeInvoice.currency.toUpperCase(),
            amountTotal: stripeInvoice.total || 0,
            amountPaid: stripeInvoice.amount_paid || 0,
            amountRemaining: stripeInvoice.amount_remaining || 0,
            
            // Service details
            serviceName: stripeInvoice.lines?.data?.[0]?.description || 'Unknown Service',
            serviceId: subscription?.serviceId || null,
            
            // Billing details - use invoice's or fall back to user's current
            billingName: stripeInvoice.customer_name || user.billingName || user.name,
            billingCompany: stripeInvoice.customer_tax_ids?.[0]?.value || user.billingCompany,
            billingVat: user.billingVat,
            billingAddress: stripeInvoice.customer_address ? 
                `${stripeInvoice.customer_address.line1}${stripeInvoice.customer_address.line2 ? ' ' + stripeInvoice.customer_address.line2 : ''}, ${stripeInvoice.customer_address.city}, ${stripeInvoice.customer_address.postal_code}, ${stripeInvoice.customer_address.country}` :
                user.billingAddress,
            billingPhone: stripeInvoice.customer_phone || user.billingPhone,
            
            // URLs
            hostedInvoiceUrl: stripeInvoice.hosted_invoice_url,
            invoicePdf: stripeInvoice.invoice_pdf,
            
            // Payment details
            paymentIntentId: stripeInvoice.payment_intent,
            
            // Timestamps
            createdAt: new Date(stripeInvoice.created * 1000).toISOString(),
            updatedAt: new Date().toISOString(),
            dueDate: stripeInvoice.due_date ? new Date(stripeInvoice.due_date * 1000).toISOString() : null,
            paidAt: stripeInvoice.status === 'paid' && stripeInvoice.status_transitions?.paid_at ? 
                new Date(stripeInvoice.status_transitions.paid_at * 1000).toISOString() : null,
            voidedAt: stripeInvoice.status === 'void' && stripeInvoice.status_transitions?.voided_at ?
                new Date(stripeInvoice.status_transitions.voided_at * 1000).toISOString() : null,
            
            // Metadata
            metadata: JSON.stringify(stripeInvoice.metadata || {})
        };

        if (existingInvoice) {
            // Update existing invoice
            await db
                .update(invoices)
                .set(invoiceData)
                .where(eq(invoices.id, existingInvoice.id));
            
            logger.info('Updated existing invoice', {
                invoiceId: existingInvoice.id,
                stripeInvoiceId: stripeInvoice.id,
                status: invoiceData.status
            });

            return existingInvoice.id;
        } else {
            // Create new invoice
            const invoiceId = uuidv4();
            await db.insert(invoices).values({
                id: invoiceId,
                ...invoiceData
            });

            logger.info('Created new invoice', {
                invoiceId,
                stripeInvoiceId: stripeInvoice.id,
                userId: user.id,
                status: invoiceData.status
            });

            return invoiceId;
        }
    } catch (error) {
        logger.error('Failed to sync invoice from Stripe', {
            error: error instanceof Error ? error.message : String(error),
            stripeInvoiceId: stripeInvoice.id
        });
        throw error;
    }
}

export async function syncAllUserInvoices(userId: string, stripeCustomerId: string) {
    try {
        logger.info('Syncing all invoices for user', { userId, stripeCustomerId });

        // Fetch all invoices from Stripe
        const stripeInvoices = await stripe.invoices.list({
            customer: stripeCustomerId,
            limit: 100 // Adjust as needed
        });

        logger.info('Found invoices in Stripe', {
            userId,
            stripeCustomerId,
            count: stripeInvoices.data.length
        });

        const syncedInvoiceIds = [];
        for (const stripeInvoice of stripeInvoices.data) {
            try {
                const invoiceId = await syncInvoiceFromStripe(stripeInvoice);
                if (invoiceId) {
                    syncedInvoiceIds.push(invoiceId);
                }
            } catch (error) {
                logger.error('Failed to sync individual invoice', {
                    error: error instanceof Error ? error.message : String(error),
                    stripeInvoiceId: stripeInvoice.id,
                    userId
                });
                // Continue with other invoices
            }
        }

        logger.info('Completed syncing invoices for user', {
            userId,
            stripeCustomerId,
            syncedCount: syncedInvoiceIds.length,
            totalCount: stripeInvoices.data.length
        });

        return syncedInvoiceIds;
    } catch (error) {
        logger.error('Failed to sync all user invoices', {
            error: error instanceof Error ? error.message : String(error),
            userId,
            stripeCustomerId
        });
        throw error;
    }
}