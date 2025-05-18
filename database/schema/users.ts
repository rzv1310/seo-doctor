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
        stripeCustomerId: text('stripe_customer_id'),
    },
    (users) => ([
        uniqueIndex('emailIdx').on(users.email),
    ]),
);