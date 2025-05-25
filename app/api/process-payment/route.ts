import { NextRequest, NextResponse } from 'next/server';
import db from '@/database';
import { users, orders } from '@/database/schema';
import { eq } from 'drizzle-orm';
import { verifyApiAuth } from '@/lib/auth';
import stripe from '@/lib/stripe-server';

export async function POST(request: NextRequest) {
  try {
    const session = await verifyApiAuth(request);

    if (!session.isAuthenticated || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { 
      amount, // Amount in cents
      currency = 'usd',
      description,
      orderId,
      cardId, // Optional - if not provided, uses default card
      metadata = {}
    } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    // Get user's Stripe customer ID and default payment method
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, session.user.id))
      .then((results) => results[0]);

    if (!user || !user.stripeCustomerId) {
      return NextResponse.json({ error: 'No payment methods found' }, { status: 400 });
    }

    // Determine which card to use
    const sourceId = cardId || user.defaultPaymentMethodId;
    
    if (!sourceId) {
      return NextResponse.json({ error: 'No payment method selected' }, { status: 400 });
    }

    // Create the charge
    const charge = await stripe.charges.create({
      amount,
      currency,
      customer: user.stripeCustomerId,
      source: sourceId,
      description: description || `Payment for order ${orderId}`,
      metadata: {
        userId: user.id,
        orderId: orderId || '',
        ...metadata
      }
    });

    // Update order if orderId is provided
    if (orderId) {
      await db
        .update(orders)
        .set({ 
          status: 'paid',
          stripePaymentId: charge.id
        })
        .where(eq(orders.id, orderId));
    }

    return NextResponse.json({
      success: true,
      chargeId: charge.id,
      amount: charge.amount,
      currency: charge.currency,
      status: charge.status,
      last4: (charge.source as any)?.last4,
      brand: (charge.source as any)?.brand
    });

  } catch (error) {
    console.error('Error processing payment:', error);
    
    // Handle Stripe errors
    if (error instanceof Error && 'type' in error) {
      const stripeError = error as any;
      return NextResponse.json(
        { 
          error: stripeError.message,
          type: stripeError.type,
          code: stripeError.code
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to process payment' },
      { status: 500 }
    );
  }
}

// Get saved payment methods for checkout
export async function GET(request: NextRequest) {
  try {
    const session = await verifyApiAuth(request);

    if (!session.isAuthenticated || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's payment methods
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, session.user.id))
      .then((results) => results[0]);

    if (!user || !user.stripeCustomerId) {
      return NextResponse.json({ cards: [] });
    }

    // Fetch cards from Stripe
    const cards = await stripe.customers.listSources(
      user.stripeCustomerId,
      { object: 'card' }
    );

    // Transform and return cards
    const paymentMethods = cards.data.map((card: any) => ({
      id: card.id,
      brand: card.brand,
      last4: card.last4,
      expMonth: card.exp_month,
      expYear: card.exp_year,
      isDefault: card.id === user.defaultPaymentMethodId
    }));

    return NextResponse.json({ 
      cards: paymentMethods,
      defaultCardId: user.defaultPaymentMethodId 
    });

  } catch (error) {
    console.error('Error fetching payment methods:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payment methods' },
      { status: 500 }
    );
  }
}