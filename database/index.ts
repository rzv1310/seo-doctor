import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';

import * as schema from './schema';

// Create a client connection to the database
const client = createClient({
    url: process.env.DATABASE_URL!,
    authToken: process.env.DATABASE_AUTH_TOKEN!,
});

// Initialize the database with all our schemas
const database = drizzle(client, { schema });

// Export the database instance
export default database;

// Also export schemas for easier access
export const {
    users,
    services,
    orders,
    invoices,
    paymentMethods
} = schema;