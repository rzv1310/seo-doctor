import Stripe from 'stripe';
import fs from 'fs/promises';
import path from 'path';



if (!process.env.STRIPE_SECRET_KEY) {
    console.error('STRIPE_SECRET_KEY is not set in .env');
    process.exit(1);
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-04-30.basil' as any,
});

interface StripeIds {
    products: {
        gmbMax: string;
        googleOrganic: string;
    };
    prices: {
        gmbMaxMonthly: string;
        googleOrganicMonthly: string;
    };
    coupons: {
        SEO70: string;
    };
}

async function generateStripeProducts() {
    console.log('Starting Stripe product generation...\n');

    const stripeIds: StripeIds = {
        products: {
            gmbMax: '',
            googleOrganic: '',
        },
        prices: {
            gmbMaxMonthly: '',
            googleOrganicMonthly: '',
        },
        coupons: {
            SEO70: '',
        },
    };

    try {
        // Create GMB MAX product
        console.log('Creating GMB MAX product...');
        const gmbMaxProduct = await stripe.products.create({
            name: 'GMB MAX',
            description: 'GARANTAT TOP 3 ÎN GOOGLE MAPS!',
            metadata: {
                service_id: '1',
            },
        });
        stripeIds.products.gmbMax = gmbMaxProduct.id;
        console.log(`✓ GMB MAX product created: ${gmbMaxProduct.id}`);

        // Create GMB MAX price
        console.log('Creating GMB MAX price...');
        const gmbMaxPrice = await stripe.prices.create({
            product: gmbMaxProduct.id,
            unit_amount: 100000, // 1000 EUR in cents
            currency: 'eur',
            recurring: {
                interval: 'month',
            },
            metadata: {
                service_id: '1',
            },
        });
        stripeIds.prices.gmbMaxMonthly = gmbMaxPrice.id;
        console.log(`✓ GMB MAX price created: ${gmbMaxPrice.id}`);

        // Create GOOGLE ORGANIC product
        console.log('\nCreating GOOGLE ORGANIC product...');
        const googleOrganicProduct = await stripe.products.create({
            name: 'GOOGLE ORGANIC',
            description: 'GARANTAT TOP 3 ÎN REZULTATELE GOOGLE!',
            metadata: {
                service_id: '2',
            },
        });
        stripeIds.products.googleOrganic = googleOrganicProduct.id;
        console.log(`✓ GOOGLE ORGANIC product created: ${googleOrganicProduct.id}`);

        // Create GOOGLE ORGANIC price
        console.log('Creating GOOGLE ORGANIC price...');
        const googleOrganicPrice = await stripe.prices.create({
            product: googleOrganicProduct.id,
            unit_amount: 100000, // 1000 EUR in cents
            currency: 'eur',
            recurring: {
                interval: 'month',
            },
            metadata: {
                service_id: '2',
            },
        });
        stripeIds.prices.googleOrganicMonthly = googleOrganicPrice.id;
        console.log(`✓ GOOGLE ORGANIC price created: ${googleOrganicPrice.id}`);

        // Create SEO70 coupon
        console.log('\nCreating SEO70 coupon...');
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
        console.log(`✓ SEO70 coupon created: ${seo70Coupon.id}`);

        // Read current .env file
        const envPath = path.join(process.cwd(), '.env');
        let envContent = '';
        try {
            envContent = await fs.readFile(envPath, 'utf8');
        } catch (error) {
            console.log('Creating new .env file...');
        }

        // Prepare environment variables to add/update
        const envVars = {
            'STRIPE_PRODUCT_GMB_MAX': stripeIds.products.gmbMax,
            'STRIPE_PRODUCT_GOOGLE_ORGANIC': stripeIds.products.googleOrganic,
            'STRIPE_PRICE_GMB_MAX_MONTHLY': stripeIds.prices.gmbMaxMonthly,
            'STRIPE_PRICE_GOOGLE_ORGANIC_MONTHLY': stripeIds.prices.googleOrganicMonthly,
            'STRIPE_COUPON_SEO70': stripeIds.coupons.SEO70,
        };

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
        const paymentTsContent = `// Stripe product and price IDs
// Generated by scripts/generate-stripe-products.ts
// IDs are loaded from environment variables for security

export const stripeIds = {
    products: {
        gmbMax: process.env.STRIPE_PRODUCT_GMB_MAX!,
        googleOrganic: process.env.STRIPE_PRODUCT_GOOGLE_ORGANIC!,
    },
    prices: {
        gmbMaxMonthly: process.env.STRIPE_PRICE_GMB_MAX_MONTHLY!,
        googleOrganicMonthly: process.env.STRIPE_PRICE_GOOGLE_ORGANIC_MONTHLY!,
    },
    coupons: {
        SEO70: process.env.STRIPE_COUPON_SEO70!,
    },
} as const;


// Helper function to get price ID by service ID
export function getPriceIdByServiceId(serviceId: number): string | null {
    switch (serviceId) {
        case 1:
            return stripeIds.prices.gmbMaxMonthly;
        case 2:
            return stripeIds.prices.googleOrganicMonthly;
        default:
            return null;
    }
}

// Helper function to get product ID by service ID
export function getProductIdByServiceId(serviceId: number): string | null {
    switch (serviceId) {
        case 1:
            return stripeIds.products.gmbMax;
        case 2:
            return stripeIds.products.googleOrganic;
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
        console.error('Error generating Stripe products:', error);
        process.exit(1);
    }
}

// Run the script
generateStripeProducts();
