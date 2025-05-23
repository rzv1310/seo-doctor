import {
    sqliteTable,
    text,
    integer,
    index,
} from 'drizzle-orm/sqlite-core';

// Password reset tokens table
export const passwordResets = sqliteTable(
    'password_resets',
    {
        id: text('id').notNull().primaryKey(),
        userId: text('user_id').notNull(),
        token: text('token').notNull(),
        expiresAt: text('expires_at').notNull(),
        createdAt: text('created_at').notNull(),
        usedAt: text('used_at'), // Track when the token was used
    },
    (passwordResets) => ([
        index('tokenIdx').on(passwordResets.token),
        index('userIdIdx').on(passwordResets.userId),
    ]),
);