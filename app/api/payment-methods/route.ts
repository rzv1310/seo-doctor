import { NextRequest, NextResponse } from 'next/server';
import db from '@/database';
import { users } from '@/database/schema';
import { eq } from 'drizzle-orm';
import { verifyApiAuth } from '@/lib/auth';
import stripe from '@/lib/stripe-server';
import { logger, withLogging } from '@/lib/logger';

export const GET = withLogging(async (request: NextRequest) => {
  try {
    const session = await verifyApiAuth(request);

    if (!session.isAuthenticated || !session.user) {
      logger.warn('Unauthorized payment methods access attempt');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, session.user.id))
      .then((results) => results[0]);

    if (!user) {
      logger.error('User not found', undefined, { userId: session.user.id });
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (!user.stripeCustomerId) {
      logger.info('Creating new Stripe customer', { userId: user.id });
      
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name || undefined,
      });

      await db
        .update(users)
        .set({ stripeCustomerId: customer.id })
        .where(eq(users.id, user.id));

      logger.info('Stripe customer created', { 
        userId: user.id, 
        stripeCustomerId: customer.id 
      });

      return NextResponse.json({ cards: [] });
    }

    const cards = await stripe.customers.listSources(
      user.stripeCustomerId,
      { object: 'card' }
    );

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

    logger.info('Payment methods retrieved', { 
      userId: session.user.id, 
      cardCount: transformedCards.length 
    });

    return NextResponse.json({ cards: transformedCards });
  } catch (error) {
    logger.error('Failed to fetch payment methods', error);
    return NextResponse.json(
      { error: 'Failed to fetch payment methods' },
      { status: 500 }
    );
  }
});

export const POST = withLogging(async (request: NextRequest) => {
  try {
    const session = await verifyApiAuth(request);

    if (!session.isAuthenticated || !session.user) {
      logger.warn('Unauthorized payment method add attempt');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { token, setAsDefault } = body;

    if (!token) {
      logger.warn('Missing card token in request', { userId: session.user.id });
      return NextResponse.json({ error: 'Card token is required' }, { status: 400 });
    }

    logger.info('Adding payment method', { 
      userId: session.user.id, 
      setAsDefault 
    });

    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, session.user.id))
      .then((results) => results[0]);

    if (!user) {
      logger.error('User not found', undefined, { userId: session.user.id });
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    let stripeCustomerId = user.stripeCustomerId;

    if (!stripeCustomerId) {
      logger.info('Creating new Stripe customer for payment method', { userId: user.id });
      
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name || undefined,
      });

      stripeCustomerId = customer.id;

      await db
        .update(users)
        .set({ stripeCustomerId })
        .where(eq(users.id, user.id));

      logger.info('Stripe customer created', { 
        userId: user.id, 
        stripeCustomerId 
      });
    }

    const card = await stripe.customers.createSource(stripeCustomerId, {
      source: token,
    });

    logger.payment('payment_method_added', undefined, undefined, user.id);

    if (setAsDefault) {
      await stripe.customers.update(stripeCustomerId, {
        default_source: card.id,
      });

      await db
        .update(users)
        .set({ defaultPaymentMethodId: card.id })
        .where(eq(users.id, user.id));

      logger.info('Payment method set as default', { 
        userId: user.id, 
        cardId: card.id 
      });
    }

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
    logger.error('Failed to add payment method', error);
    return NextResponse.json(
      { error: 'Failed to add payment method' },
      { status: 500 }
    );
  }
});

export const DELETE = withLogging(async (request: NextRequest) => {
  try {
    const session = await verifyApiAuth(request);

    if (!session.isAuthenticated || !session.user) {
      logger.warn('Unauthorized payment method deletion attempt');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const cardId = searchParams.get('cardId');

    if (!cardId) {
      logger.warn('Missing card ID in deletion request', { userId: session.user.id });
      return NextResponse.json({ error: 'Card ID is required' }, { status: 400 });
    }

    logger.info('Deleting payment method', { 
      userId: session.user.id, 
      cardId 
    });

    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, session.user.id))
      .then((results) => results[0]);

    if (!user || !user.stripeCustomerId) {
      logger.error('User or customer not found', undefined, { userId: session.user.id });
      return NextResponse.json({ error: 'User or customer not found' }, { status: 404 });
    }

    await stripe.customers.deleteSource(user.stripeCustomerId, cardId);

    logger.payment('payment_method_deleted', undefined, undefined, user.id);

    if (user.defaultPaymentMethodId === cardId) {
      await db
        .update(users)
        .set({ defaultPaymentMethodId: null })
        .where(eq(users.id, user.id));

      logger.info('Default payment method cleared', { userId: user.id });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Failed to delete payment method', error);
    return NextResponse.json(
      { error: 'Failed to delete payment method' },
      { status: 500 }
    );
  }
});

export const PATCH = withLogging(async (request: NextRequest) => {
  try {
    const session = await verifyApiAuth(request);

    if (!session.isAuthenticated || !session.user) {
      logger.warn('Unauthorized default payment method update attempt');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { cardId } = body;

    if (!cardId) {
      logger.warn('Missing card ID in update request', { userId: session.user.id });
      return NextResponse.json({ error: 'Card ID is required' }, { status: 400 });
    }

    logger.info('Updating default payment method', { 
      userId: session.user.id, 
      cardId 
    });

    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, session.user.id))
      .then((results) => results[0]);

    if (!user || !user.stripeCustomerId) {
      logger.error('User or customer not found', undefined, { userId: session.user.id });
      return NextResponse.json({ error: 'User or customer not found' }, { status: 404 });
    }

    await stripe.customers.update(user.stripeCustomerId, {
      default_source: cardId,
    });

    await db
      .update(users)
      .set({ defaultPaymentMethodId: cardId })
      .where(eq(users.id, user.id));

    logger.payment('default_payment_method_updated', undefined, undefined, user.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Failed to update default payment method', error);
    return NextResponse.json(
      { error: 'Failed to update default payment method' },
      { status: 500 }
    );
  }
});