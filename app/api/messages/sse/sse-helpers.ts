// Store active connections
export const clients = new Map<string, ReadableStreamDefaultController>();

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