import { NextRequest, NextResponse } from 'next/server';
import { eq, desc, and, sql } from 'drizzle-orm';

import database, { users, invoices } from '@/database';
import { verifyApiAuth } from '@/lib/auth';
import { logger, withLogging } from '@/lib/logger';
import stripe from '@/lib/stripe-server';
import { syncInvoiceFromStripe } from '@/lib/invoice-sync';



export const GET = withLogging(async (request: NextRequest) => {
    try {
        const session = await verifyApiAuth(request);

        if (!session.isAuthenticated || !session.user.admin) {
            logger.auth('Unauthorized access attempt to admin invoices', { 
                path: '/api/admin/invoices',
                userId: session.user?.id,
                isAdmin: session.user?.admin 
            });
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const url = new URL(request.url);
        const page = parseInt(url.searchParams.get('page') || '1');
        const limit = parseInt(url.searchParams.get('limit') || '20');
        const userId = url.searchParams.get('userId'); // Optional filter by user
        const status = url.searchParams.get('status'); // Optional filter by status

        logger.info('Admin fetching invoices', { 
            adminId: session.user.id, 
            page, 
            limit, 
            userId: userId || undefined, 
            status: status || undefined 
        });

        const offset = (page - 1) * limit;

        // Build query conditions
        const conditions = [];
        if (userId) {
            conditions.push(eq(invoices.userId, userId));
        }
        if (status) {
            conditions.push(eq(invoices.status, status));
        }

        // Fetch invoices from local database
        const query = database
            .select({
                invoice: invoices,
                user: {
                    id: users.id,
                    name: users.name,
                    email: users.email
                }
            })
            .from(invoices)
            .leftJoin(users, eq(invoices.userId, users.id))
            .orderBy(desc(invoices.createdAt))
            .limit(limit)
            .offset(offset);

        if (conditions.length > 0) {
            query.where(and(...conditions));
        }

        const invoiceResults = await query;

        // Get total count for pagination
        const countQuery = database
            .select({ count: sql<number>`count(*)` })
            .from(invoices);

        if (conditions.length > 0) {
            countQuery.where(and(...conditions));
        }

        const [countResult] = await countQuery;
        const totalItems = countResult?.count || 0;
        const totalPages = Math.ceil(totalItems / limit);

        // If requested, sync recent invoices from Stripe for the filtered user
        if (userId) {
            const [user] = await database
                .select({ stripeCustomerId: users.stripeCustomerId })
                .from(users)
                .where(eq(users.id, userId))
                .limit(1);

            if (user?.stripeCustomerId) {
                try {
                    const recentStripeInvoices = await stripe.invoices.list({
                        customer: user.stripeCustomerId,
                        limit: 10
                    });

                    for (const stripeInvoice of recentStripeInvoices.data) {
                        await syncInvoiceFromStripe(stripeInvoice);
                    }

                    logger.info('Synced recent invoices from Stripe for user', {
                        userId,
                        count: recentStripeInvoices.data.length
                    });
                } catch (syncError) {
                    logger.error('Failed to sync invoices from Stripe', {
                        error: syncError instanceof Error ? syncError.message : String(syncError),
                        userId
                    });
                }
            }
        }

        // Format invoices
        const formattedInvoices = invoiceResults.map(result => ({
            id: result.invoice.id,
            userId: result.invoice.userId,
            userName: result.user?.name || 'Unknown User',
            userEmail: result.user?.email || 'Unknown Email',
            subscriptionId: result.invoice.subscriptionId,
            stripeInvoiceId: result.invoice.stripeInvoiceId,
            stripeCustomerId: result.invoice.stripeCustomerId,
            createdAt: result.invoice.createdAt,
            dueDate: result.invoice.dueDate,
            paidAt: result.invoice.paidAt,
            amount: result.invoice.amountTotal, // For backward compatibility
            amountTotal: result.invoice.amountTotal,
            amountPaid: result.invoice.amountPaid,
            amountRemaining: result.invoice.amountRemaining,
            status: result.invoice.status,
            number: result.invoice.number,
            currency: result.invoice.currency,
            serviceName: result.invoice.serviceName,
            serviceId: result.invoice.serviceId,
            hostedInvoiceUrl: result.invoice.hostedInvoiceUrl,
            invoicePdf: result.invoice.invoicePdf,
            billingName: result.invoice.billingName,
            billingCompany: result.invoice.billingCompany
        }));

        logger.info('Admin invoices fetched successfully', {
            adminId: session.user.id,
            count: formattedInvoices.length,
            totalItems
        });

        return NextResponse.json({
            invoices: formattedInvoices,
            pagination: {
                page,
                limit,
                totalItems,
                totalPages
            },
            hasMore: page < totalPages
        });
    } catch (error) {
        logger.error('Error fetching admin invoices', { 
            error: error instanceof Error ? error.message : String(error) 
        });
        return NextResponse.json({ error: 'Failed to fetch invoices' }, { status: 500 });
    }
});