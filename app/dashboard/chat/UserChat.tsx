'use client';

import React, { useEffect } from 'react';
import { useChat } from '@/hooks/useChat';
import { ChatWindow, ChatHeader } from '@/components/dashboard/chat';
import { PhoneLink } from '@/components/ui';


export default function ChatInterface() {
    const { messages, loading, error, sendMessage, markAsRead } = useChat();

    // Mark messages as read when viewing
    useEffect(() => {
        const unreadMessages = messages
            .filter(msg => !msg.isRead && msg.isFromAdmin)
            .map(msg => msg.id);

        if (unreadMessages.length > 0) {
            markAsRead(unreadMessages);
        }
    }, [messages, markAsRead]);

    return (
        <div className="flex flex-col h-full">
            <div className="pb-4 shrink-0">
                <h1 className="text-2xl font-bold mb-2">Chat cu Asistență</h1>
                <p className="text-text-primary">Contactați echipa noastră pentru orice întrebare sau asistență</p>
            </div>

            <div className="dashboard-card flex flex-col flex-1 overflow-hidden">
                <ChatHeader
                    title="Asistență SEO Doctor"
                    subtitle="Online acum"
                />

                <div className="flex-1 overflow-hidden">
                    <ChatWindow
                        messages={messages}
                        isLoading={loading}
                        error={error === 'Your conversation has been deleted by an administrator' ?
                            'Conversația a fost ștearsă' : error}
                        onSendMessage={sendMessage}
                        isAdmin={false}
                    />
                </div>
            </div>

            {error && error !== 'Your conversation has been deleted by an administrator' && (
                <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                    {error}
                </div>
            )}

            <div className="mt-4 p-4 bg-dark-blue-lighter rounded-lg">
                <h3 className="text-lg font-semibold mb-2">Alte modalități de contact</h3>
                <div className="flex items-center gap-3">
                    <div className="bg-dark-blue p-3 rounded-lg shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                    </div>
                    <div>
                        <p className="text-sm text-text-primary">Telefon</p>
                        <PhoneLink />
                    </div>
                </div>
            </div>
        </div>
    );
}
