import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { z } from 'zod';
import db from '@/database';
import { users } from '@/database/schema/users';
import { eq } from 'drizzle-orm';
import { generateUserId, hashPassword, setAuthCookie } from '@/utils/auth';

// Validation schema for registration
const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
});

export async function POST(req: NextRequest) {
  try {
    // Parse request body
    const body = await req.json();

    // Validate input
    const result = registerSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error.issues[0].message
        },
        { status: 400 }
      );
    }

    const { email, password, name } = result.data;

    // Check if user already exists
    const existingUser = await db.select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'User with this email already exists'
        },
        { status: 409 }
      );
    }

    // Hash password
    let hashedPassword;
    try {
      hashedPassword = await hashPassword(password);
    } catch (hashError) {
      console.error('Password hashing error:', hashError);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to secure password'
        },
        { status: 500 }
      );
    }

    // Generate user ID
    const userId = generateUserId();

    try {
      // Insert user into database
      await db.insert(users).values({
        id: userId,
        email,
        password: hashedPassword,
        name,
        picture: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
        createdAt: new Date().toISOString(),
      });
    } catch (dbError) {
      console.error('Database insertion error:', dbError);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to create user account'
        },
        { status: 500 }
      );
    }

    // Set auth cookie and return response
    try {
      return setAuthCookie({
        id: userId,
        email,
        name,
      });
    } catch (cookieError) {
      console.error('Cookie setting error:', cookieError);
      // Even though user is created, we should return an error if the session can't be established
      return NextResponse.json(
        {
          success: false,
          error: 'User created but failed to establish session'
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Something went wrong during registration'
      },
      { status: 500 }
    );
  }
}