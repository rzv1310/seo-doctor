import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';

import db from '../database';
import { services } from '../database/schema/services';
import { users } from '../database/schema/users';
import { subscriptions } from '../database/schema/subscriptions';
// Orders table removed - using invoices instead
import { invoices } from '../database/schema/invoices';



// Sample services to seed
const servicesList = [
    {
        name: 'SEO Basic',
        description: 'Essential SEO services for small websites',
        price: 29.99
    },
    {
        name: 'SEO Pro',
        description: 'Advanced SEO optimization for growing businesses',
        price: 59.99
    },
    {
        name: 'SEO Enterprise',
        description: 'Comprehensive SEO services for large organizations',
        price: 129.99
    },
    {
        name: 'Content Marketing Basic',
        description: 'Content strategy and creation for small businesses',
        price: 49.99
    },
    {
        name: 'Content Marketing Pro',
        description: 'Advanced content marketing with analytics',
        price: 89.99
    }
];

// Generate a random date within the last X months
function getRandomDateInPast(monthsAgo: number): Date {
    const date = new Date();
    const randomDays = Math.floor(Math.random() * (monthsAgo * 30));
    date.setDate(date.getDate() - randomDays);
    return date;
}

// Function to add days to a date
function addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}

// Function to hash password
async function hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(12);
    return bcrypt.hash(password, salt);
}

async function seedData() {
    try {
        console.log('Beginning data seeding process...');

        // Create test user if not exists
        let testUserId: string;
        const existingUser = await db.select()
            .from(users)
            .where(eq(users.email, 'test@example.com'))
            .limit(1);

        if (existingUser.length > 0) {
            console.log('Test user already exists, using existing user.');
            testUserId = existingUser[0].id;
        } else {
            // Create a test user
            testUserId = uuidv4();
            const hashedPassword = await hashPassword('password123');

            // Insert user into database
            await db.insert(users).values({
                id: testUserId,
                email: 'test@example.com',
                password: hashedPassword,
                name: 'Test User',
                picture: 'https://ui-avatars.com/api/?name=Test+User&background=random',
                createdAt: new Date().toISOString(),
            });

            console.log('Test user created successfully!');
            console.log('Email: test@example.com');
            console.log('Password: password123');
        }

        // Check if services exist
        const existingServices = await db.select().from(services);
        let serviceIds: string[] = [];

        if (existingServices.length > 0) {
            console.log('Services already exist, using existing services.');
            serviceIds = existingServices.map(service => service.id);
        } else {
            // Seed services
            console.log('Seeding services...');
            for (const service of servicesList) {
                const serviceId = uuidv4();
                serviceIds.push(serviceId);

                await db.insert(services).values({
                    id: serviceId,
                    name: service.name,
                    description: service.description,
                    price: service.price,
                    createdAt: new Date().toISOString(),
                    isActive: true
                });
            }
            console.log(`${servicesList.length} services created successfully!`);
        }

        // Clear existing subscriptions and invoices for the test user
        console.log('Clearing existing subscriptions and invoices for test user...');
        await db.delete(invoices).where(eq(invoices.userId, testUserId));
        await db.delete(subscriptions).where(eq(subscriptions.userId, testUserId));

        // Create subscriptions and invoices
        console.log('Creating subscriptions and invoices for test user...');

        // Create active subscriptions for 3 random services
        const shuffledServices = [...serviceIds].sort(() => 0.5 - Math.random());
        const activeServiceIds = shuffledServices.slice(0, 3);

        // Create historical subscriptions for remaining services
        const historicalServiceIds = shuffledServices.filter(id => !activeServiceIds.includes(id));

        // Create active subscriptions
        for (const serviceId of activeServiceIds) {
            const service = existingServices.find(s => s.id === serviceId) ||
                { name: `Service ${serviceIds.indexOf(serviceId) + 1}`, price: Math.random() * 100 + 20 };

            const startDate = getRandomDateInPast(2); // Active within last 2 months
            const renewalDate = addDays(startDate, 30); // Renew in 30 days from start

            // Create subscription
            const subscriptionId = uuidv4();
            await db.insert(subscriptions).values({
                id: subscriptionId,
                userId: testUserId,
                serviceId: serviceId,
                status: 'active',
                startDate: startDate.toISOString(),
                renewalDate: renewalDate.toISOString(),
                price: service.price,
                usage: Math.floor(Math.random() * 100),
                createdAt: startDate.toISOString(),
                updatedAt: startDate.toISOString(),
            });

            // Create invoice for this subscription
            const invoiceDueDate = addDays(startDate, 14);
            await db.insert(invoices).values({
                id: uuidv4(),
                userId: testUserId,
                subscriptionId: subscriptionId,
                stripeInvoiceId: `in_test_${uuidv4().substring(0, 8)}`,
                stripeCustomerId: 'cus_test123',
                number: `INV-${Date.now()}`,
                status: 'paid',
                currency: 'RON',
                amountTotal: Math.round(service.price * 100 * 5), // EUR to RON conversion (approx 5:1) in smallest unit
                amountPaid: Math.round(service.price * 100 * 5),
                amountRemaining: 0,
                serviceName: service.name,
                serviceId: serviceId,
                billingName: 'Test User',
                createdAt: startDate.toISOString(),
                updatedAt: startDate.toISOString(),
                dueDate: invoiceDueDate.toISOString(),
                paidAt: startDate.toISOString(),
            });
        }

        // Create historical subscriptions with various statuses
        const possibleStatuses = ['cancelled', 'completed'];

        for (const serviceId of historicalServiceIds) {
            const service = existingServices.find(s => s.id === serviceId) ||
                { name: `Service ${serviceIds.indexOf(serviceId) + 1}`, price: Math.random() * 100 + 20 };

            // Create multiple historical records for each service
            for (let i = 0; i < 3; i++) {
                const startDate = getRandomDateInPast(i + 3); // Progressively older
                const endDate = addDays(startDate, 30 * (i + 1)); // Longer duration for older subscriptions
                const status = possibleStatuses[Math.floor(Math.random() * possibleStatuses.length)];

                // Create subscription
                const subscriptionId = uuidv4();
                await db.insert(subscriptions).values({
                    id: subscriptionId,
                    userId: testUserId,
                    serviceId: serviceId,
                    status: status,
                    startDate: startDate.toISOString(),
                    renewalDate: endDate.toISOString(),
                    cancelledAt: status === 'cancelled' ? addDays(startDate, 15).toISOString() : null,
                    price: service.price,
                    usage: Math.floor(Math.random() * 100),
                    createdAt: startDate.toISOString(),
                    updatedAt: endDate.toISOString(),
                });

                // Create invoice for this subscription with various statuses
                const invoiceStatuses = ['paid', 'void'] as const;
                const invoiceStatus = invoiceStatuses[Math.floor(Math.random() * invoiceStatuses.length)];
                const invoiceDueDate = addDays(startDate, 14);

                await db.insert(invoices).values({
                    id: uuidv4(),
                    userId: testUserId,
                    subscriptionId: subscriptionId,
                    stripeInvoiceId: `in_test_${uuidv4().substring(0, 8)}`,
                    stripeCustomerId: 'cus_test123',
                    number: `INV-${Date.now()}-${i}`,
                    status: invoiceStatus,
                    currency: 'RON',
                    amountTotal: Math.round(service.price * 100 * 5), // EUR to RON conversion
                    amountPaid: invoiceStatus === 'paid' ? Math.round(service.price * 100 * 5) : 0,
                    amountRemaining: invoiceStatus === 'paid' ? 0 : Math.round(service.price * 100 * 5),
                    serviceName: service.name,
                    serviceId: serviceId,
                    billingName: 'Test User',
                    createdAt: startDate.toISOString(),
                    updatedAt: endDate.toISOString(),
                    dueDate: invoiceDueDate.toISOString(),
                    paidAt: invoiceStatus === 'paid' ? endDate.toISOString() : null,
                    voidedAt: invoiceStatus === 'void' ? endDate.toISOString() : null,
                    stripeInvoiceId: null,
                });
            }
        }

        // Generate additional invoices to have a good amount for pagination testing
        console.log('Generating additional invoices for pagination testing...');

        for (let i = 0; i < 25; i++) {
            const serviceId = serviceIds[Math.floor(Math.random() * serviceIds.length)];
            const service = existingServices.find(s => s.id === serviceId) ||
                { name: `Service ${serviceIds.indexOf(serviceId) + 1}`, price: Math.random() * 100 + 20 };

            const createdDate = getRandomDateInPast(12); // Past year

            // Create invoice
            const invoiceDueDate = addDays(createdDate, 14);
            const invoiceStatuses = ['paid', 'paid', 'paid', 'open', 'open'] as const; // Mostly paid, few open
            const invoiceStatus = invoiceStatuses[Math.floor(Math.random() * invoiceStatuses.length)];

            await db.insert(invoices).values({
                id: uuidv4(),
                userId: testUserId,
                subscriptionId: null, // One-time purchase, no subscription
                stripeInvoiceId: `in_test_${uuidv4().substring(0, 8)}`,
                stripeCustomerId: 'cus_test123',
                number: `INV-${Date.now()}-${i}`,
                status: invoiceStatus,
                currency: 'RON',
                amountTotal: Math.round(service.price * 100 * 5), // EUR to RON
                amountPaid: invoiceStatus === 'paid' ? Math.round(service.price * 100 * 5) : 0,
                amountRemaining: invoiceStatus === 'paid' ? 0 : Math.round(service.price * 100 * 5),
                serviceName: service.name,
                serviceId: serviceId,
                billingName: 'Test User',
                createdAt: createdDate.toISOString(),
                updatedAt: createdDate.toISOString(),
                dueDate: invoiceDueDate.toISOString(),
                paidAt: invoiceStatus === 'paid' ? createdDate.toISOString() : null,
            });
        }

        console.log('Data seeding completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
}

seedData();
