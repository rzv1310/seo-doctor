import { useState, useEffect, useCallback, useRef } from 'react';
import { usePathname } from 'next/navigation';

import { useAuth } from '@/context/AuthContext';
import { useLogger } from '@/lib/client-logger';
import { Message, UserChat } from '@/types/message';

export function useChat() {
    const { user } = useAuth();
    const pathname = usePathname();
    const logger = useLogger('useChat');
    const [messages, setMessages] = useState<Message[]>([]);
    const [userChats, setUserChats] = useState<UserChat[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [eventSource, setEventSource] = useState<EventSource | null>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const sseConnectedRef = useRef(false);

    // Fetch messages
    const fetchMessages = useCallback(async (userId?: string, isManualRefresh = false) => {
        try {
            if (isManualRefresh) {
                setIsRefreshing(true);
            }
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
            logger.error('Error fetching messages', err);
        } finally {
            setLoading(false);
            if (isManualRefresh) {
                setIsRefreshing(false);
            }
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
            logger.error('Error fetching user chats', err);
        }
    }, [user]);

    // Send message
    const sendMessage = useCallback(async (content: string, userId?: string) => {
        try {
            setError(null);

            logger.info('Sending message', { userId, contentLength: content.length });

            const response = await fetch('/api/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content, userId }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
                logger.error('Send message failed', new Error(errorData.error), { status: response.status });
                throw new Error(errorData.error || 'Failed to send message');
            }
            const newMessage = await response.json();
            logger.info('Message sent successfully', { messageId: newMessage.id });

            setMessages(prev => [...prev, newMessage]);

            return newMessage;
        } catch (err) {
            setError('Failed to send message');
            logger.error('Error sending message', err);
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
            logger.error('Error marking messages as read', err);
        }
    }, []);

    // Manual refresh function
    const refreshMessages = useCallback(async (userId?: string) => {
        await fetchMessages(userId, true);
        if (user?.admin) {
            await fetchUserChats();
        }
    }, [fetchMessages, fetchUserChats, user]);

    // Set up polling based on current page
    useEffect(() => {
        if (!user || pathname !== '/dashboard/chat') return;

        // Clear existing interval
        if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
        }

        // Only set up polling if SSE is not connected
        if (!sseConnectedRef.current) {
            // Poll every 8 seconds on chat page
            pollingIntervalRef.current = setInterval(() => {
                fetchMessages();
                if (user.admin) {
                    fetchUserChats();
                }
            }, 8000);
            
            logger.info('Chat polling started (8s interval)');
        }

        return () => {
            if (pollingIntervalRef.current) {
                clearInterval(pollingIntervalRef.current);
                pollingIntervalRef.current = null;
            }
        };
    }, [user, pathname, fetchMessages, fetchUserChats]);

    // Set up SSE connection
    useEffect(() => {
        if (!user) return;

        let es: EventSource | null = null;
        
        try {
            es = new EventSource('/api/messages/sse');

            es.onopen = () => {
                sseConnectedRef.current = true;
                logger.info('Chat SSE connected');
                // Clear polling if SSE connects
                if (pollingIntervalRef.current) {
                    clearInterval(pollingIntervalRef.current);
                    pollingIntervalRef.current = null;
                }
            };

            es.onmessage = (event) => {
                const data = JSON.parse(event.data);
                logger.info('SSE message received', { type: data.type });

                if (data.type === 'new_message') {
                    if (!user.admin) {
                        setMessages(prev => [...prev, data.message]);
                    } else {
                        setMessages(prev => [...prev, data.message]);
                        fetchUserChats();
                    }
                } else if (data.type === 'message_read') {
                    if (data.messageIds && Array.isArray(data.messageIds)) {
                        setMessages(prev =>
                            prev.map(msg =>
                                data.messageIds.includes(msg.id)
                                    ? { ...msg, isRead: true }
                                    : msg
                            )
                        );
                        if (user.admin) {
                            fetchUserChats();
                        }
                    }
                } else if (data.type === 'conversation_deleted') {
                    if (!user.admin && data.userId === user.id) {
                        setMessages([]);
                        setError('Your conversation has been deleted by an administrator');
                    } else if (user.admin) {
                        setMessages(prev => prev.filter(msg => msg.userId !== data.userId));
                        setUserChats(prev => prev.filter(chat => chat.userId !== data.userId));
                    }
                }
            };

            es.onerror = (error) => {
                logger.error('SSE error', error);
                sseConnectedRef.current = false;
                // Start polling as fallback when on chat page
                if (pathname === '/dashboard/chat' && !pollingIntervalRef.current) {
                    pollingIntervalRef.current = setInterval(() => {
                        fetchMessages();
                        if (user.admin) {
                            fetchUserChats();
                        }
                    }, 8000);
                    logger.info('SSE failed, started polling fallback (8s)');
                }
            };

            setEventSource(es);
        } catch (error) {
            logger.error('Failed to create SSE connection', error);
            sseConnectedRef.current = false;
        }

        return () => {
            if (es) {
                es.close();
            }
            sseConnectedRef.current = false;
        };
    }, [user, pathname]);

    // Initial data fetch
    useEffect(() => {
        if (user) {
            fetchMessages();
            if (user.admin) {
                fetchUserChats();
            }
        }
    }, [user]);

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
            logger.error('Error deleting conversation', err);
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
        refreshMessages,
        isRefreshing,
    };
}
