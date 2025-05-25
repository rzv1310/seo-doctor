import { NextRequest, NextResponse } from 'next/server';
import db from '@/database';
import { messages, users } from '@/database/schema';
import { verifyApiAuth } from '@/lib/auth';
import { desc, asc, eq, and, or } from 'drizzle-orm';
import { generateId } from '@/lib/utils';
import { sendMessageToUser, broadcastToAdmins } from './sse/sse-helpers';
import { logger, withLogging } from '@/lib/logger';

export const GET = withLogging(async (request: NextRequest) => {
    try {
        const session = await verifyApiAuth(request);
        if (!session.isAuthenticated) {
            logger.auth('Unauthorized access attempt to messages', { path: '/api/messages' });
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');
        
        logger.info('Fetching messages', { 
            userEmail: session.user.email, 
            isAdmin: session.user.admin, 
            filterUserId: userId 
        });

        let query;
        if (session.user.admin) {
            // Admin can see all messages or filter by user
            query = userId ? eq(messages.userId, userId) : undefined;
        } else {
            // Regular users can only see their own messages
            query = eq(messages.userId, session.user.id);
        }

        const userMessages = await db
            .select({
                id: messages.id,
                userId: messages.userId,
                content: messages.content,
                isFromAdmin: messages.isFromAdmin,
                isRead: messages.isRead,
                createdAt: messages.createdAt,
                userName: users.name,
                userEmail: users.email,
            })
            .from(messages)
            .leftJoin(users, eq(messages.userId, users.id))
            .where(query)
            .orderBy(asc(messages.createdAt));

        logger.info('Messages fetched successfully', { count: userMessages.length });
        return NextResponse.json(userMessages);
    } catch (error) {
        logger.error('Error fetching messages', { error: error instanceof Error ? error.message : String(error) });
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
});

export const POST = withLogging(async (request: NextRequest) => {
    try {
        const session = await verifyApiAuth(request);
        if (!session.isAuthenticated) {
            logger.auth('Unauthorized message post attempt', { path: '/api/messages' });
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { content, userId } = body;
        
        logger.info('Creating message', { 
            userEmail: session.user.email, 
            isAdmin: session.user.admin, 
            targetUserId: userId 
        });

        if (!content || content.trim().length === 0) {
            return NextResponse.json({ error: 'Message content is required' }, { status: 400 });
        }

        // For admin sending to a user
        const targetUserId = session.user.admin && userId ? userId : session.user.id;

        const messageId = generateId();
        const newMessage = {
            id: messageId,
            userId: targetUserId,
            content: content.trim(),
            isFromAdmin: session.user.admin === true ? true : false,
            isRead: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        logger.debug('Message details', { messageId, isFromAdmin: newMessage.isFromAdmin });

        try {
            await db.insert(messages).values(newMessage);
            logger.info('Message inserted successfully', { messageId });
        } catch (dbError) {
            logger.error('Database insert failed', { error: dbError instanceof Error ? dbError.message : String(dbError) });
            throw dbError;
        }

        // Send real-time update
        if (session.user.admin) {
            // Admin sending to user
            sendMessageToUser(targetUserId, {
                type: 'new_message',
                message: newMessage,
            });
        } else {
            // User sending to admin - broadcast to all admins
            const admins = await db
                .select({ id: users.id })
                .from(users)
                .where(eq(users.admin, true));
            
            logger.info('Broadcasting to admins', { adminCount: admins.length });
            
            admins.forEach(admin => {
                logger.debug('Sending message to admin', { adminId: admin.id });
                sendMessageToUser(admin.id, {
                    type: 'new_message',
                    message: newMessage,
                });
            });
        }

        logger.info('Message created successfully', { messageId });
        return NextResponse.json(newMessage);
    } catch (error) {
        logger.error('Error creating message', { error: error instanceof Error ? error.message : String(error) });
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
});

export const PATCH = withLogging(async (request: NextRequest) => {
    try {
        const session = await verifyApiAuth(request);
        if (!session.isAuthenticated) {
            logger.auth('Unauthorized message update attempt', { path: '/api/messages' });
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { messageIds } = body;
        
        logger.info('Marking messages as read', { 
            userEmail: session.user.email, 
            isAdmin: session.user.admin, 
            messageCount: messageIds.length 
        });

        if (!messageIds || !Array.isArray(messageIds)) {
            return NextResponse.json({ error: 'Invalid message IDs' }, { status: 400 });
        }

        // Mark messages as read
        const query = session.user.admin
            ? and(...messageIds.map(id => eq(messages.id, id)))
            : and(
                eq(messages.userId, session.user.id),
                or(...messageIds.map(id => eq(messages.id, id)))
            );

        await db
            .update(messages)
            .set({ isRead: true, updatedAt: new Date().toISOString() })
            .where(query);

        // Broadcast message read event
        if (session.user.admin) {
            // Admin marking messages as read
            broadcastToAdmins({
                type: 'message_read',
                messageIds,
            });
        } else {
            // User marking messages as read - notify admins
            const admins = await db
                .select({ id: users.id })
                .from(users)
                .where(eq(users.admin, true));

            admins.forEach(admin => {
                sendMessageToUser(admin.id, {
                    type: 'message_read',
                    messageIds,
                    userId: session.user.id,
                });
            });
        }

        logger.info('Messages marked as read successfully', { messageCount: messageIds.length });
        return NextResponse.json({ success: true });
    } catch (error) {
        logger.error('Error updating messages', { error: error instanceof Error ? error.message : String(error) });
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export const DELETE = withLogging(async (request: NextRequest) => {
    try {
        const session = await verifyApiAuth(request);
        if (!session.isAuthenticated || !session.user.admin) {
            logger.auth('Unauthorized delete attempt', { path: '/api/messages', isAdmin: session.user?.admin });
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');
        
        if (!userId) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
        }
        
        logger.info('Deleting messages', { adminEmail: session.user.email, targetUserId: userId });

        await db
            .delete(messages)
            .where(eq(messages.userId, userId));
            
        logger.info('Messages deleted successfully', { userId });

        // Notify connected users
        sendMessageToUser(userId, {
            type: 'conversation_deleted',
            userId,
        });
        
        // Also notify the admin
        sendMessageToUser(session.user.id, {
            type: 'conversation_deleted',
            userId,
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        logger.error('Error deleting messages', { error: error instanceof Error ? error.message : String(error) });
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
});