import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from './schema';



const databaseUrl = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!databaseUrl) {
    throw new Error('TURSO_DATABASE_URL environment variable is required');
}

const client = createClient({
    url: databaseUrl,
    authToken: authToken,
});

const database = drizzle(client, { schema });

export default database;

export const {
    users,
    services,
    invoices,
    paymentMethods,
    subscriptions,
    messages
} = schema;
