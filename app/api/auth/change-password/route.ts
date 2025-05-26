import { NextRequest, NextResponse } from 'next/server';
import db from '@/database';
import { users } from '@/database/schema';
import { eq } from 'drizzle-orm';
import { verifyApiAuth, verifyPassword, hashPassword } from '@/lib/auth';
import { logger, withLogging } from '@/lib/logger';



async function changePasswordHandler(request: NextRequest) {
    try {
        const session = await verifyApiAuth(request);

        if (!session.isAuthenticated) {
            logger.auth('Unauthenticated change-password attempt');
            return NextResponse.json({ message: 'Neautentificat' }, { status: 401 });
        }

        const userResult = await db.select().from(users).where(eq(users.id, session.user.id));
        const user = userResult[0];

        if (!user) {
            logger.error('User not found for password change', { userId: session.user.id });
            return NextResponse.json({ message: 'Utilizator negăsit' }, { status: 404 });
        }

        const { currentPassword, newPassword } = await request.json();

        if (!currentPassword || !newPassword) {
            logger.auth('Missing required fields for password change', { userId: session.user.id });
            return NextResponse.json({ message: 'Toate câmpurile sunt obligatorii' }, { status: 400 });
        }

        const passwordValid = await verifyPassword(currentPassword, user.password);

        if (!passwordValid) {
            logger.auth('Invalid current password for password change', { userId: session.user.id });
            return NextResponse.json({ message: 'Parola actuală este incorectă' }, { status: 400 });
        }

        const newPasswordHash = await hashPassword(newPassword);

        await db.update(users)
            .set({ password: newPasswordHash })
            .where(eq(users.id, session.user.id));

        logger.auth('Password changed successfully', { userId: session.user.id });
        return NextResponse.json({ message: 'Parola a fost actualizată cu succes' });
    } catch (error) {
        logger.error('Password change error', { error: error instanceof Error ? error.message : String(error) });
        return NextResponse.json({ message: 'Eroare server' }, { status: 500 });
    }
}

export const POST = withLogging(changePasswordHandler);
