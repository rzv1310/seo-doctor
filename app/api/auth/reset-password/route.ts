import { NextRequest, NextResponse } from 'next/server';
import db from '@/database';
import { users, passwordResets } from '@/database/schema';
import { eq, and, gt, isNull } from 'drizzle-orm';
import { hashPassword } from '@/lib/auth';
import { logger, withLogging } from '@/lib/logger';



async function resetPasswordHandler(request: NextRequest) {
    try {
        const { token, password } = await request.json();

        if (!token || !password) {
            logger.auth('Password reset failed - missing token or password');
            return NextResponse.json(
                { error: 'Token și parola sunt obligatorii' },
                { status: 400 }
            );
        }

        if (password.length < 8) {
            logger.auth('Password reset failed - password too short');
            return NextResponse.json(
                { error: 'Parola trebuie să aibă cel puțin 8 caractere' },
                { status: 400 }
            );
        }

        const resetToken = await db.select()
            .from(passwordResets)
            .where(
                and(
                    eq(passwordResets.token, token),
                    gt(passwordResets.expiresAt, new Date().toISOString()),
                    isNull(passwordResets.usedAt)
                )
            )
            .limit(1);

        if (resetToken.length === 0) {
            logger.auth('Password reset failed - invalid or expired token');
            return NextResponse.json(
                { error: 'Token invalid sau expirat' },
                { status: 400 }
            );
        }

        const { userId } = resetToken[0];

        const hashedPassword = await hashPassword(password);

        await db.update(users)
            .set({ password: hashedPassword })
            .where(eq(users.id, userId));

        await db.update(passwordResets)
            .set({ usedAt: new Date().toISOString() })
            .where(eq(passwordResets.token, token));

        logger.auth('Password reset successful', { userId });

        return NextResponse.json({
            message: 'Parola a fost resetată cu succes'
        });

    } catch (error) {
        logger.error('Password reset error', { error: error instanceof Error ? error.message : String(error) });
        return NextResponse.json(
            { error: 'Eroare la resetarea parolei' },
            { status: 500 }
        );
    }
}

export const POST = withLogging(resetPasswordHandler);
