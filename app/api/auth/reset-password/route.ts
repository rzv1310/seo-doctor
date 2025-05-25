import { NextRequest, NextResponse } from 'next/server';
import db from '@/database';
import { users, passwordResets } from '@/database/schema';
import { eq, and, gt, isNull } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { logger, withLogging } from '@/lib/logger';

async function resetPasswordHandler(request: NextRequest) {
    try {
        const { token, password } = await request.json();

        if (!token || !password) {
            logger.auth('reset-password', undefined, false, new Error('Missing token or password'));
            return NextResponse.json(
                { error: 'Token și parola sunt obligatorii' },
                { status: 400 }
            );
        }

        if (password.length < 6) {
            logger.auth('reset-password', undefined, false, new Error('Password too short'));
            return NextResponse.json(
                { error: 'Parola trebuie să aibă cel puțin 6 caractere' },
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
            logger.auth('reset-password', undefined, false, new Error('Invalid or expired token'));
            return NextResponse.json(
                { error: 'Token invalid sau expirat' },
                { status: 400 }
            );
        }

        const { userId } = resetToken[0];

        const hashedPassword = await bcrypt.hash(password, 10);

        await db.update(users)
            .set({ password: hashedPassword })
            .where(eq(users.id, userId));

        await db.update(passwordResets)
            .set({ usedAt: new Date().toISOString() })
            .where(eq(passwordResets.token, token));

        logger.auth('reset-password', userId, true);
        
        return NextResponse.json({
            message: 'Parola a fost resetată cu succes'
        });

    } catch (error) {
        logger.error('Password reset error', error);
        return NextResponse.json(
            { error: 'Eroare la resetarea parolei' },
            { status: 500 }
        );
    }
}

export const POST = withLogging(resetPasswordHandler);