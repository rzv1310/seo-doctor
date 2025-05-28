import { NextRequest, NextResponse } from 'next/server';

import { verifyApiAuth } from '@/lib/auth';
import { withLogging, logger } from '@/lib/logger';

import { clients } from './sse-helpers';



export const GET = withLogging(async (request: NextRequest) => {
    const session = await verifyApiAuth(request);
    if (!session.isAuthenticated) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
        start(controller) {
            clients.set(session.user.id, {
                controller,
                isAdmin: session.user.admin || false
            });
            logger.info('SSE client connected', {
                userId: session.user.id,
                userEmail: session.user.email,
                isAdmin: session.user.admin,
                totalClients: clients.size
            });

            const data = `data: ${JSON.stringify({ type: 'connected', userId: session.user.id })}\n\n`;
            controller.enqueue(encoder.encode(data));

            request.signal.addEventListener('abort', () => {
                clients.delete(session.user.id);
                logger.info('SSE client disconnected', {
                    userId: session.user.id,
                    totalClients: clients.size
                });
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
