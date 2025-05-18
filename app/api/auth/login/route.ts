import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { z } from 'zod';
import db from '@/database';
import { users } from '@/database/schema/users';
import { eq } from 'drizzle-orm';
import { verifyPassword, setAuthCookie } from '@/app/utils/auth';

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

    // Find user
    const userResults = await db.select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    // Check if user exists
    if (userResults.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid email or password'
        },
        { status: 401 }
      );
    }

    const user = userResults[0];

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

    // Set auth cookie and return response
    try {
      return setAuthCookie({
        id: user.id,
        email: user.email,
        name: user.name,
      });
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