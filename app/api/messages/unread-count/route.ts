import { NextRequest, NextResponse } from 'next/server';
import db from '@/database';
import { messages } from '@/database/schema';
import { verifyApiAuth } from '@/lib/auth';
import { eq, and, sql } from 'drizzle-orm';
import { logger, withLogging } from '@/lib/logger';

export const GET = withLogging(async (request: NextRequest) => {
    try {
        const session = await verifyApiAuth(request);
        if (!session.isAuthenticated) {
            logger.auth('Unauthorized access attempt to unread count', { path: '/api/messages/unread-count' });
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        let unreadCount = 0;

        if (session.user.admin) {
            // Admin sees all unread messages from users
            const result = await db
                .select({
                    count: sql<number>`COUNT(*)`
                })
                .from(messages)
                .where(and(
                    eq(messages.isRead, false),
                    eq(messages.isFromAdmin, false)
                ));
            
            unreadCount = Number(result[0]?.count || 0);
        } else {
            // Regular users see their unread messages from admin
            const result = await db
                .select({
                    count: sql<number>`COUNT(*)`
                })
                .from(messages)
                .where(and(
                    eq(messages.userId, session.user.id),
                    eq(messages.isRead, false),
                    eq(messages.isFromAdmin, true)
                ));
            
            unreadCount = Number(result[0]?.count || 0);
        }

        logger.info('Unread count fetched', { userId: session.user.id, unreadCount, isAdmin: session.user.admin });
        return NextResponse.json({ unreadCount });
    } catch (error) {
        logger.error('Error fetching unread count', { error: error instanceof Error ? error.message : String(error) });
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
});