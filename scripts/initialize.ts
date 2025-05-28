import { execSync } from 'child_process';
import path from 'path';



const PROJECT_ROOT = process.cwd();

function runCommand(command: string, description: string) {
    console.log(`\n🔄 ${description}...`);
    console.log(`📝 Running: ${command}`);
    
    try {
        execSync(command, {
            cwd: PROJECT_ROOT,
            stdio: 'inherit',
            env: { ...process.env }
        });
        console.log(`✅ ${description} completed successfully!`);
    } catch (error) {
        console.error(`❌ ${description} failed!`);
        console.error(error);
        process.exit(1);
    }
}

async function initialize() {
    console.log('🚀 Starting complete project initialization...\n');
    console.log('This will run the following steps:');
    console.log('1. Generate database schema');
    console.log('2. Run database migrations');
    console.log('3. Generate Stripe products from data/services.ts');
    console.log('4. Seed database with services');
    console.log('\n' + '='.repeat(50));

    try {
        // Step 1: Generate database schema
        runCommand('pnpm db:generate', 'Generating database schema');

        // Step 2: Run database migrations
        runCommand('pnpm db:migrate', 'Running database migrations');

        // Step 3: Generate Stripe products and update .env
        runCommand('pnpm required:generate-stripe', 'Generating Stripe products and updating .env');

        // Step 4: Seed database with services
        runCommand('pnpm required:seed-database', 'Seeding database with services');

        console.log('\n' + '='.repeat(50));
        console.log('🎉 Project initialization completed successfully!');
        console.log('\n📋 What was done:');
        console.log('   ✓ Database schema generated');
        console.log('   ✓ Database migrations applied');
        console.log('   ✓ Stripe products created and .env updated');
        console.log('   ✓ Database seeded with services from data/services.ts');
        console.log('\n🚀 Your project is now ready to run!');
        console.log('💡 Run `pnpm dev` to start the development server.');
        console.log('\n⚠️  Remember to:');
        console.log('   • Add the Stripe environment variables to your production environment');
        console.log('   • Verify your .env file contains all required variables');

    } catch (error) {
        console.error('\n💥 Initialization failed:', error);
        process.exit(1);
    }
}

// Run initialization if this file is executed directly
if (require.main === module) {
    initialize()
        .then(() => {
            process.exit(0);
        })
        .catch((error) => {
            console.error('💥 Initialization failed:', error);
            process.exit(1);
        });
}

export default initialize;