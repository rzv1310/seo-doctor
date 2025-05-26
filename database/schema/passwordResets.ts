import {
    sqliteTable,
    text,
    index,
} from 'drizzle-orm/sqlite-core';



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
