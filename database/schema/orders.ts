import {
    sqliteTable,
    text,
    real,
} from 'drizzle-orm/sqlite-core';
import { users } from './users';
import { services } from './services';

// Orders table
export const orders = sqliteTable(
    'orders',
    {
        id: text('id').notNull().primaryKey(),
        userId: text('user_id').notNull().references(() => users.id),
        serviceId: text('service_id').notNull().references(() => services.id),
        createdAt: text('created_at').notNull(),
        price: real('price').notNull(),
        status: text('status').notNull(), // 'pending', 'paid', 'completed', 'cancelled'
        notes: text('notes'),
        stripePaymentId: text('stripe_payment_id'),
    }
);