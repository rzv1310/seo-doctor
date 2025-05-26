import { NextRequest, NextResponse } from 'next/server';
import db from '@/database';
import { users } from '@/database/schema';
import { verifyApiAuth } from '@/lib/auth';
import { desc, sql } from 'drizzle-orm';
import { logger, withLogging } from '@/lib/logger';



export const GET = withLogging(async (request: NextRequest) => {
    try {
        const session = await verifyApiAuth(request);
        if (!session.isAuthenticated || !session.user.admin) {
            logger.auth('Unauthorized access attempt to user chats', { path: '/api/messages/users', isAdmin: session.user?.admin });
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        logger.info('Fetching user chats', { adminEmail: session.user.email });

        const userChats = await db
            .select({
                userId: users.id,
                userName: users.name,
                userEmail: users.email,
                lastMessage: sql<string>`(SELECT content FROM messages WHERE user_id = ${users.id} ORDER BY created_at DESC LIMIT 1)`,
                lastMessageTime: sql<string>`(SELECT created_at FROM messages WHERE user_id = ${users.id} ORDER BY created_at DESC LIMIT 1)`,
                unreadCount: sql<number>`(SELECT COUNT(*) FROM messages WHERE user_id = ${users.id} AND is_read = 0 AND is_from_admin = 0)`,
            })
            .from(users)
            .where(sql`${users.id} IN (SELECT DISTINCT user_id FROM messages)`)
            .orderBy(desc(sql`(SELECT created_at FROM messages WHERE user_id = ${users.id} ORDER BY created_at DESC LIMIT 1)`));

        logger.info('User chats fetched successfully', { count: userChats.length });
        return NextResponse.json(userChats);
    } catch (error) {
        logger.error('Error fetching user chats', { error: error instanceof Error ? error.message : String(error) });
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
});
