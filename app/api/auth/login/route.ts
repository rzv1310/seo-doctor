import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import db from '@/database';
import { users } from '@/database/schema/users';
import { eq } from 'drizzle-orm';
import { verifyPassword, createAuthResponse } from '@/lib/auth';

// Validation schema for login
const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export async function POST(req: NextRequest) {
  try {
    // Parse request body
    const body = await req.json();

    // Validate input
    const result = loginSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error.issues[0].message
        },
        { status: 400 }
      );
    }

    const { email, password } = result.data;

    // Find user with full data
    const userResults = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    // Check if user exists
    if (!userResults) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid email or password'
        },
        { status: 401 }
      );
    }

    const user = userResults;

    // Verify password
    const isPasswordValid = await verifyPassword(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid email or password'
        },
        { status: 401 }
      );
    }

    // Create auth response with full user data (excluding password)
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

      return createAuthResponse(userData);
    } catch (cookieError) {
      console.error('Cookie setting error:', cookieError);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to authenticate session'
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Something went wrong during login'
      },
      { status: 500 }
    );
  }
}