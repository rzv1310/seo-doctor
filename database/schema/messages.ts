import {
    sqliteTable,
    text,
    integer,
    index,
} from 'drizzle-orm/sqlite-core';
import { users } from './users';



export const messages = sqliteTable(
    'messages',
    {
        id: text('id').notNull().primaryKey(),
        userId: text('user_id').notNull().references(() => users.id),
        content: text('content').notNull(),
        isFromAdmin: integer('is_from_admin', { mode: 'boolean' }).default(false).notNull(),
        isRead: integer('is_read', { mode: 'boolean' }).default(false).notNull(),
        createdAt: text('created_at').notNull(),
        updatedAt: text('updated_at').notNull(),
    },
    (messages) => ([
        index('messageUserIdIdx').on(messages.userId),
        index('messageCreatedAtIdx').on(messages.createdAt),
        index('messageIsReadIdx').on(messages.isRead),
    ]),
);
