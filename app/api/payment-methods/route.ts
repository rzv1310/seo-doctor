import { NextRequest, NextResponse } from 'next/server';
import db from '@/database';
import { users } from '@/database/schema';
import { eq } from 'drizzle-orm';
import { verifyApiAuth } from '@/lib/auth';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-01-27.acacia',
});

export async function GET(request: NextRequest) {
  try {
    const session = await verifyApiAuth(request);

    if (!session.isAuthenticated || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's Stripe customer ID
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, session.user.id))
      .then((results) => results[0]);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (!user.stripeCustomerId) {
      // Create a Stripe customer if one doesn't exist
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name || undefined,
      });

      // Update user with Stripe customer ID
      await db
        .update(users)
        .set({ stripeCustomerId: customer.id })
        .where(eq(users.id, user.id));

      // Return empty cards array for new customer
      return NextResponse.json({ cards: [] });
    }

    // Fetch cards from Stripe
    const cards = await stripe.customers.listSources(
      user.stripeCustomerId,
      { object: 'card' }
    );

    // Transform the cards data to match our frontend format
    const transformedCards = cards.data.map((card: any) => ({
      id: card.id,
      brand: card.brand.toLowerCase(),
      last4: card.last4,
      expMonth: card.exp_month,
      expYear: card.exp_year,
      isDefault: card.id === user.defaultPaymentMethodId,
      funding: card.funding,
      country: card.country,
    }));

    return NextResponse.json({ cards: transformedCards });
  } catch (error) {
    console.error('Error fetching payment methods:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payment methods' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await verifyApiAuth(request);

    if (!session.isAuthenticated || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { token, setAsDefault } = body;

    if (!token) {
      return NextResponse.json({ error: 'Card token is required' }, { status: 400 });
    }

    // Get user's Stripe customer ID
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, session.user.id))
      .then((results) => results[0]);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    let stripeCustomerId = user.stripeCustomerId;

    // Create a Stripe customer if one doesn't exist
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name || undefined,
      });

      stripeCustomerId = customer.id;

      // Update user with Stripe customer ID
      await db
        .update(users)
        .set({ stripeCustomerId })
        .where(eq(users.id, user.id));
    }

    // Add the card to the customer
    const card = await stripe.customers.createSource(stripeCustomerId, {
      source: token,
    });

    // Set as default if requested
    if (setAsDefault) {
      await stripe.customers.update(stripeCustomerId, {
        default_source: card.id,
      });

      // Update user's default payment method ID
      await db
        .update(users)
        .set({ defaultPaymentMethodId: card.id })
        .where(eq(users.id, user.id));
    }

    // Return the new card
    return NextResponse.json({
      card: {
        id: card.id,
        brand: (card as any).brand.toLowerCase(),
        last4: (card as any).last4,
        expMonth: (card as any).exp_month,
        expYear: (card as any).exp_year,
        isDefault: setAsDefault,
        funding: (card as any).funding,
        country: (card as any).country,
      },
    });
  } catch (error) {
    console.error('Error adding payment method:', error);
    return NextResponse.json(
      { error: 'Failed to add payment method' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await verifyApiAuth(request);

    if (!session.isAuthenticated || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const cardId = searchParams.get('cardId');

    if (!cardId) {
      return NextResponse.json({ error: 'Card ID is required' }, { status: 400 });
    }

    // Get user's Stripe customer ID
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, session.user.id))
      .then((results) => results[0]);

    if (!user || !user.stripeCustomerId) {
      return NextResponse.json({ error: 'User or customer not found' }, { status: 404 });
    }

    // Delete the card from Stripe
    await stripe.customers.deleteSource(user.stripeCustomerId, cardId);

    // If this was the default payment method, clear it
    if (user.defaultPaymentMethodId === cardId) {
      await db
        .update(users)
        .set({ defaultPaymentMethodId: null })
        .where(eq(users.id, user.id));
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting payment method:', error);
    return NextResponse.json(
      { error: 'Failed to delete payment method' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await verifyApiAuth(request);

    if (!session.isAuthenticated || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { cardId } = body;

    if (!cardId) {
      return NextResponse.json({ error: 'Card ID is required' }, { status: 400 });
    }

    // Get user's Stripe customer ID
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, session.user.id))
      .then((results) => results[0]);

    if (!user || !user.stripeCustomerId) {
      return NextResponse.json({ error: 'User or customer not found' }, { status: 404 });
    }

    // Update default source in Stripe
    await stripe.customers.update(user.stripeCustomerId, {
      default_source: cardId,
    });

    // Update user's default payment method ID
    await db
      .update(users)
      .set({ defaultPaymentMethodId: cardId })
      .where(eq(users.id, user.id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating default payment method:', error);
    return NextResponse.json(
      { error: 'Failed to update default payment method' },
      { status: 500 }
    );
  }
}