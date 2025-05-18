import {
    sqliteTable,
    text,
    real,
} from 'drizzle-orm/sqlite-core';
import { users } from './users';
import { orders } from './orders';

// Invoices table
export const invoices = sqliteTable(
    'invoices',
    {
        id: text('id').notNull().primaryKey(),
        userId: text('user_id').notNull().references(() => users.id),
        orderId: text('order_id').references(() => orders.id),
        createdAt: text('created_at').notNull(),
        dueDate: text('due_date').notNull(),
        amount: real('amount').notNull(),
        status: text('status').notNull(), // 'paid', 'unpaid', 'overdue'
        stripeInvoiceId: text('stripe_invoice_id'),
    }
);