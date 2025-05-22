import { NextRequest, NextResponse } from 'next/server';
import { createLogoutResponse } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    return createLogoutResponse();
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