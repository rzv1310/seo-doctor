'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ActionButton } from '@/components/ui';
import { useChat } from '@/hooks/useChat';



export default function ChatInterface() {
    const { messages, loading, error, sendMessage, markAsRead } = useChat();
    const [inputMessage, setInputMessage] = useState('');
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Scroll to bottom when messages change
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Mark messages as read when viewing
    useEffect(() => {
        const unreadMessages = messages
            .filter(msg => !msg.isRead && msg.isFromAdmin)
            .map(msg => msg.id);

        if (unreadMessages.length > 0) {
            markAsRead(unreadMessages);
        }
    }, [messages, markAsRead]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (inputMessage.trim() === '' || sending) return;

        setSending(true);
        try {
            await sendMessage(inputMessage);
            setInputMessage('');
        } catch (err) {
            console.error('Error sending message:', err);
            // Error should be displayed by the error state
        } finally {
            setSending(false);
        }
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const today = new Date();

        if (date.toDateString() === today.toDateString()) {
            return 'Astăzi';
        }

        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        if (date.toDateString() === yesterday.toDateString()) {
            return 'Ieri';
        }

        return date.toLocaleDateString('ro-RO');
    };

    // Group messages by date
    const groupedMessages = messages.reduce((groups, message) => {
        const date = formatDate(message.createdAt);
        if (!groups[date]) {
            groups[date] = [];
        }
        groups[date].push(message);
        return groups;
    }, {} as Record<string, typeof messages>);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            <div className="pb-4 shrink-0">
                <h1 className="text-2xl font-bold mb-2">Chat cu Asistență</h1>
                <p className="text-text-primary">Contactați echipa noastră pentru orice întrebare sau asistență</p>
            </div>

            <div className="flex flex-col flex-1 min-h-0 gap-4">
                <div className="dashboard-card flex flex-col flex-1 min-h-0">
                    <div className="p-4 border-b border-border-color flex items-center shrink-0">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <h2 className="text-lg font-semibold">Asistență SEO Doctor</h2>
                            <p className="text-xs text-text-primary">Online acum</p>
                        </div>
                    </div>

                    {/* Messages container */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
                        {Object.entries(groupedMessages).map(([date, dateMessages]) => (
                            <div key={date}>
                                <div className="text-center my-4">
                                    <span className="text-xs text-text-primary bg-dark-blue-lighter px-3 py-1 rounded-full">
                                        {date}
                                    </span>
                                </div>

                                {dateMessages.map((message) => (
                                    <div
                                        key={message.id}
                                        className={`flex mb-4 ${message.isFromAdmin ? 'justify-start' : 'justify-end'}`}
                                    >
                                        <div
                                            className={`max-w-[80%] p-3 rounded-lg ${
                                                message.isFromAdmin
                                                    ? 'bg-dark-blue-lighter rounded-tl-none'
                                                    : 'bg-primary text-white rounded-tr-none'
                                            }`}
                                        >
                                            <p className="whitespace-pre-wrap">{message.content}</p>
                                            <div className={`text-xs mt-1 ${message.isFromAdmin ? 'text-text-primary' : 'text-white/70'}`}>
                                                {formatTime(message.createdAt)}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ))}

                        {messages.length === 0 && (
                            <div className="text-center text-text-primary py-8">
                                <p>Începeți o conversație nouă</p>
                                <p className="text-sm mt-2">Trimiteți un mesaj pentru a primi asistență</p>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Message input */}
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
                </div>

                {error && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm shrink-0">
                        {error}
                    </div>
                )}

                <div className="p-4 bg-dark-blue-lighter rounded-lg shrink-0">
                    <h3 className="text-lg font-semibold mb-2">Alte modalități de contact</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center gap-3">
                            <div className="bg-dark-blue p-3 rounded-lg shrink-0">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm text-text-primary">Email</p>
                                <p className="font-medium">contact@seodoctor.ro</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="bg-dark-blue p-3 rounded-lg shrink-0">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm text-text-primary">Telefon</p>
                                <p className="font-medium">+40 742 702 982</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
