import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';



interface Message {
    id: string;
    userId: string;
    content: string;
    isFromAdmin: boolean;
    isRead: boolean;
    createdAt: string;
    userName?: string;
    userEmail?: string;
}

interface UserChat {
    userId: string;
    userName: string;
    userEmail: string;
    lastMessage: string;
    lastMessageTime: string;
    unreadCount: number;
}

export function useChat() {
    const { user } = useAuth();
    const [messages, setMessages] = useState<Message[]>([]);
    const [userChats, setUserChats] = useState<UserChat[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [eventSource, setEventSource] = useState<EventSource | null>(null);

    // Fetch messages
    const fetchMessages = useCallback(async (userId?: string) => {
        try {
            const url = userId
                ? `/api/messages?userId=${userId}`
                : '/api/messages';
            const response = await fetch(url);
            if (!response.ok) throw new Error('Failed to fetch messages');
            const data = await response.json();
            setMessages(data);
            setError(null);
        } catch (err) {
            setError('Failed to load messages');
            console.error('Error fetching messages:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch user chats (for admin)
    const fetchUserChats = useCallback(async () => {
        if (!user?.admin) return;

        try {
            const response = await fetch('/api/messages/users');
            if (!response.ok) throw new Error('Failed to fetch user chats');
            const data = await response.json();
            setUserChats(data);
        } catch (err) {
            console.error('Error fetching user chats:', err);
        }
    }, [user]);

    // Send message
    const sendMessage = useCallback(async (content: string, userId?: string) => {
        try {
            const response = await fetch('/api/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content, userId }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
                console.error('Send message failed:', response.status, errorData);
                throw new Error(errorData.error || 'Failed to send message');
            }
            const newMessage = await response.json();

            // Optimistically update UI
            setMessages(prev => [...prev, newMessage]);

            return newMessage;
        } catch (err) {
            setError('Failed to send message');
            console.error('Error sending message:', err);
            throw err;
        }
    }, []);

    // Mark messages as read
    const markAsRead = useCallback(async (messageIds: string[]) => {
        try {
            const response = await fetch('/api/messages', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messageIds }),
            });

            if (!response.ok) throw new Error('Failed to mark messages as read');

            // Update local state
            setMessages(prev =>
                prev.map(msg =>
                    messageIds.includes(msg.id)
                        ? { ...msg, isRead: true }
                        : msg
                )
            );
        } catch (err) {
            console.error('Error marking messages as read:', err);
        }
    }, []);

    // Set up SSE connection
    useEffect(() => {
        if (!user) return;

        const es = new EventSource('/api/messages/sse');

        es.onmessage = (event) => {
            const data = JSON.parse(event.data);
            console.log('SSE message received:', data);

            if (data.type === 'new_message') {
                // For regular users, add all their messages
                if (!user.admin) {
                    setMessages(prev => [...prev, data.message]);
                } else {
                    // For admin, only add if no filter or matches current filter
                    // The messages will be properly filtered in the component
                    setMessages(prev => [...prev, data.message]);
                    // Also refresh user chats to update last message and unread count
                    fetchUserChats();
                }
            }
        };

        es.onerror = (error) => {
            console.error('SSE error:', error);
            es.close();
            // Attempt to reconnect after 5 seconds
            setTimeout(() => {
                setEventSource(new EventSource('/api/messages/sse'));
            }, 5000);
        };

        setEventSource(es);

        return () => {
            es.close();
        };
    }, [user, fetchUserChats]);

    // Initial data fetch
    useEffect(() => {
        if (user) {
            fetchMessages();
            if (user.admin) {
                fetchUserChats();
            }
        }
    }, [user, fetchMessages, fetchUserChats]);

    // Delete conversation (admin only)
    const deleteConversation = useCallback(async (userId: string) => {
        if (!user?.admin) return;

        try {
            const response = await fetch(`/api/messages?userId=${userId}`, {
                method: 'DELETE',
            });

            if (!response.ok) throw new Error('Failed to delete conversation');

            // Remove from local state
            setMessages(prev => prev.filter(msg => msg.userId !== userId));
            setUserChats(prev => prev.filter(chat => chat.userId !== userId));

            return true;
        } catch (err) {
            console.error('Error deleting conversation:', err);
            setError('Failed to delete conversation');
            return false;
        }
    }, [user]);

    return {
        messages,
        userChats,
        loading,
        error,
        sendMessage,
        markAsRead,
        fetchMessages,
        fetchUserChats,
        deleteConversation,
    };
}
