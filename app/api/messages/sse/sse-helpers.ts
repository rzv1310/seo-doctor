import { logger } from '@/lib/logger';



interface ClientInfo {
    controller: ReadableStreamDefaultController;
    isAdmin: boolean;
}

export const clients = new Map<string, ClientInfo>();

export function sendMessageToUser(userId: string, message: any) {
    const clientInfo = clients.get(userId);
    logger.debug('Sending SSE message to user', { 
        userId, 
        connected: !!clientInfo,
        messageType: message.type 
    });
    
    if (clientInfo) {
        const encoder = new TextEncoder();
        const data = `data: ${JSON.stringify(message)}\n\n`;
        try {
            clientInfo.controller.enqueue(encoder.encode(data));
            logger.debug('SSE message sent successfully', { userId });
        } catch (error) {
            logger.error('Failed to send SSE message', { 
                userId, 
                error: error instanceof Error ? error.message : String(error) 
            });
            clients.delete(userId);
        }
    }
}

export function broadcastToAdmins(message: any) {
    const encoder = new TextEncoder();
    const data = `data: ${JSON.stringify(message)}\n\n`;
    let adminCount = 0;

    clients.forEach((clientInfo, userId) => {
        if (clientInfo.isAdmin) {
            try {
                clientInfo.controller.enqueue(encoder.encode(data));
                adminCount++;
            } catch (error) {
                clients.delete(userId);
            }
        }
    });
    
    logger.debug('Broadcast to admins', { 
        adminCount, 
        messageType: message.type 
    });
}
