'use client';

import React, { useEffect, useRef, useState } from 'react';
import { format, isSameDay, parseISO } from 'date-fns';
import { ro } from 'date-fns/locale';
import { Send, AlertCircle } from 'lucide-react';
import { ChatMessage } from './ChatMessage';
import { Spinner } from '@/components/ui';
import type { Message } from '@/database/schema';


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

    const renderDateHeader = (date: Date) => (
        <div className="text-center my-4">
            <span className="bg-gray-100 text-gray-600 text-sm px-3 py-1 rounded-full">
                {format(date, 'dd MMMM yyyy', { locale: ro })}
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
                    <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-2" />
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

            <form onSubmit={handleSubmit} className="p-4 border-t">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        placeholder="Scrieți un mesaj..."
                        className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={isSending}
                    />
                    <button
                        type="submit"
                        disabled={!messageInput.trim() || isSending}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {isSending ? (
                            <Spinner className="h-5 w-5" />
                        ) : (
                            <Send className="h-5 w-5" />
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}