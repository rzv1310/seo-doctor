import { NextRequest, NextResponse } from 'next/server';
import { verifyApiAuth } from '@/lib/auth';

// Store active connections
const clients = new Map<string, ReadableStreamDefaultController>();

export async function GET(request: NextRequest) {
    const session = await verifyApiAuth(request);
    if (!session.isAuthenticated) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
        start(controller) {
            // Store the controller for this user
            clients.set(session.user.id, controller);
            console.log(`SSE: User ${session.user.id} (${session.user.email}) connected. Total clients: ${clients.size}`);

            // Send initial connection message
            const data = `data: ${JSON.stringify({ type: 'connected', userId: session.user.id })}\n\n`;
            controller.enqueue(encoder.encode(data));

            // Clean up on disconnect
            request.signal.addEventListener('abort', () => {
                clients.delete(session.user.id);
                console.log(`SSE: User ${session.user.id} disconnected. Total clients: ${clients.size}`);
                controller.close();
            });
        },
    });

    return new NextResponse(stream, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
        },
    });
}

// Helper function to send message to specific user(s)
export function sendMessageToUser(userId: string, message: any) {
    const controller = clients.get(userId);
    console.log(`Sending message to user ${userId}, connected: ${!!controller}`);
    if (controller) {
        const encoder = new TextEncoder();
        const data = `data: ${JSON.stringify(message)}\n\n`;
        try {
            controller.enqueue(encoder.encode(data));
            console.log(`Message sent successfully to ${userId}`);
        } catch (error) {
            console.error(`Failed to send to ${userId}:`, error);
            // Client disconnected, remove from map
            clients.delete(userId);
        }
    } else {
        console.log(`User ${userId} not connected to SSE`);
    }
}

// Helper function to broadcast to all connected clients
export function broadcastToAdmins(message: any) {
    const encoder = new TextEncoder();
    const data = `data: ${JSON.stringify(message)}\n\n`;
    
    clients.forEach((controller, userId) => {
        try {
            controller.enqueue(encoder.encode(data));
        } catch (error) {
            // Client disconnected, remove from map
            clients.delete(userId);
        }
    });
}