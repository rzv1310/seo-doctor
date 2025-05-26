'use client';

import React from 'react';


interface ChatMessageProps {
    content: string;
    timestamp: Date;
    isFromSender: boolean;
    senderName?: string;
}

export function ChatMessage({ content, timestamp, isFromSender, senderName }: ChatMessageProps) {
    const formatTime = (date: Date) => {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className={`flex mb-4 ${isFromSender ? 'justify-end' : 'justify-start'}`}>
            <div
                className={`max-w-[80%] p-3 rounded-lg ${
                    isFromSender
                        ? 'bg-primary text-white rounded-tr-none'
                        : 'bg-dark-blue-lighter rounded-tl-none'
                }`}
            >
                <p className="whitespace-pre-wrap">{content}</p>
                <div className={`text-xs mt-1 ${isFromSender ? 'text-white/70' : 'text-text-primary'}`}>
                    {formatTime(timestamp)}
                </div>
            </div>
        </div>
    );
}