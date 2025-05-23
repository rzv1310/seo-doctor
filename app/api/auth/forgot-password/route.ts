import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/database';
import { users, passwordResets } from '@/database/schema';
import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
    try {
        const { email } = await request.json();

        if (!email) {
            return NextResponse.json(
                { error: 'Email-ul este obligatoriu' },
                { status: 400 }
            );
        }

        // Check if user exists
        const user = await db.select().from(users).where(eq(users.email, email)).limit(1);
        
        if (user.length === 0) {
            // Don't reveal that the user doesn't exist for security reasons
            // But still return success to prevent email enumeration
            return NextResponse.json({ 
                message: 'Dacă există un cont asociat cu acest email, vei primi un link de resetare.' 
            });
        }

        const userId = user[0].id;

        // Generate a secure random token
        const token = crypto.randomBytes(32).toString('hex');
        
        // Token expires in 1 hour
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();

        // Save the reset token
        await db.insert(passwordResets).values({
            id: uuidv4(),
            userId,
            token,
            expiresAt,
            createdAt: new Date().toISOString(),
        });

        // TODO: Send email with reset link
        // For now, we'll just log it (in production, you'd send an actual email)
        const resetLink = `${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/reset-password?token=${token}`;
        console.log('Password reset link:', resetLink);
        console.log('Send this link to:', email);

        // In production, you would send an email here
        // Example with a hypothetical email service:
        // await sendEmail({
        //     to: email,
        //     subject: 'Resetare parolă - SEO Doctor',
        //     html: `
        //         <h2>Resetare parolă</h2>
        //         <p>Ai solicitat resetarea parolei pentru contul tău SEO Doctor.</p>
        //         <p>Click pe linkul de mai jos pentru a-ți reseta parola:</p>
        //         <a href="${resetLink}">Resetează parola</a>
        //         <p>Acest link expiră în 1 oră.</p>
        //         <p>Dacă nu ai solicitat resetarea parolei, ignoră acest email.</p>
        //     `
        // });

        return NextResponse.json({ 
            message: 'Dacă există un cont asociat cu acest email, vei primi un link de resetare.' 
        });

    } catch (error) {
        console.error('Forgot password error:', error);
        return NextResponse.json(
            { error: 'Eroare la procesarea cererii' },
            { status: 500 }
        );
    }
}