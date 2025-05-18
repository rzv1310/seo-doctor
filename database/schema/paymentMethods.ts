import {
    sqliteTable,
    text,
    integer,
} from 'drizzle-orm/sqlite-core';
import { users } from './users';

// Payment methods table
export const paymentMethods = sqliteTable(
    'payment_methods',
    {
        id: text('id').notNull().primaryKey(),
        userId: text('user_id').notNull().references(() => users.id),
        type: text('type').notNull(), // 'card', 'bank_account', etc.
        lastFour: text('last_four').notNull(),
        expiryMonth: integer('expiry_month'),
        expiryYear: integer('expiry_year'),
        isDefault: integer('is_default', { mode: 'boolean' }).notNull().default(false),
        stripePaymentMethodId: text('stripe_payment_method_id'),
    }
);