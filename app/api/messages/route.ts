import { NextRequest, NextResponse } from 'next/server';
import db from '@/database';
import { messages, users } from '@/database/schema';
import { verifyApiAuth } from '@/lib/auth';
import { desc, asc, eq, and, or } from 'drizzle-orm';
import { generateId } from '@/lib/utils';
import { sendMessageToUser, broadcastToAdmins } from './sse/sse-helpers';

export async function GET(request: NextRequest) {
    try {
        const session = await verifyApiAuth(request);
        if (!session.isAuthenticated) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');
        
        console.log('GET /api/messages - User:', session.user.email, 'Admin:', session.user.admin, 'Filter userId:', userId);

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

        return NextResponse.json(userMessages);
    } catch (error) {
        console.error('Error fetching messages:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await verifyApiAuth(request);
        if (!session.isAuthenticated) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { content, userId } = body;
        
        console.log('POST /api/messages - User:', session.user.email, 'Admin:', session.user.admin, 'Content:', content, 'UserId:', userId);

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

        console.log('Creating message:', newMessage);

        try {
            // Simple insert
            console.log('Inserting message into database...');
            await db.insert(messages).values(newMessage);
            console.log('Insert completed');
        } catch (dbError) {
            console.error('Database insert failed:', dbError);
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
            
            console.log('Broadcasting to admins:', admins.length, 'admins found');
            
            admins.forEach(admin => {
                console.log('Sending message to admin:', admin.id);
                sendMessageToUser(admin.id, {
                    type: 'new_message',
                    message: newMessage,
                });
            });
        }

        console.log('Returning new message:', newMessage);
        return NextResponse.json(newMessage);
    } catch (error) {
        console.error('Error creating message:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const session = await verifyApiAuth(request);
        if (!session.isAuthenticated) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { messageIds } = body;
        
        console.log('PATCH /api/messages - User:', session.user.email, 'Admin:', session.user.admin, 'MessageIds:', messageIds);

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

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating messages:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const session = await verifyApiAuth(request);
        if (!session.isAuthenticated || !session.user.admin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');
        
        if (!userId) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
        }
        
        console.log('DELETE /api/messages - Admin:', session.user.email, 'Deleting messages for user:', userId);

        // Delete all messages for this user
        await db
            .delete(messages)
            .where(eq(messages.userId, userId));
            
        console.log('Messages deleted successfully');

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
        console.error('Error deleting messages:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}