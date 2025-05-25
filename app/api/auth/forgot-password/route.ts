import { NextRequest, NextResponse } from 'next/server';
import db from '@/database';
import { users, passwordResets } from '@/database/schema';
import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import { logger, withLogging } from '@/lib/logger';

async function forgotPasswordHandler(request: NextRequest) {
    try {
        const { email } = await request.json();

        if (!email) {
            logger.auth('forgot-password', undefined, false, new Error('Missing email'));
            return NextResponse.json(
                { error: 'Email-ul este obligatoriu' },
                { status: 400 }
            );
        }

        const user = await db.select().from(users).where(eq(users.email, email)).limit(1);
        
        if (user.length === 0) {
            logger.auth('forgot-password', undefined, false, new Error(`No user found for email: ${email}`));
            return NextResponse.json({ 
                message: 'Dacă există un cont asociat cu acest email, vei primi un link de resetare.' 
            });
        }

        const userId = user[0].id;

        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();

        await db.insert(passwordResets).values({
            id: uuidv4(),
            userId,
            token,
            expiresAt,
            createdAt: new Date().toISOString(),
        });

        const resetLink = `${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/reset-password?token=${token}`;
        
        logger.auth('forgot-password', userId, true);
        logger.info('Password reset requested', { userId, email, resetLink });

        return NextResponse.json({ 
            message: 'Dacă există un cont asociat cu acest email, vei primi un link de resetare.' 
        });

    } catch (error) {
        logger.error('Forgot password error', error);
        return NextResponse.json(
            { error: 'Eroare la procesarea cererii' },
            { status: 500 }
        );
    }
}

export const POST = withLogging(forgotPasswordHandler);