import { NextRequest, NextResponse } from 'next/server';
import db from '@/database';
import { users } from '@/database/schema';
import { eq } from 'drizzle-orm';
import { verifyApiAuth, verifyPassword } from '@/lib/auth';
import { logger, withLogging } from '@/lib/logger';
import { AUTH_COOKIE_NAME } from '@/data/auth';



async function deleteAccountHandler(request: NextRequest) {
    try {
        const session = await verifyApiAuth(request);

        if (!session.isAuthenticated) {
            logger.auth('Unauthenticated delete-account attempt');
            return NextResponse.json({ message: 'Neautentificat' }, { status: 401 });
        }

        const { password } = await request.json();

        if (!password) {
            logger.auth('Delete account failed - missing password', { userId: session.user.id });
            return NextResponse.json({ message: 'Parola este obligatorie' }, { status: 400 });
        }

        const userResult = await db.select().from(users).where(eq(users.id, session.user.id));
        const user = userResult[0];

        if (!user) {
            logger.error('User not found for account deletion', { userId: session.user.id });
            return NextResponse.json({ message: 'Utilizator negăsit' }, { status: 404 });
        }

        const isValidPassword = await verifyPassword(password, user.password);

        if (!isValidPassword) {
            logger.auth('Delete account failed - invalid password', { userId: session.user.id });
            return NextResponse.json({ message: 'Parolă incorectă' }, { status: 401 });
        }

        await db.delete(users).where(eq(users.id, session.user.id));

        logger.auth('Delete account successful', { userId: session.user.id });

        const response = NextResponse.json({ message: 'Contul a fost șters cu succes' });
        response.cookies.delete(AUTH_COOKIE_NAME);

        return response;
    } catch (error) {
        logger.error('Account deletion error', { error: error instanceof Error ? error.message : String(error) });
        return NextResponse.json({ message: 'Eroare server' }, { status: 500 });
    }
}

export const DELETE = withLogging(deleteAccountHandler);
