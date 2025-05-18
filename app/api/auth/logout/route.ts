import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { clearAuthCookie } from '@/app/utils/auth';

export async function POST(req: NextRequest) {
  try {
    // Clear the auth cookie and return response
    try {
      return clearAuthCookie();
    } catch (cookieError) {
      console.error('Cookie clearing error:', cookieError);
      return NextResponse.json(
        { 
          success: false,
          error: 'Failed to clear authentication session' 
        },
        { status: 500 }
      );
    }
    
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Something went wrong during logout' 
      },
      { status: 500 }
    );
  }
}