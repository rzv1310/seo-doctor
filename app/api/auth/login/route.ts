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

    // Set auth cookie and return response with full user data
    try {
      const response = setAuthCookie({
        id: user.id,
        email: user.email,
        name: user.name,
      });
      
      // Modify the response to include full user data (excluding password)
      const responseData = {
        success: true,
        user: {
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
        }
      };
      
      // We need to extract the cookie from the original response
      const cookieHeader = response.headers.get('set-cookie');
      
      // Create a new response with the same cookie but updated body
      const newResponse = NextResponse.json(responseData, { status: 200 });
      
      // Set the cookie header if it exists
      if (cookieHeader) {
        newResponse.headers.set('set-cookie', cookieHeader);
      }
      
      return newResponse;
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