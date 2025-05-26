import db from '../database';
import { services } from '../database/schema/services';
import { eq } from 'drizzle-orm';


async function seedStripeServices() {
    try {
        console.log('Seeding Stripe services...');

        // Define our two main services
        const stripeServices = [
            {
                id: '1', // Using string IDs to match schema
                name: 'GMB MAX',
                description: 'GARANTAT TOP 3 ÎN GOOGLE MAPS',
                price: 100000, // €1000 in cents
            },
            {
                id: '2',
                name: 'GOOGLE ORGANIC',
                description: 'GARANTAT TOP 3 ÎN REZULTATELE GOOGLE',
                price: 100000, // €1000 in cents
            },
        ];

        for (const service of stripeServices) {
            // Check if service exists
            const existing = await db
                .select()
                .from(services)
                .where(eq(services.id, service.id))
                .limit(1);

            if (existing.length > 0) {
                console.log(`Service ${service.name} already exists, updating...`);
                await db
                    .update(services)
                    .set({
                        name: service.name,
                        description: service.description,
                        price: service.price,
                        isActive: true,
                    })
                    .where(eq(services.id, service.id));
            } else {
                console.log(`Creating service ${service.name}...`);
                await db.insert(services).values({
                    ...service,
                    createdAt: new Date().toISOString(),
                    isActive: true,
                });
            }
        }

        console.log('Stripe services seeded successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding Stripe services:', error);
        process.exit(1);
    }
}

seedStripeServices();
