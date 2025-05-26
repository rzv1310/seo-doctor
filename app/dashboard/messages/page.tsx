'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useChat } from '@/hooks/useChat';
import { ActionButton } from '@/components/ui';
import { DashboardPageLayout } from '@/components/layout';



export default function MessagesPage() {
    const { user } = useAuth();
    const { userChats, messages, loading, sendMessage, fetchMessages, markAsRead, fetchUserChats, deleteConversation } = useChat();
    const [selectedUser, setSelectedUser] = useState<string | null>(null);
    const [inputMessage, setInputMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [showUserList, setShowUserList] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Note: Access control is now handled in chat/page.tsx

    // Select first user with unread messages or first user
    useEffect(() => {
        if (userChats.length > 0 && !selectedUser) {
            const userWithUnread = userChats.find(chat => chat.unreadCount > 0);
            setSelectedUser(userWithUnread?.userId || userChats[0].userId);
        }
    }, [userChats, selectedUser]);

    // Ensure user list is shown on mobile when no user is selected
    useEffect(() => {
        if (!selectedUser && window.innerWidth < 900) {
            setShowUserList(true);
        }
    }, [selectedUser]);

    // Fetch messages for selected user
    useEffect(() => {
        if (selectedUser) {
            fetchMessages(selectedUser);
        }
    }, [selectedUser, fetchMessages]);

    // Mark messages as read when selecting a user
    useEffect(() => {
        if (selectedUser && messages.length > 0) {
            const unreadMessages = messages
                .filter(msg => !msg.isRead && !msg.isFromAdmin && msg.userId === selectedUser)
                .map(msg => msg.id);

            if (unreadMessages.length > 0) {
                markAsRead(unreadMessages).then(() => {
                    // Force a refresh of the user chats to update unread counts
                    if (user?.admin) {
                        fetchUserChats();
                    }
                });
            }
        }
    }, [selectedUser, messages, markAsRead, user, fetchUserChats]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputMessage.trim() || !selectedUser || sending) return;

        setSending(true);
        try {
            await sendMessage(inputMessage, selectedUser);
            setInputMessage('');
        } catch (err) {
            // Error handled in hook
        } finally {
            setSending(false);
        }
    };

    const formatTime = (dateString: string | null | undefined) => {
        if (!dateString) return '';

        const date = new Date(dateString);
        if (isNaN(date.getTime())) return '';

        const now = new Date();
        const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

        if (diffInHours < 24) {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else {
            return date.toLocaleDateString('ro-RO');
        }
    };

    const selectedUserChat = userChats.find(chat => chat.userId === selectedUser);
    const userMessages = useMemo(() =>
        selectedUser ? messages.filter(msg => msg.userId === selectedUser) : [],
        [selectedUser, messages]
    );

    // Scroll to bottom when messages change
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [userMessages]);

    // Handle user selection on mobile
    const handleUserSelect = (userId: string) => {
        setSelectedUser(userId);
        if (window.innerWidth < 900) {
            setShowUserList(false);
        }
    };

    // Handle back button on mobile
    const handleBackToList = () => {
        setShowUserList(true);
    };

    // Handle delete conversation
    const handleDeleteConversation = async (userId: string) => {
        if (window.confirm('Sigur doriți să ștergeți această conversație?')) {
            const success = await deleteConversation(userId);
            if (success && selectedUser === userId) {
                setSelectedUser(null);
            }
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <>
            <style jsx>{`
                @media (min-width: 900px) {
                    .user-list-responsive {
                        display: flex !important;
                        width: 320px !important;
                        position: relative !important;
                        inset: auto !important;
                        z-index: auto !important;
                    }
                    .chat-area-responsive {
                        display: flex !important;
                    }
                    .mobile-only {
                        display: none !important;
                    }
                    .messages-container {
                        gap: 1rem !important;
                    }
                }
                @media (max-width: 899px) {
                    .user-list-responsive.show-list {
                        display: flex !important;
                        width: 100% !important;
                        position: absolute !important;
                        inset: 0 !important;
                        z-index: 10 !important;
                    }
                    .user-list-responsive:not(.show-list) {
                        display: none !important;
                    }
                    .chat-area-responsive.show-chat {
                        display: flex !important;
                    }
                    .chat-area-responsive:not(.show-chat) {
                        display: none !important;
                    }
                }
            `}</style>
            <DashboardPageLayout
                title="Chat"
                subtitle="Gestionați conversațiile cu clienții"
                fullHeight={true}
            >
                <div className="flex gap-0 flex-1 min-h-0 relative messages-container" style={{ gap: '0' }}>
                    {/* User list */}
                    <div
                        className={`dashboard-card flex flex-col transition-all duration-300 user-list-responsive ${showUserList ? 'show-list' : ''
                            }`}
                    >
                        <div className="p-4 border-b border-border-color flex items-center justify-between">
                            <h2 className="font-semibold">Conversații</h2>
                        </div>
                        <div className="flex-grow overflow-y-auto">
                            {userChats.length === 0 ? (
                                <div className="p-4 text-center text-text-primary">
                                    <p>Nu există conversații</p>
                                </div>
                            ) : (
                                userChats.map((chat) => (
                                    <div
                                        key={chat.userId}
                                        className={`w-full border-b border-border-color transition-all duration-200 relative group ${selectedUser === chat.userId
                                                ? 'bg-dark-blue-lighter border-l-4 border-l-primary'
                                                : 'hover:bg-dark-blue-lighter/50'
                                            }`}
                                    >
                                        <button
                                            onClick={() => handleUserSelect(chat.userId)}
                                            className="w-full p-4 text-left cursor-pointer"
                                        >
                                            <div className="flex justify-between items-start mb-1">
                                                <h3 className={`font-medium truncate pr-2 ${selectedUser === chat.userId ? 'text-text-primary' : 'group-hover:text-primary'
                                                    }`}>
                                                    {chat.userName}
                                                </h3>
                                                <div className="flex items-center gap-2">
                                                    {chat.unreadCount > 0 && (
                                                        <span className="bg-primary text-white text-xs px-2 py-1 rounded-full animate-pulse">
                                                            {chat.unreadCount}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <p className="text-sm text-text-primary truncate">{chat.userEmail}</p>
                                            {chat.lastMessage && (
                                                <p className="text-sm text-text-primary mt-2 truncate italic">"{chat.lastMessage}"</p>
                                            )}
                                            {chat.lastMessageTime && formatTime(chat.lastMessageTime) && (
                                                <p className="text-xs text-text-primary/70 mt-1">
                                                    {formatTime(chat.lastMessageTime)}
                                                </p>
                                            )}
                                        </button>
                                        <div className={`absolute right-4 top-1/2 -translate-y-1/2 transition-opacity ${selectedUser === chat.userId ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                                            }`}>
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-text-primary/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Chat area */}
                    <div className={`flex-1 dashboard-card flex flex-col min-h-0 chat-area-responsive ${!showUserList ? 'show-chat' : ''}`}>
                        {selectedUserChat ? (
                            <>
                                <div className="p-4 border-b border-border-color flex items-center justify-between shrink-0">
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={handleBackToList}
                                            className="mobile-only text-text-primary/70 hover:text-white transition-colors cursor-pointer"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                            </svg>
                                        </button>
                                        <div>
                                            <h2 className="font-semibold">{selectedUserChat.userName}</h2>
                                            <p className="text-sm text-text-primary">{selectedUserChat.userEmail}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleDeleteConversation(selectedUser || '')}
                                        className="text-red-500 hover:text-red-600 transition-colors cursor-pointer"
                                        title="Șterge conversația"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>

                                <div className="flex-1 overflow-y-auto p-4 min-h-0">
                                    {userMessages.map((message) => (
                                        <div
                                            key={message.id}
                                            className={`mb-4 flex ${message.isFromAdmin ? 'justify-end' : 'justify-start'}`}
                                        >
                                            <div
                                                className={`max-w-[70%] p-3 rounded-lg ${message.isFromAdmin
                                                        ? 'bg-primary text-white rounded-tr-none'
                                                        : 'bg-dark-blue-lighter rounded-tl-none'
                                                    }`}
                                            >
                                                <p className="whitespace-pre-wrap">{message.content}</p>
                                                <p className={`text-xs mt-1 ${message.isFromAdmin ? 'text-white/70' : 'text-text-primary'
                                                    }`}>
                                                    {formatTime(message.createdAt)}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                    <div ref={messagesEndRef} />
                                </div>

                                <form onSubmit={handleSendMessage} className="p-4 border-t border-border-color flex gap-2 shrink-0">
                                    <input
                                        type="text"
                                        value={inputMessage}
                                        onChange={(e) => setInputMessage(e.target.value)}
                                        placeholder="Scrieți un mesaj..."
                                        className="flex-1 bg-dark-blue-lighter border border-border-color rounded-md px-4 py-2 focus:outline-none focus:border-primary"
                                        disabled={sending}
                                    />
                                    <ActionButton
                                        type="submit"
                                        size="sm"
                                        disabled={inputMessage.trim() === '' || sending}
                                        showArrow={false}
                                        fullRounded={false}
                                    >
                                        {sending ? (
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        ) : (
                                            <>
                                                Trimite
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ transform: 'rotate(45deg)' }}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                                </svg>
                                            </>
                                        )}
                                    </ActionButton>
                                </form>
                            </>
                        ) : (
                            <div className="flex-grow flex items-center justify-center text-text-primary p-4">
                                <div className="text-center">
                                    <p className="mb-4">Selectați o conversație pentru a începe</p>
                                    <button
                                        onClick={handleBackToList}
                                        className="mobile-only bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
                                    >
                                        Vezi conversații
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </DashboardPageLayout>
        </>
    );
}
