import { NextRequest, NextResponse } from 'next/server';
import db from '@/database';
import { passwordResets } from '@/database/schema';
import { eq, and, gt, isNull } from 'drizzle-orm';

export async function POST(request: NextRequest) {
    try {
        const { token } = await request.json();

        if (!token) {
            return NextResponse.json(
                { error: 'Token-ul este obligatoriu' },
                { status: 400 }
            );
        }

        // Check if token exists and is not expired and not used
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
            return NextResponse.json(
                { error: 'Token invalid sau expirat' },
                { status: 400 }
            );
        }

        return NextResponse.json({ valid: true });

    } catch (error) {
        console.error('Token validation error:', error);
        return NextResponse.json(
            { error: 'Eroare la validarea token-ului' },
            { status: 500 }
        );
    }
}