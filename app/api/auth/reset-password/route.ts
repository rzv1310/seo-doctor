import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/database';
import { users, passwordResets } from '@/database/schema';
import { eq, and, gt, isNull } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
    try {
        const { token, password } = await request.json();

        if (!token || !password) {
            return NextResponse.json(
                { error: 'Token și parola sunt obligatorii' },
                { status: 400 }
            );
        }

        if (password.length < 6) {
            return NextResponse.json(
                { error: 'Parola trebuie să aibă cel puțin 6 caractere' },
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

        const { userId } = resetToken[0];

        // Hash the new password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Update the user's password
        await db.update(users)
            .set({ password: hashedPassword })
            .where(eq(users.id, userId));

        // Mark the token as used
        await db.update(passwordResets)
            .set({ usedAt: new Date().toISOString() })
            .where(eq(passwordResets.token, token));

        return NextResponse.json({ 
            message: 'Parola a fost resetată cu succes' 
        });

    } catch (error) {
        console.error('Password reset error:', error);
        return NextResponse.json(
            { error: 'Eroare la resetarea parolei' },
            { status: 500 }
        );
    }
}