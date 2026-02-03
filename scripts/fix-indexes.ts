import { createClient } from '@libsql/client';



async function fixSchema() {
    const databaseUrl = process.env.TURSO_DATABASE_URL;
    const authToken = process.env.TURSO_AUTH_TOKEN;

    if (!databaseUrl) {
        console.error('❌ TURSO_DATABASE_URL environment variable is not set');
        process.exit(1);
    }

    const client = createClient({
        url: databaseUrl,
        authToken: authToken,
    });

    try {
        console.log('🔧 Fixing production schema...');

        // The invoices table has a broken foreign key from the legacy schema.
        // We need to recreate it with the correct schema.
        console.log('   Recreating invoices table with correct schema...');

        // Check if there's any data to preserve
        const invoiceCount = await client.execute('SELECT COUNT(*) as count FROM invoices');
        const count = invoiceCount.rows[0].count as number;

        if (count > 0) {
            console.log(`   ⚠️  Found ${count} existing invoices, preserving data...`);

            await client.execute('PRAGMA foreign_keys = OFF');

            // Create new table with correct schema
            await client.execute(`
                CREATE TABLE invoices_new (
                    id TEXT PRIMARY KEY NOT NULL,
                    user_id TEXT NOT NULL REFERENCES users(id),
                    subscription_id TEXT REFERENCES subscriptions(id),
                    stripe_invoice_id TEXT NOT NULL,
                    stripe_customer_id TEXT NOT NULL,
                    number TEXT,
                    status TEXT NOT NULL,
                    currency TEXT NOT NULL DEFAULT 'RON',
                    amount_total INTEGER NOT NULL DEFAULT 0,
                    amount_paid INTEGER NOT NULL DEFAULT 0,
                    amount_remaining INTEGER NOT NULL DEFAULT 0,
                    service_name TEXT,
                    service_id TEXT,
                    billing_name TEXT,
                    billing_company TEXT,
                    billing_vat TEXT,
                    billing_address TEXT,
                    billing_phone TEXT,
                    hosted_invoice_url TEXT,
                    invoice_pdf TEXT,
                    payment_intent_id TEXT,
                    payment_method_id TEXT,
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL DEFAULT '',
                    due_date TEXT,
                    paid_at TEXT,
                    voided_at TEXT,
                    metadata TEXT
                )
            `);

            // Copy data from old table
            await client.execute(`
                INSERT INTO invoices_new (
                    id, user_id, subscription_id, stripe_invoice_id, stripe_customer_id,
                    number, status, currency, amount_total, amount_paid, amount_remaining,
                    service_name, service_id, billing_name, billing_company, billing_vat,
                    billing_address, billing_phone, hosted_invoice_url, invoice_pdf,
                    payment_intent_id, payment_method_id, created_at, updated_at,
                    due_date, paid_at, voided_at, metadata
                )
                SELECT
                    id, user_id, subscription_id, stripe_invoice_id,
                    COALESCE(stripe_customer_id, ''),
                    number, status,
                    COALESCE(currency, 'RON'),
                    COALESCE(amount_total, 0),
                    COALESCE(amount_paid, 0),
                    COALESCE(amount_remaining, 0),
                    service_name, service_id, billing_name, billing_company, billing_vat,
                    billing_address, billing_phone, hosted_invoice_url, invoice_pdf,
                    payment_intent_id, payment_method_id, created_at,
                    COALESCE(updated_at, created_at),
                    due_date, paid_at, voided_at, metadata
                FROM invoices
            `);

            await client.execute('DROP TABLE invoices');
            await client.execute('ALTER TABLE invoices_new RENAME TO invoices');

            await client.execute('PRAGMA foreign_keys = ON');
        } else {
            console.log('   No existing invoices, recreating table from scratch...');

            await client.execute('PRAGMA foreign_keys = OFF');
            await client.execute('DROP TABLE IF EXISTS invoices');
            await client.execute(`
                CREATE TABLE invoices (
                    id TEXT PRIMARY KEY NOT NULL,
                    user_id TEXT NOT NULL REFERENCES users(id),
                    subscription_id TEXT REFERENCES subscriptions(id),
                    stripe_invoice_id TEXT NOT NULL,
                    stripe_customer_id TEXT NOT NULL,
                    number TEXT,
                    status TEXT NOT NULL,
                    currency TEXT NOT NULL DEFAULT 'RON',
                    amount_total INTEGER NOT NULL,
                    amount_paid INTEGER NOT NULL DEFAULT 0,
                    amount_remaining INTEGER NOT NULL DEFAULT 0,
                    service_name TEXT,
                    service_id TEXT,
                    billing_name TEXT,
                    billing_company TEXT,
                    billing_vat TEXT,
                    billing_address TEXT,
                    billing_phone TEXT,
                    hosted_invoice_url TEXT,
                    invoice_pdf TEXT,
                    payment_intent_id TEXT,
                    payment_method_id TEXT,
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL,
                    due_date TEXT,
                    paid_at TEXT,
                    voided_at TEXT,
                    metadata TEXT
                )
            `);
            await client.execute('PRAGMA foreign_keys = ON');
        }

        // Create indexes
        console.log('   Creating indexes...');
        await client.execute(
            'CREATE UNIQUE INDEX IF NOT EXISTS "invoices_stripe_invoice_id_unique" ON "invoices" ("stripe_invoice_id")'
        );

        // Fix subscriptions table
        const subColumnsResult = await client.execute("PRAGMA table_info('subscriptions')");
        const existingSubColumns = new Set(subColumnsResult.rows.map(r => r.name as string));

        if (!existingSubColumns.has('cancelled_at')) {
            console.log('   Adding column: subscriptions.cancelled_at');
            await client.execute('ALTER TABLE subscriptions ADD COLUMN "cancelled_at" TEXT');
        }

        console.log('✅ Schema fixed successfully!');
    } catch (error) {
        console.error('❌ Error fixing schema:', error);
        process.exit(1);
    }

    process.exit(0);
}

fixSchema();
