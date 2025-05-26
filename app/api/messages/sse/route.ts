import { NextRequest, NextResponse } from 'next/server';
import { verifyApiAuth } from '@/lib/auth';
import { withLogging } from '@/lib/logger';
import { clients } from './sse-helpers';



export const GET = withLogging(async (request: NextRequest) => {
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
});
