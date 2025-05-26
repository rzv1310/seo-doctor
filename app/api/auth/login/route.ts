import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import db from '@/database';
import { users } from '@/database/schema/users';
import { eq } from 'drizzle-orm';
import { verifyPassword, createAuthResponse } from '@/lib/auth';
import { logger, withLogging } from '@/lib/logger';



const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
});

async function loginHandler(req: NextRequest) {
    try {
        const body = await req.json();

        const result = loginSchema.safeParse(body);
        if (!result.success) {
            logger.auth('Login validation failed', { error: result.error.issues[0].message });
            return NextResponse.json(
                {
                    success: false,
                    error: result.error.issues[0].message
                },
                { status: 400 }
            );
        }

        const { email, password } = result.data;

        const userResults = await db.query.users.findFirst({
            where: eq(users.email, email),
        });

        if (!userResults) {
            logger.auth('Login failed - user not found', { email });
            return NextResponse.json(
                {
                    success: false,
                    error: 'Invalid email or password'
                },
                { status: 401 }
            );
        }

        const user = userResults;

        const isPasswordValid = await verifyPassword(password, user.password);

        if (!isPasswordValid) {
            logger.auth('Login failed - invalid password', { userId: user.id });
            return NextResponse.json(
                {
                    success: false,
                    error: 'Invalid email or password'
                },
                { status: 401 }
            );
        }

        try {
            const userData = {
                id: user.id,
                email: user.email,
                name: user.name,
                picture: user.picture,
                createdAt: user.createdAt,
                billingName: user.billingName,
                billingCompany: user.billingCompany,
                billingVat: user.billingVat,
                billingAddress: user.billingAddress,
                billingPhone: user.billingPhone,
                stripeCustomerId: user.stripeCustomerId,
                admin: user.admin,
            };

            logger.auth('Login successful', { userId: user.id });
            return createAuthResponse(userData);
        } catch (cookieError) {
            logger.error('Failed to set auth cookie', { userId: user.id, error: cookieError instanceof Error ? cookieError.message : String(cookieError) });
            return NextResponse.json(
                {
                    success: false,
                    error: 'Failed to authenticate session'
                },
                { status: 500 }
            );
        }

    } catch (error) {
        logger.error('Login error', { error: error instanceof Error ? error.message : String(error) });
        return NextResponse.json(
            {
                success: false,
                error: 'Something went wrong during login'
            },
            { status: 500 }
        );
    }
}

export const POST = withLogging(loginHandler);
