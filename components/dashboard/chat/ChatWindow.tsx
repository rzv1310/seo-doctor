'use client';

import React, { useEffect, useRef, useState } from 'react';
import { format, isSameDay, parseISO } from 'date-fns';
import { ro } from 'date-fns/locale';
import { ChatMessage } from './ChatMessage';
import { ActionButton, Spinner } from '@/components/ui';


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

interface ChatWindowProps {
    messages: Message[];
    isLoading: boolean;
    error: string | null;
    onSendMessage: (content: string) => Promise<void>;
    isAdmin?: boolean;
    recipientName?: string;
    showDateHeaders?: boolean;
}

export function ChatWindow({
    messages,
    isLoading,
    error,
    onSendMessage,
    isAdmin = false,
    recipientName,
    showDateHeaders = true,
}: ChatWindowProps) {
    const [messageInput, setMessageInput] = useState('');
    const [isSending, setIsSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!messageInput.trim() || isSending) return;

        setIsSending(true);
        try {
            await onSendMessage(messageInput.trim());
            setMessageInput('');
        } catch (error) {
            console.error('Failed to send message:', error);
        } finally {
            setIsSending(false);
        }
    };

    const formatDate = (date: Date) => {
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

    const renderDateHeader = (date: Date) => (
        <div className="text-center my-4">
            <span className="text-xs text-text-primary bg-dark-blue-lighter px-3 py-1 rounded-full">
                {formatDate(date)}
            </span>
        </div>
    );

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Spinner />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-500 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-red-600">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto p-4">
                {messages.length === 0 ? (
                    <div className="text-center text-gray-500 mt-8">
                        Nicio conversație încă. Trimiteți un mesaj pentru a începe.
                    </div>
                ) : (
                    <>
                        {messages.map((message, index) => {
                            const messageDate = parseISO(message.createdAt);
                            const showDate = showDateHeaders && (
                                index === 0 ||
                                !isSameDay(messageDate, parseISO(messages[index - 1].createdAt))
                            );

                            return (
                                <React.Fragment key={message.id}>
                                    {showDate && renderDateHeader(messageDate)}
                                    <ChatMessage
                                        content={message.content}
                                        timestamp={messageDate}
                                        isFromSender={isAdmin ? message.isFromAdmin : !message.isFromAdmin}
                                        senderName={
                                            isAdmin && !message.isFromAdmin
                                                ? recipientName
                                                : !isAdmin && message.isFromAdmin
                                                ? 'Asistență SEO Doctor'
                                                : undefined
                                        }
                                    />
                                </React.Fragment>
                            );
                        })}
                        <div ref={messagesEndRef} />
                    </>
                )}
            </div>

            <form onSubmit={handleSubmit} className="p-4 border-t border-border-color flex gap-2 shrink-0">
                <input
                    type="text"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    placeholder="Scrieți un mesaj..."
                    className="flex-1 bg-dark-blue-lighter border border-border-color rounded-md px-4 py-2 focus:outline-none focus:border-primary"
                    disabled={isSending}
                />
                    <ActionButton
                        type="submit"
                        size="sm"
                        disabled={messageInput.trim() === '' || isSending}
                        showArrow={false}
                        fullRounded={false}
                    >
                        {isSending ? (
                            <div
                                className="min-w-[75px] grid place-content-center"
                            >
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            </div>
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
    );
}