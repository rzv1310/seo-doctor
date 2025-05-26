'use client';

import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ro } from 'date-fns/locale';


interface ChatMessageProps {
    content: string;
    timestamp: Date;
    isFromSender: boolean;
    senderName?: string;
}

export function ChatMessage({ content, timestamp, isFromSender, senderName }: ChatMessageProps) {
    return (
        <div className={`mb-4 ${isFromSender ? 'text-right' : 'text-left'}`}>
            {senderName && !isFromSender && (
                <div className="text-xs text-gray-500 mb-1">{senderName}</div>
            )}
            <div
                className={`inline-block p-3 rounded-lg max-w-[70%] ${
                    isFromSender
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                }`}
            >
                <p className="whitespace-pre-wrap break-words">{content}</p>
                <p
                    className={`text-xs mt-1 ${
                        isFromSender ? 'text-blue-100' : 'text-gray-500'
                    }`}
                >
                    {formatDistanceToNow(timestamp, {
                        addSuffix: true,
                        locale: ro,
                    })}
                </p>
            </div>
        </div>
    );
}