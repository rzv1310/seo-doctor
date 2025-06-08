import { createClient } from '@libsql/client';
import * as readline from 'readline';



const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

async function dropDatabase() {
    const databaseUrl = process.env.TURSO_DATABASE_URL;
    const authToken = process.env.TURSO_AUTH_TOKEN;

    if (!databaseUrl) {
        console.error('❌ TURSO_DATABASE_URL environment variable is not set');
        process.exit(1);
    }

    console.log('⚠️  WARNING: This operation will DELETE ALL data in the database!');
    console.log('⚠️  This action is IRREVERSIBLE!');
    console.log('');

    rl.question('To continue, type "DROP DATABASE": ', async (answer) => {
        if (answer === 'DROP DATABASE') {
            try {
                console.log('🗑️  Dropping database...');

                const client = createClient({
                    url: databaseUrl,
                    authToken: authToken,
                });

                // Disable foreign key constraints
                await client.execute('PRAGMA foreign_keys = OFF');

                // Get all tables
                const tables = await client.execute(`
                    SELECT name FROM sqlite_master
                    WHERE type='table'
                    AND name NOT LIKE 'sqlite_%'
                    AND name NOT LIKE '_litestream_%'
                `);

                // Drop each table
                for (const table of tables.rows) {
                    const tableName = table.name as string;
                    console.log(`   Dropping table: ${tableName}`);
                    await client.execute(`DROP TABLE IF EXISTS "${tableName}"`);
                }

                // Re-enable foreign key constraints
                await client.execute('PRAGMA foreign_keys = ON');

                console.log('✅ Database dropped successfully!');
                console.log('');
                console.log('To recreate the database structure, run:');
                console.log('  pnpm db:migrate');

            } catch (error) {
                console.error('❌ Error dropping database:', error);
                process.exit(1);
            }
        } else {
            console.log('❌ Operation cancelled. Input text does not match.');
        }

        rl.close();
        process.exit(0);
    });
}

dropDatabase();
