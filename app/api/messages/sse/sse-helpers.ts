interface ClientInfo {
    controller: ReadableStreamDefaultController;
    isAdmin: boolean;
}

export const clients = new Map<string, ClientInfo>();

export function sendMessageToUser(userId: string, message: any) {
    const clientInfo = clients.get(userId);
    console.log(`Sending message to user ${userId}, connected: ${!!clientInfo}`);
    if (clientInfo) {
        const encoder = new TextEncoder();
        const data = `data: ${JSON.stringify(message)}\n\n`;
        try {
            clientInfo.controller.enqueue(encoder.encode(data));
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
                // Client disconnected, remove from map
                clients.delete(userId);
            }
        }
    });
    
    console.log(`Broadcast to ${adminCount} admin(s):`, message.type);
}
