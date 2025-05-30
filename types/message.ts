export interface Message {
    id: string;
    userId: string;
    content: string;
    isFromAdmin: boolean;
    isRead: boolean;
    createdAt: string;
    userName?: string;
    userEmail?: string;
}


export interface UserChat {
    userId: string;
    userName: string;
    userEmail: string;
    lastMessage: string;
    lastMessageTime: string;
    unreadCount: number;
}


export interface ClientInfo {
    controller: ReadableStreamDefaultController;
    isAdmin: boolean;
}