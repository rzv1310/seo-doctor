import {
    sqliteTable,
    text,
    integer,
    real,
} from 'drizzle-orm/sqlite-core';
import { users } from './users';
import { services } from './services';



export const subscriptions = sqliteTable(
    'subscriptions',
    {
        id: text('id').notNull().primaryKey(),
        userId: text('user_id').notNull().references(() => users.id),
        serviceId: text('service_id').notNull().references(() => services.id),
        status: text('status').notNull(), // 'active', 'trial', 'inactive', 'cancelled', 'pending_payment'
        startDate: text('start_date').notNull(),
        endDate: text('end_date'), // null for ongoing subscriptions
        trialEndDate: text('trial_end_date'), // null if no trial
        renewalDate: text('renewal_date'), // next renewal date
        cancelledAt: text('cancelled_at'), // when subscription was cancelled
        price: real('price').notNull(), // price at time of subscription
        usage: integer('usage').default(0), // usage metrics percentage (0-100)
        stripeSubscriptionId: text('stripe_subscription_id'),
        metadata: text('metadata'), // JSON string for additional data
        createdAt: text('created_at').notNull(),
        updatedAt: text('updated_at').notNull(),
    }
);
