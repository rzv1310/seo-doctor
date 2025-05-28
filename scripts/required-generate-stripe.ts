import Stripe from 'stripe';
import fs from 'fs/promises';
import path from 'path';
import { services } from '@/data/services';



if (!process.env.STRIPE_SECRET_KEY) {
    console.error('STRIPE_SECRET_KEY is not set in .env');
    process.exit(1);
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-04-30.basil' as any,
});

interface StripeIds {
    products: Record<string, string>;
    prices: Record<string, string>;
    coupons: {
        SEO70: string;
    };
}

async function generateStripeProducts() {
    console.log('🚀 Starting Stripe product generation from data/services.ts...\n');

    const stripeIds: StripeIds = {
        products: {},
        prices: {},
        coupons: {
            SEO70: '',
        },
    };

    try {
        // Create products and prices for each service from data/services.ts
        for (const service of services) {
            console.log(`Creating product for ${service.name}...`);
            
            const product = await stripe.products.create({
                name: service.name,
                description: service.description,
                metadata: {
                    service_id: service.id.toString(),
                },
            });
            
            const productKey = service.name.toLowerCase().replace(/\s+/g, '');
            stripeIds.products[productKey] = product.id;
            console.log(`✓ ${service.name} product created: ${product.id}`);

            console.log(`Creating price for ${service.name}...`);
            
            const price = await stripe.prices.create({
                product: product.id,
                unit_amount: service.priceValue, // Price from services data
                currency: 'eur',
                recurring: {
                    interval: 'month',
                },
                metadata: {
                    service_id: service.id.toString(),
                },
            });
            
            const priceKey = `${productKey}Monthly`;
            stripeIds.prices[priceKey] = price.id;
            console.log(`✓ ${service.name} price created: ${price.id}\n`);
        }

        // Create SEO70 coupon
        console.log('Creating SEO70 coupon...');
        const seo70Coupon = await stripe.coupons.create({
            id: 'SEO70',
            percent_off: 70,
            duration: 'repeating',
            duration_in_months: 3,
            name: 'SEO 70% Off - First 3 Months',
            metadata: {
                description: '70% reduction for the first 3 months',
            },
        });
        stripeIds.coupons.SEO70 = seo70Coupon.id;
        console.log(`✓ SEO70 coupon created: ${seo70Coupon.id}\n`);

        // Read current .env file
        const envPath = path.join(process.cwd(), '.env');
        let envContent = '';
        try {
            envContent = await fs.readFile(envPath, 'utf8');
        } catch (error) {
            console.log('Creating new .env file...');
        }

        // Prepare environment variables to add/update
        const envVars: Record<string, string> = {};
        
        // Add product IDs
        services.forEach(service => {
            const productKey = service.name.toLowerCase().replace(/\s+/g, '');
            const envKey = `STRIPE_PRODUCT_${service.name.toUpperCase().replace(/\s+/g, '_')}`;
            envVars[envKey] = stripeIds.products[productKey];
        });
        
        // Add price IDs
        services.forEach(service => {
            const productKey = service.name.toLowerCase().replace(/\s+/g, '');
            const envKey = `STRIPE_PRICE_${service.name.toUpperCase().replace(/\s+/g, '_')}_MONTHLY`;
            envVars[envKey] = stripeIds.prices[`${productKey}Monthly`];
        });
        
        // Add coupon
        envVars['STRIPE_COUPON_SEO70'] = stripeIds.coupons.SEO70;

        // Update or add environment variables
        let updatedEnvContent = envContent;
        const existingVars = new Set();

        // Track existing variables
        envContent.split('\n').forEach(line => {
            const [key] = line.split('=');
            if (key && key.trim()) {
                existingVars.add(key.trim());
            }
        });

        // Update existing variables or add new ones
        Object.entries(envVars).forEach(([key, value]) => {
            const regex = new RegExp(`^${key}=.*$`, 'm');
            if (existingVars.has(key)) {
                updatedEnvContent = updatedEnvContent.replace(regex, `${key}=${value}`);
                console.log(`✓ Updated ${key} in .env`);
            } else {
                updatedEnvContent += `\n${key}=${value}`;
                console.log(`✓ Added ${key} to .env`);
            }
        });

        // Write updated .env file
        await fs.writeFile(envPath, updatedEnvContent);
        console.log(`\n✓ Updated .env with all Stripe IDs`);

        // Generate payment.ts file content that reads from environment variables
        const productEnvVars = services.map(service => {
            const envKey = `STRIPE_PRODUCT_${service.name.toUpperCase().replace(/\s+/g, '_')}`;
            const productKey = service.name.toLowerCase().replace(/\s+/g, '');
            return `        ${productKey}: process.env.${envKey}!,`;
        }).join('\n');

        const priceEnvVars = services.map(service => {
            const envKey = `STRIPE_PRICE_${service.name.toUpperCase().replace(/\s+/g, '_')}_MONTHLY`;
            const productKey = service.name.toLowerCase().replace(/\s+/g, '');
            return `        ${productKey}Monthly: process.env.${envKey}!,`;
        }).join('\n');

        const switchCases = services.map(service => {
            const productKey = service.name.toLowerCase().replace(/\s+/g, '');
            return `        case ${service.id}:
            return stripeIds.prices.${productKey}Monthly;`;
        }).join('\n');

        const productSwitchCases = services.map(service => {
            const productKey = service.name.toLowerCase().replace(/\s+/g, '');
            return `        case ${service.id}:
            return stripeIds.products.${productKey};`;
        }).join('\n');

        const paymentTsContent = `// Stripe product and price IDs
// Generated by scripts/required-generate-stripe.ts
// IDs are loaded from environment variables for security

export const stripeIds = {
    products: {
${productEnvVars}
    },
    prices: {
${priceEnvVars}
    },
    coupons: {
        SEO70: process.env.STRIPE_COUPON_SEO70!,
    },
} as const;



// Helper function to get price ID by service ID
export function getPriceIdByServiceId(serviceId: number): string | null {
    switch (serviceId) {
${switchCases}
        default:
            return null;
    }
}

// Helper function to get product ID by service ID
export function getProductIdByServiceId(serviceId: number): string | null {
    switch (serviceId) {
${productSwitchCases}
        default:
            return null;
    }
}
`;

        // Write to data/payment.ts
        const paymentFilePath = path.join(process.cwd(), 'data', 'payment.ts');
        await fs.writeFile(paymentFilePath, paymentTsContent);
        console.log(`✓ Generated data/payment.ts that reads from environment variables`);

        console.log('\n🎉 All Stripe products, prices, and coupons created successfully!');
        console.log('\nEnvironment variables added to .env:');
        Object.entries(envVars).forEach(([key, value]) => {
            console.log(`${key}=${value}`);
        });
        console.log('\n⚠️  Remember to add these variables to your production environment!');
        console.log('💡 The payment.ts file now safely reads from environment variables.');

    } catch (error) {
        console.error('❌ Error generating Stripe products:', error);
        process.exit(1);
    }
}

// Run the script
generateStripeProducts();