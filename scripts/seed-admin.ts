import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';

import db from '../database';
import { users } from '../database/schema';

async function seedAdmin() {
    try {
        console.log('🌱 Starting admin seed...');

        // Check if admin already exists
        const existingAdmins = await db
            .select()
            .from(users)
            .where(eq(users.admin, true))
            .limit(1);

        if (existingAdmins.length > 0) {
            console.log('❌ Admin user already exists');
            process.exit(0);
        }

        // Hash password
        const hashedPassword = await bcrypt.hash('admin123', 10);

        // Create admin user
        const adminUser = {
            id: '1',
            email: 'admin@seodoctor.ro',
            password: hashedPassword,
            name: 'Administrator',
            picture: null,
            billingName: 'SEO Doctor Admin',
            billingCompany: 'SEO Doctor',
            billingVat: null,
            billingAddress: null,
            billingPhone: null,
            stripeCustomerId: null,
            admin: true,
            createdAt: new Date().toISOString(),
        };

        await db.insert(users).values(adminUser);

        console.log('✅ Admin user created successfully!');
        console.log('📧 Email: admin@seodoctor.ro');
        console.log('🔐 Password: admin123');
        console.log('⚠️  Please change the password after first login!');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding admin:', error);
        process.exit(1);
    }
}

seedAdmin();