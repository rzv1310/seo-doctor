import { NextRequest, NextResponse } from 'next/server';
import db from '@/database';
import { passwordResets } from '@/database/schema';
import { eq, and, gt, isNull } from 'drizzle-orm';
import { logger, withLogging } from '@/lib/logger';

async function validateResetTokenHandler(request: NextRequest) {
    try {
        const { token } = await request.json();

        if (!token) {
            logger.warn('Token validation attempted without token');
            return NextResponse.json(
                { error: 'Token-ul este obligatoriu' },
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
            logger.warn('Invalid or expired token validation attempt');
            return NextResponse.json(
                { error: 'Token invalid sau expirat' },
                { status: 400 }
            );
        }

        logger.info('Token validated successfully', { userId: resetToken[0].userId });
        return NextResponse.json({ valid: true });

    } catch (error) {
        logger.error('Token validation error', error);
        return NextResponse.json(
            { error: 'Eroare la validarea token-ului' },
            { status: 500 }
        );
    }
}

export const POST = withLogging(validateResetTokenHandler);