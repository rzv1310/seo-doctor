import db from '@/database';
import { services as servicesSchema } from '@/database/schema';
import { services } from '@/data/services';
import { eq } from 'drizzle-orm';



async function seedDatabase() {
    console.log('🌱 Starting database seeding from data/services.ts...\n');

    try {
        console.log('📋 Seeding services...');
        
        for (const service of services) {
            // Check if service already exists
            const [existingService] = await db
                .select()
                .from(servicesSchema)
                .where(eq(servicesSchema.id, service.id.toString()))
                .limit(1);

            if (existingService) {
                console.log(`   ✓ Service "${service.name}" already exists (ID: ${service.id})`);
                continue;
            }

            // Insert new service
            await db.insert(servicesSchema).values({
                id: service.id.toString(),
                name: service.name,
                description: service.description,
                price: service.priceValue, // Store price in cents
                createdAt: new Date().toISOString(),
                isActive: true,
            });

            console.log(`   ✓ Created service: ${service.name} (ID: ${service.id}, Price: ${service.priceValue} cents)`);
        }

        console.log('\n✅ Database seeding completed successfully!');
        console.log(`📊 Total services seeded: ${services.length}`);
        
        // Summary of what was seeded
        console.log('\n📝 Services in database:');
        services.forEach(service => {
            console.log(`   • ${service.name} (ID: ${service.id}) - ${service.price}`);
        });

    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
}

// Run the seeding if this file is executed directly
if (require.main === module) {
    seedDatabase()
        .then(() => {
            console.log('\n🎉 Database seeding finished successfully!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('💥 Database seeding failed:', error);
            process.exit(1);
        });
}

export default seedDatabase;