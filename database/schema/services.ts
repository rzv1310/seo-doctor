import {
    sqliteTable,
    text,
    integer,
    real,
} from 'drizzle-orm/sqlite-core';



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
