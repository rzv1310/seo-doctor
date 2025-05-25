import { NextRequest, NextResponse } from 'next/server';
import { verifyApiAuth } from '@/lib/auth';
import { logger, withLogging } from '@/lib/logger';

async function meHandler(req: NextRequest) {
  try {
    const session = await verifyApiAuth(req);

    if (!session.isAuthenticated) {
      logger.info('Unauthenticated session check');
      return NextResponse.json(
        {
          success: true,
          authenticated: false,
          message: 'Not authenticated'
        },
        { status: 200 }
      );
    }

    logger.info('Authenticated session check', { userId: session.user.id });
    return NextResponse.json({
      success: true,
      authenticated: true,
      user: session.user
    });

  } catch (error) {
    logger.error('Auth check error', error);
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

export const GET = withLogging(meHandler);