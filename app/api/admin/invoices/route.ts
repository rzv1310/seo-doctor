import { NextRequest, NextResponse } from 'next/server';
import { eq, isNotNull } from 'drizzle-orm';

import database, { users } from '@/database';
import { verifyApiAuth } from '@/lib/auth';
import { logger, withLogging } from '@/lib/logger';
import stripe from '@/lib/stripe-server';



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

        logger.info('Admin fetching invoices from Stripe', { 
            adminId: session.user.id, 
            page, 
            limit, 
            userId: userId || undefined, 
            status: status || undefined 
        });

        // If userId is provided, fetch that user's invoices
        if (userId) {
            const [user] = await database
                .select({ stripeCustomerId: users.stripeCustomerId, email: users.email, name: users.name })
                .from(users)
                .where(eq(users.id, userId))
                .limit(1);

            if (!user?.stripeCustomerId) {
                logger.info('No Stripe customer ID found for specified user', { userId });
                return NextResponse.json({
                    invoices: [],
                    pagination: {
                        page,
                        limit,
                        totalItems: 0,
                        totalPages: 0
                    }
                });
            }

            // Fetch invoices from Stripe for specific user
            const stripeInvoices = await stripe.invoices.list({
                customer: user.stripeCustomerId,
                limit: limit,
                status: status as any // Filter by status if provided
            });

            // Transform Stripe invoices
            const invoices = stripeInvoices.data.map(invoice => {
                const serviceName = invoice.lines.data[0]?.description || 'Unknown Service';
                
                return {
                    id: invoice.id,
                    userId: userId,
                    userName: user.name,
                    userEmail: user.email,
                    orderId: null,
                    createdAt: new Date(invoice.created * 1000).toISOString(),
                    dueDate: invoice.due_date ? new Date(invoice.due_date * 1000).toISOString() : null,
                    amount: invoice.total,
                    status: invoice.status === 'paid' ? 'paid' : 
                            invoice.status === 'open' ? 'pending' : 
                            invoice.status === 'uncollectible' ? 'cancelled' : 
                            invoice.status === 'void' ? 'void' : 'pending',
                    stripeInvoiceId: invoice.id,
                    orderServiceId: null,
                    serviceName: serviceName,
                    number: invoice.number,
                    currency: invoice.currency,
                    hostedInvoiceUrl: invoice.hosted_invoice_url,
                    invoicePdf: invoice.invoice_pdf,
                    subscriptionId: typeof invoice.subscription === 'string' ? invoice.subscription : invoice.subscription?.id
                };
            });

            return NextResponse.json({
                invoices: invoices,
                pagination: {
                    page,
                    limit,
                    totalItems: invoices.length,
                    totalPages: stripeInvoices.has_more ? page + 1 : page
                },
                hasMore: stripeInvoices.has_more
            });
        } else {
            // Fetch all users with Stripe customer IDs
            const allUsers = await database
                .select({ 
                    id: users.id, 
                    stripeCustomerId: users.stripeCustomerId,
                    email: users.email,
                    name: users.name
                })
                .from(users)
                .where(isNotNull(users.stripeCustomerId));

            logger.info('Found users with Stripe customer IDs', { count: allUsers.length });

            // Fetch invoices for all customers
            const allInvoices = [];
            const starting_after = url.searchParams.get('starting_after');

            const stripeInvoices = await stripe.invoices.list({
                limit: limit,
                status: status as any,
                starting_after: starting_after || undefined
            });

            // Map user data for quick lookup
            const userMap = new Map(allUsers.map(u => [u.stripeCustomerId, u]));

            // Transform and filter invoices to only include our users
            for (const invoice of stripeInvoices.data) {
                const customerId = typeof invoice.customer === 'string' ? invoice.customer : invoice.customer?.id;
                const user = customerId ? userMap.get(customerId) : null;
                
                if (user) {
                    const serviceName = invoice.lines.data[0]?.description || 'Unknown Service';
                    
                    allInvoices.push({
                        id: invoice.id,
                        userId: user.id,
                        userName: user.name,
                        userEmail: user.email,
                        orderId: null,
                        createdAt: new Date(invoice.created * 1000).toISOString(),
                        dueDate: invoice.due_date ? new Date(invoice.due_date * 1000).toISOString() : null,
                        amount: invoice.total,
                        status: invoice.status === 'paid' ? 'paid' : 
                                invoice.status === 'open' ? 'pending' : 
                                invoice.status === 'uncollectible' ? 'cancelled' : 
                                invoice.status === 'void' ? 'void' : 'pending',
                        stripeInvoiceId: invoice.id,
                        orderServiceId: null,
                        serviceName: serviceName,
                        number: invoice.number,
                        currency: invoice.currency,
                        hostedInvoiceUrl: invoice.hosted_invoice_url,
                        invoicePdf: invoice.invoice_pdf,
                        subscriptionId: typeof invoice.subscription === 'string' ? invoice.subscription : invoice.subscription?.id
                    });
                }
            }

            logger.info('Admin invoices fetched successfully', {
                adminId: session.user.id,
                count: allInvoices.length,
                hasMore: stripeInvoices.has_more
            });

            return NextResponse.json({
                invoices: allInvoices,
                pagination: {
                    page,
                    limit,
                    totalItems: allInvoices.length,
                    totalPages: stripeInvoices.has_more ? page + 1 : page
                },
                hasMore: stripeInvoices.has_more,
                lastInvoiceId: allInvoices.length > 0 ? allInvoices[allInvoices.length - 1].id : null
            });
        }
    } catch (error) {
        logger.error('Error fetching admin invoices from Stripe', { error: error instanceof Error ? error.message : String(error) });
        return NextResponse.json({ error: 'Failed to fetch invoices' }, { status: 500 });
    }
});