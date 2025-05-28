import { NextRequest, NextResponse } from 'next/server';
import db from '@/database';
import { users } from '@/database/schema';
import { eq } from 'drizzle-orm';
import { verifyApiAuth } from '@/lib/auth';
import { logger, withLogging } from '@/lib/logger';
import { 
    validateBillingDetails, 
    sanitizeBillingDetails, 
    updateStripeCustomerBilling,
    type BillingDetails 
} from '@/lib/billing-utils';



async function updateBillingDetailsHandler(request: NextRequest) {
    try {
        const session = await verifyApiAuth(request);

        if (!session.isAuthenticated) {
            logger.auth('Unauthenticated billing details update attempt');
            return NextResponse.json({ message: 'Neautentificat' }, { status: 401 });
        }

        const billingData: BillingDetails = await request.json();

        // Sanitize input data
        const sanitizedBilling = sanitizeBillingDetails(billingData);

        // Validate billing details
        const validation = validateBillingDetails(sanitizedBilling);
        if (!validation.isValid) {
            logger.auth('Billing details validation failed', { 
                userId: session.user.id, 
                errors: validation.errors 
            });
            return NextResponse.json({ 
                message: 'Date de facturare invalide', 
                errors: validation.errors 
            }, { status: 400 });
        }

        const userResult = await db.select().from(users).where(eq(users.id, session.user.id));
        const user = userResult[0];

        if (!user) {
            logger.error('User not found for billing update', { userId: session.user.id });
            return NextResponse.json({ message: 'Utilizator negăsit' }, { status: 404 });
        }

        await db.update(users)
            .set({
                billingName: sanitizedBilling.billingName,
                billingCompany: sanitizedBilling.billingCompany,
                billingVat: sanitizedBilling.billingVat,
                billingAddress: sanitizedBilling.billingAddress,
                billingPhone: sanitizedBilling.billingPhone
            })
            .where(eq(users.id, session.user.id));

        // Update Stripe customer if they have a Stripe customer ID
        if (user.stripeCustomerId) {
            try {
                await updateStripeCustomerBilling(
                    user.stripeCustomerId, 
                    sanitizedBilling, 
                    session.user.id
                );
            } catch (error) {
                logger.error('Failed to update Stripe customer with billing details', { 
                    error: error instanceof Error ? error.message : String(error),
                    userId: session.user.id,
                    stripeCustomerId: user.stripeCustomerId
                });
                // Don't fail the entire operation if Stripe update fails
            }
        }

        logger.auth('Billing details update successful', { userId: session.user.id });

        return NextResponse.json({
            message: 'Detaliile de facturare au fost actualizate cu succes',
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                billingName: sanitizedBilling.billingName,
                billingCompany: sanitizedBilling.billingCompany,
                billingVat: sanitizedBilling.billingVat,
                billingAddress: sanitizedBilling.billingAddress,
                billingPhone: sanitizedBilling.billingPhone
            }
        });
    } catch (error) {
        logger.error('Update billing details error', { error: error instanceof Error ? error.message : String(error) });
        return NextResponse.json({ message: 'Eroare server' }, { status: 500 });
    }
}

export const POST = withLogging(updateBillingDetailsHandler);
