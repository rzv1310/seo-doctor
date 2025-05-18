import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyAuth, verifyAuthToken } from '@/app/utils/auth';
import database, { users } from '@/database';
import { eq } from 'drizzle-orm';

// Cookie name
const AUTH_COOKIE_NAME = 'minidash_auth';

export async function GET(req: NextRequest) {
  try {
    // Get auth token from request cookies
    const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;
    const userData = token ? verifyAuthToken(token) : null;

    if (!userData) {
      // Return 200 with authenticated: false rather than a 401 error
      // This prevents unnecessary error logs in the console for non-authenticated users
      return NextResponse.json(
        {
          success: true,
          authenticated: false,
          message: 'Not authenticated'
        },
        { status: 200 }
      );
    }

    // Query database to get full user data
    const dbUser = await database.query.users.findFirst({
      where: eq(users.id, userData.id),
    });

    if (!dbUser) {
      return NextResponse.json(
        {
          success: false,
          authenticated: false,
          message: 'User not found'
        },
        { status: 404 }
      );
    }

    // Return user details (excluding password)
    return NextResponse.json({
      success: true,
      authenticated: true,
      user: {
        id: dbUser.id,
        email: dbUser.email,
        name: dbUser.name,
        picture: dbUser.picture,
        createdAt: dbUser.createdAt,
        billingName: dbUser.billingName,
        billingCompany: dbUser.billingCompany,
        billingVat: dbUser.billingVat,
        billingAddress: dbUser.billingAddress,
        billingPhone: dbUser.billingPhone,
        stripeCustomerId: dbUser.stripeCustomerId,
      }
    });

  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json(
      {
        success: false,
        authenticated: false,
        error: 'Authentication error'
      },
      { status: 500 }
    );
  }
}