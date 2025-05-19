import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from './schema';
import 'dotenv/config'; // Ensure environment variables are loaded

// Check for environment variables
const databaseUrl = process.env.DATABASE_URL || process.env.TURSO_DATABASE_URL;
const authToken = process.env.DATABASE_AUTH_TOKEN || process.env.TURSO_AUTH_TOKEN;

if (!databaseUrl) {
  throw new Error('DATABASE_URL or TURSO_DATABASE_URL environment variable is required');
}

// Create a client connection to the database
const client = createClient({
  url: databaseUrl,
  authToken: authToken,
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
  paymentMethods,
  subscriptions
} = schema;