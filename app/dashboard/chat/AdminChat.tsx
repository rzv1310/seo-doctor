'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useChat } from '@/hooks/useChat';
import { DashboardPageLayout } from '@/components/layout';
import { ChatWindow, ChatSelector, ChatHeader } from '@/components/dashboard/chat';



export default function AdminChat() {
    const { user } = useAuth();
    const { userChats, messages, loading, sendMessage, fetchMessages, markAsRead, fetchUserChats, deleteConversation } = useChat();
    const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
    const [showUserList, setShowUserList] = useState(true);

    // Select first user with unread messages or first user
    useEffect(() => {
        if (userChats.length > 0 && !selectedUserId) {
            const userWithUnread = userChats.find(chat => chat.unreadCount > 0);
            setSelectedUserId(userWithUnread ? parseInt(userWithUnread.userId) : parseInt(userChats[0].userId));
        }
    }, [userChats, selectedUserId]);

    // Ensure user list is shown on mobile when no user is selected
    useEffect(() => {
        if (!selectedUserId && window.innerWidth < 900) {
            setShowUserList(true);
        }
    }, [selectedUserId]);

    // Fetch messages for selected user
    useEffect(() => {
        if (selectedUserId) {
            fetchMessages(selectedUserId.toString());
        }
    }, [selectedUserId, fetchMessages]);

    // Mark messages as read when selecting a user
    useEffect(() => {
        if (selectedUserId && messages.length > 0) {
            const unreadMessages = messages
                .filter(msg => !msg.isRead && !msg.isFromAdmin && msg.userId === selectedUserId.toString())
                .map(msg => msg.id);

            if (unreadMessages.length > 0) {
                markAsRead(unreadMessages).then(() => {
                    if (user?.admin) {
                        setTimeout(() => {
                            fetchUserChats();
                        }, 100);
                    }
                });
            }
        }
    }, [selectedUserId, messages, markAsRead, user, fetchUserChats]);

    // Transform userChats for ChatSelector
    const chatUsers = useMemo(() => {
        return userChats.map(chat => ({
            id: parseInt(chat.userId),
            name: chat.userName,
            email: chat.userEmail,
            admin: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            lastMessage: chat.lastMessage ? {
                content: chat.lastMessage,
                createdAt: chat.lastMessageTime || new Date().toISOString(),
                isFromAdmin: false
            } : undefined,
            unreadCount: chat.unreadCount
        }));
    }, [userChats]);

    const selectedUserChat = userChats.find(chat => chat.userId === selectedUserId?.toString());
    const userMessages = useMemo(() =>
        selectedUserId ? messages.filter(msg => msg.userId === selectedUserId.toString()) : [],
        [selectedUserId, messages]
    );

    // Handle user selection
    const handleUserSelect = (userId: number) => {
        setSelectedUserId(userId);
        if (window.innerWidth < 900) {
            setShowUserList(false);
        }
    };

    // Handle back button on mobile
    const handleBackToList = () => {
        setShowUserList(true);
    };

    // Handle delete conversation
    const handleDeleteConversation = async () => {
        if (selectedUserId && window.confirm('Sigur doriți să ștergeți această conversație?')) {
            const success = await deleteConversation(selectedUserId.toString());
            if (success) {
                setSelectedUserId(null);
            }
        }
    };

    // Handle send message
    const handleSendMessage = async (content: string) => {
        if (selectedUserId) {
            await sendMessage(content, selectedUserId.toString());
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
                        <ChatSelector
                            users={chatUsers}
                            selectedUserId={selectedUserId}
                            onSelectUser={handleUserSelect}
                        />
                    </div>

                    {/* Chat area */}
                    <div className={`flex-1 dashboard-card flex flex-col min-h-0 chat-area-responsive ${!showUserList ? 'show-chat' : ''}`}>
                        {selectedUserChat ? (
                            <>
                                <div className="relative">
                                    <button
                                        onClick={handleBackToList}
                                        className="mobile-only absolute left-4 top-1/2 -translate-y-1/2 text-text-primary/70 hover:text-white transition-colors cursor-pointer z-10"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                        </svg>
                                    </button>
                                    <ChatHeader
                                        title={selectedUserChat.userName}
                                        subtitle={selectedUserChat.userEmail}
                                        showDeleteButton={true}
                                        onDelete={handleDeleteConversation}
                                    />
                                </div>

                                <div className="flex-1 overflow-hidden">
                                    <ChatWindow
                                        messages={userMessages}
                                        isLoading={false}
                                        error={null}
                                        onSendMessage={handleSendMessage}
                                        isAdmin={true}
                                        recipientName={selectedUserChat.userName}
                                    />
                                </div>
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
