import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import stripe from '@/lib/stripe-server';
import db from '@/database';
import { orders, invoices, subscriptions } from '@/database/schema';
import { eq } from 'drizzle-orm';
import { logger, withLogging } from '@/lib/logger';

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export const POST = withLogging(async (req: NextRequest) => {
  const body = await req.text();
  const signature = headers().get('stripe-signature') || '';

  try {
    if (!endpointSecret) {
      logger.error('Stripe webhook secret not configured');
      return NextResponse.json(
        { error: 'Webhook not configured' },
        { status: 500 }
      );
    }

    const event = stripe.webhooks.constructEvent(body, signature, endpointSecret);
    
    logger.webhook(event, true);

    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as any;
        logger.payment('payment_succeeded', paymentIntent.amount, paymentIntent.currency, paymentIntent.metadata?.userId);

        if (paymentIntent.metadata?.orderId) {
          await db.update(orders)
            .set({ 
              status: 'completed',
              stripePaymentId: paymentIntent.id
            })
            .where(eq(orders.id, paymentIntent.metadata.orderId));
          
          logger.info('Order marked as completed', { 
            orderId: paymentIntent.metadata.orderId,
            paymentIntentId: paymentIntent.id
          });
        }

        if (paymentIntent.metadata?.invoiceId) {
          await db.update(invoices)
            .set({ 
              status: 'paid',
              paidAt: new Date()
            })
            .where(eq(invoices.id, paymentIntent.metadata.invoiceId));
          
          logger.info('Invoice marked as paid', { 
            invoiceId: paymentIntent.metadata.invoiceId,
            paymentIntentId: paymentIntent.id
          });
        }
        break;
      }

      case 'payment_intent.payment_failed': {
        const failedPaymentIntent = event.data.object as any;
        logger.payment('payment_failed', failedPaymentIntent.amount, failedPaymentIntent.currency, failedPaymentIntent.metadata?.userId);

        if (failedPaymentIntent.metadata?.orderId) {
          await db.update(orders)
            .set({ status: 'payment_failed' })
            .where(eq(orders.id, failedPaymentIntent.metadata.orderId));
          
          logger.warn('Order payment failed', { 
            orderId: failedPaymentIntent.metadata.orderId,
            paymentIntentId: failedPaymentIntent.id
          });
        }
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as any;
        logger.info(`Subscription ${event.type.split('.').pop()}`, {
          subscriptionId: subscription.id,
          customerId: subscription.customer,
          status: subscription.status
        });
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as any;
        
        await db.update(subscriptions)
          .set({ 
            status: 'cancelled',
            cancelledAt: new Date()
          })
          .where(eq(subscriptions.stripeSubscriptionId, subscription.id));
        
        logger.info('Subscription cancelled', {
          subscriptionId: subscription.id,
          customerId: subscription.customer
        });
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as any;
        logger.payment('invoice_paid', invoice.amount_paid, invoice.currency, invoice.metadata?.userId);
        
        if (invoice.subscription) {
          logger.info('Subscription invoice paid', {
            invoiceId: invoice.id,
            subscriptionId: invoice.subscription,
            amountPaid: invoice.amount_paid
          });
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as any;
        logger.error('Invoice payment failed', undefined, {
          invoiceId: invoice.id,
          subscriptionId: invoice.subscription,
          attemptCount: invoice.attempt_count,
          nextAttempt: invoice.next_payment_attempt
        });
        break;
      }

      case 'charge.succeeded': {
        const charge = event.data.object as any;
        logger.payment('charge_succeeded', charge.amount, charge.currency, charge.metadata?.userId);
        break;
      }

      case 'charge.failed': {
        const charge = event.data.object as any;
        logger.payment('charge_failed', charge.amount, charge.currency, charge.metadata?.userId);
        break;
      }

      default:
        logger.info('Unhandled webhook event', { eventType: event.type });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    logger.webhook({ type: 'error', id: 'unknown' }, false, error as Error);
    return NextResponse.json(
      { error: 'Webhook error' },
      { status: 400 }
    );
  }
});