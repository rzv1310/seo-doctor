import { NextRequest, NextResponse } from 'next/server';
import { verifyApiAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await verifyApiAuth(req);

    if (!session.isAuthenticated) {
      return NextResponse.json(
        {
          success: true,
          authenticated: false,
          message: 'Not authenticated'
        },
        { status: 200 }
      );
    }

    return NextResponse.json({
      success: true,
      authenticated: true,
      user: session.user
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