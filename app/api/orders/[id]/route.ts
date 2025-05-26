import { NextRequest, NextResponse } from 'next/server';
import { eq, and } from 'drizzle-orm';
import database, { orders, services } from '@/database';
import { verifyApiAuth } from '@/lib/auth';
import { logger, withLogging } from '@/lib/logger';

export const GET = withLogging(async (
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) => {
    try {
        const session = await verifyApiAuth(request);

        if (!session.isAuthenticated) {
            logger.auth('Unauthorized access attempt to order', { path: request.url });
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const orderId = (await params).id;
        logger.info('Fetching order', { orderId, userId: session.user.id });

        try {
            // Get the order with basic information first
            const result = await database
                .select({
                    id: orders.id,
                    userId: orders.userId,
                    serviceId: orders.serviceId,
                    createdAt: orders.createdAt,
                    price: orders.price,
                    status: orders.status,
                    notes: orders.notes
                })
                .from(orders)
                .where(and(
                    eq(orders.id, orderId),
                    eq(orders.userId, session.user.id)
                ));

            if (!result || result.length === 0) {
                logger.warn('Order not found', { orderId, userId: session.user.id });
                return NextResponse.json({ error: 'Order not found' }, { status: 404 });
            }

            const order = result[0];

            // Get service information separately
            let serviceName = "Unknown Service";
            let serviceDescription = "No description available";

            if (order.serviceId) {
                const serviceResult = await database
                    .select({
                        name: services.name,
                        description: services.description
                    })
                    .from(services)
                    .where(eq(services.id, order.serviceId));

                if (serviceResult && serviceResult.length > 0) {
                    serviceName = serviceResult[0].name || serviceName;
                    serviceDescription = serviceResult[0].description || serviceDescription;
                }
            }

            const completeOrder = {
                ...order,
                serviceName,
                serviceDescription
            };

            logger.info('Order fetched successfully', { orderId, userId: session.user.id });
            return NextResponse.json({ order: completeOrder });
        } catch (error) {
            logger.error('Error processing order data', { orderId, error: error instanceof Error ? error.message : String(error) });
            return NextResponse.json({ error: 'Failed to process order data' }, { status: 500 });
        }
    } catch (error) {
        logger.error('Error fetching order', { error: error instanceof Error ? error.message : String(error) });
        return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 });
    }
});
