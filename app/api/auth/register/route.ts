import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import db from '@/database';
import { users } from '@/database/schema/users';
import { eq } from 'drizzle-orm';
import { generateUserId, hashPassword, createAuthResponse } from '@/lib/auth';
import { logger, withLogging } from '@/lib/logger';

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
});

async function registerHandler(req: NextRequest) {
  try {
    const body = await req.json();

    const result = registerSchema.safeParse(body);
    if (!result.success) {
      logger.auth('register', undefined, false, new Error(result.error.issues[0].message));
      return NextResponse.json(
        {
          success: false,
          error: result.error.issues[0].message
        },
        { status: 400 }
      );
    }

    const { email, password, name } = result.data;

    const existingUser = await db.select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser.length > 0) {
      logger.auth('register', undefined, false, new Error(`Registration attempt with existing email: ${email}`));
      return NextResponse.json(
        {
          success: false,
          error: 'User with this email already exists'
        },
        { status: 409 }
      );
    }

    let hashedPassword;
    try {
      hashedPassword = await hashPassword(password);
    } catch (hashError) {
      logger.error('Password hashing error', hashError, { email });
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to secure password'
        },
        { status: 500 }
      );
    }

    const userId = generateUserId();

    try {
      await db.insert(users).values({
        id: userId,
        email,
        password: hashedPassword,
        name,
        picture: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
        createdAt: new Date().toISOString(),
      });
      
      logger.auth('register', userId, true, undefined);
    } catch (dbError) {
      logger.error('Database insertion error', dbError, { email, userId });
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to create user account'
        },
        { status: 500 }
      );
    }

    try {
      const userData = {
        id: userId,
        email,
        name,
        picture: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
        createdAt: new Date().toISOString(),
        billingName: null,
        billingCompany: null,
        billingVat: null,
        billingAddress: null,
        billingPhone: null,
        stripeCustomerId: null,
        admin: false,
      };

      return createAuthResponse(userData);
    } catch (cookieError) {
      logger.error('Cookie setting error', cookieError, { userId });
      return NextResponse.json(
        {
          success: false,
          error: 'User created but failed to establish session'
        },
        { status: 500 }
      );
    }

  } catch (error) {
    logger.error('Registration error', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Something went wrong during registration'
      },
      { status: 500 }
    );
  }
}

export const POST = withLogging(registerHandler);