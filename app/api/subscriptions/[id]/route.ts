import { NextRequest, NextResponse } from 'next/server';
import { eq, and } from 'drizzle-orm';
import { cookies } from 'next/headers';
import { v4 as uuidv4 } from 'uuid';
import database, { subscriptions, services, orders, invoices } from '@/database';
import { verifyAuth } from '@/utils/auth';

// POST /api/subscriptions/[id] - Subscribe to a service
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get the current user from the auth cookie
    const userId = await verifyAuth(cookies());
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const serviceId = params.id;
    
    // Check if service exists
    const service = await database.query.services.findFirst({
      where: eq(services.id, serviceId),
    });

    if (!service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }

    // Check if user already has an active subscription to this service
    const existingSubscription = await database.query.subscriptions.findFirst({
      where: and(
        eq(subscriptions.userId, userId),
        eq(subscriptions.serviceId, serviceId),
        eq(subscriptions.status, 'active')
      ),
    });

    if (existingSubscription) {
      return NextResponse.json({ 
        error: 'You already have an active subscription to this service' 
      }, { status: 400 });
    }

    // Get subscription details from request body
    const body = await request.json();
    const { planType = 'monthly' } = body;

    // Calculate dates
    const now = new Date();
    const startDate = now.toISOString();
    
    // Set renewal date to one month from now for monthly plans
    const renewalDate = new Date(now);
    renewalDate.setMonth(renewalDate.getMonth() + 1);

    // Create new subscription
    const newSubscription = await database.insert(subscriptions).values({
      id: uuidv4(),
      userId,
      serviceId,
      status: 'active',
      startDate,
      renewalDate: renewalDate.toISOString(),
      price: service.price,
      usage: 0,
      createdAt: startDate,
      updatedAt: startDate,
    }).returning();

    // Create an order record for this subscription
    const orderId = uuidv4();
    await database.insert(orders).values({
      id: orderId,
      userId,
      serviceId,
      createdAt: startDate,
      price: service.price,
      status: 'completed', // Order is immediately completed since it's a subscription
      notes: `Initial subscription order for ${service.name}. Subscription ID: ${newSubscription[0].id}`,
    });

    // Set due date to 14 days from now
    const dueDate = new Date(now);
    dueDate.setDate(dueDate.getDate() + 14);

    // Create an invoice for this order
    const invoiceId = uuidv4();
    await database.insert(invoices).values({
      id: invoiceId,
      userId,
      orderId,
      createdAt: startDate,
      dueDate: dueDate.toISOString(),
      amount: service.price,
      status: 'paid', // Invoice is paid immediately for simplicity
      stripeInvoiceId: null,
    });

    return NextResponse.json({ 
      subscription: newSubscription[0],
      orderId,
      invoiceId,
      message: 'Successfully subscribed to service'
    });
  } catch (error) {
    console.error('Error subscribing to service:', error);
    return NextResponse.json({ error: 'Failed to subscribe to service' }, { status: 500 });
  }
}

// PUT /api/subscriptions/[id] - Update subscription (e.g., cancel)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get the current user from the auth cookie
    const userId = await verifyAuth(cookies());
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const subscriptionId = params.id;
    
    // Check if subscription exists and belongs to user
    const existingSubscription = await database.query.subscriptions.findFirst({
      where: and(
        eq(subscriptions.id, subscriptionId),
        eq(subscriptions.userId, userId)
      ),
    });

    if (!existingSubscription) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
    }

    // Get update details from request body
    const body = await request.json();
    const { status, cancelReason } = body;

    const now = new Date().toISOString();

    // Update subscription
    const updatedSubscription = await database
      .update(subscriptions)
      .set({ 
        status: status || existingSubscription.status,
        cancelledAt: status === 'cancelled' ? now : existingSubscription.cancelledAt,
        metadata: status === 'cancelled' ? 
          JSON.stringify({ ...JSON.parse(existingSubscription.metadata || '{}'), cancelReason }) : 
          existingSubscription.metadata,
        updatedAt: now,
      })
      .where(eq(subscriptions.id, subscriptionId))
      .returning();

    return NextResponse.json({ 
      subscription: updatedSubscription[0],
      message: status === 'cancelled' ? 'Subscription cancelled successfully' : 'Subscription updated successfully'
    });
  } catch (error) {
    console.error('Error updating subscription:', error);
    return NextResponse.json({ error: 'Failed to update subscription' }, { status: 500 });
  }
}