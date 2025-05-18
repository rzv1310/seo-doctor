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
        name: text('name').notNull(),
        picture: text('picture').notNull(),
        stripeCustomerId: text('stripe_customer_id'),
    },
    (users) => ([
        uniqueIndex('emailIdx').on(users.email),
    ]),
);