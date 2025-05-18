import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyAuthToken } from '@/app/utils/auth';

// Cookie name
const AUTH_COOKIE_NAME = 'minidash_auth';

export async function GET(req: NextRequest) {
  try {
    // Get auth token from request cookies
    const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;
    const user = token ? verifyAuthToken(token) : null;
    
    if (!user) {
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
    
    // Return user details
    return NextResponse.json({
      success: true,
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
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