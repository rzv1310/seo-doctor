import { NextRequest, NextResponse } from 'next/server';
import db from '@/database';
import { messages, users } from '@/database/schema';
import { verifyApiAuth } from '@/lib/auth';
import { desc, eq, sql } from 'drizzle-orm';

export async function GET(request: NextRequest) {
    try {
        const session = await verifyApiAuth(request);
        if (!session.isAuthenticated || !session.user.admin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get unique users who have sent messages with their latest message and unread count
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

        return NextResponse.json(userChats);
    } catch (error) {
        console.error('Error fetching user chats:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}