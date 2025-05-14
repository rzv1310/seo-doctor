import {
    sqliteTable,
    text,
    integer,
    real,
    uniqueIndex,
} from 'drizzle-orm/sqlite-core';

// Users table
export const users = sqliteTable(
    'users',
    {
        id: text('id').notNull().primaryKey(),
        createdAt: text('created_at').notNull(),
        email: text('email').notNull(),
        name: text('name').notNull(),
        picture: text('picture').notNull(),
        stripeCustomerId: text('stripe_customer_id'),
    },
    (users) => ([
        uniqueIndex('emailIdx').on(users.email),
    ]),
);

// Services table
export const services = sqliteTable(
    'services',
    {
        id: text('id').notNull().primaryKey(),
        name: text('name').notNull(),
        description: text('description').notNull(),
        price: real('price').notNull(),
        createdAt: text('created_at').notNull(),
        isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
    }
);

// Orders table
export const orders = sqliteTable(
    'orders',
    {
        id: text('id').notNull().primaryKey(),
        userId: text('user_id').notNull().references(() => users.id),
        serviceId: text('service_id').notNull().references(() => services.id),
        createdAt: text('created_at').notNull(),
        price: real('price').notNull(),
        status: text('status').notNull(), // 'pending', 'completed', 'cancelled'
        notes: text('notes'),
    }
);

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
