import { NextRequest, NextResponse } from 'next/server';
import { createLogoutResponse } from '@/lib/auth';
import { logger, withLogging } from '@/lib/logger';
import { verifyApiAuth } from '@/lib/auth';



async function logoutHandler(req: NextRequest) {
    try {
        const session = await verifyApiAuth(req);
        const userId = session.isAuthenticated ? session.user.id : undefined;

        logger.auth('Logout successful', { userId });
        return createLogoutResponse();
    } catch (error) {
        logger.error('Logout error', { error: error instanceof Error ? error.message : String(error) });
        return NextResponse.json(
            {
                success: false,
                error: 'Something went wrong during logout'
            },
            { status: 500 }
        );
    }
}

export const POST = withLogging(logoutHandler);
