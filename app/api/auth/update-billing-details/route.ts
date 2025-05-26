import { NextRequest, NextResponse } from 'next/server';
import db from '@/database';
import { users } from '@/database/schema';
import { eq } from 'drizzle-orm';
import { verifyApiAuth } from '@/lib/auth';
import { logger, withLogging } from '@/lib/logger';



async function updateBillingDetailsHandler(request: NextRequest) {
    try {
        const session = await verifyApiAuth(request);

        if (!session.isAuthenticated) {
            logger.auth('Unauthenticated billing details update attempt');
            return NextResponse.json({ message: 'Neautentificat' }, { status: 401 });
        }

        const { billingName, billingCompany, billingVat, billingAddress, billingPhone } = await request.json();

        if (!billingName && !billingCompany) {
            logger.auth('Billing details update failed - missing name or company', { userId: session.user.id });
            return NextResponse.json({ message: 'Numele sau compania este obligatorie' }, { status: 400 });
        }

        if (!billingAddress) {
            logger.auth('Billing details update failed - missing address', { userId: session.user.id });
            return NextResponse.json({ message: 'Adresa de facturare este obligatorie' }, { status: 400 });
        }

        const userResult = await db.select().from(users).where(eq(users.id, session.user.id));
        const user = userResult[0];

        if (!user) {
            logger.error('User not found for billing update', { userId: session.user.id });
            return NextResponse.json({ message: 'Utilizator negăsit' }, { status: 404 });
        }

        await db.update(users)
            .set({
                billingName,
                billingCompany,
                billingVat,
                billingAddress,
                billingPhone
            })
            .where(eq(users.id, session.user.id));

        logger.auth('Billing details update successful', { userId: session.user.id });

        return NextResponse.json({
            message: 'Detaliile de facturare au fost actualizate cu succes',
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                billingName,
                billingCompany,
                billingVat,
                billingAddress,
                billingPhone
            }
        });
    } catch (error) {
        logger.error('Update billing details error', { error: error instanceof Error ? error.message : String(error) });
        return NextResponse.json({ message: 'Eroare server' }, { status: 500 });
    }
}

export const POST = withLogging(updateBillingDetailsHandler);
