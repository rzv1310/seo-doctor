import {
    sqliteTable,
    text,
    integer,
    uniqueIndex,
} from 'drizzle-orm/sqlite-core';



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
        billingRegistrationNumber: text('billing_registration_number'),
        billingAddress: text('billing_address'),
        billingPhone: text('billing_phone'),
        stripeCustomerId: text('stripe_customer_id'),
        defaultPaymentMethodId: text('default_payment_method_id'),
        admin: integer('admin', { mode: 'boolean' }).default(false),
    },
    (users) => ([
        uniqueIndex('emailIdx').on(users.email),
    ]),
);
