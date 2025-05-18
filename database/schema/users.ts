import {
    sqliteTable,
    text,
    uniqueIndex,
} from 'drizzle-orm/sqlite-core';

// Users table
export const users = sqliteTable(
    'users',
    {
        id: text('id').notNull().primaryKey(),
        createdAt: text('created_at').notNull(),
        email: text('email').notNull(),
        password: text('password').notNull(), // Hashed password
        name: text('name').notNull(),
        picture: text('picture'),
        billingName: text('billing_name'),
        billingCompany: text('billing_company'),
        billingVat: text('billing_vat'),
        billingAddress: text('billing_address'),
        billingPhone: text('billing_phone'),
        stripeCustomerId: text('stripe_customer_id'),
    },
    (users) => ([
        uniqueIndex('emailIdx').on(users.email),
    ]),
);