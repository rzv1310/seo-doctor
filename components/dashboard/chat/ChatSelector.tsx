'use client';

import React, { useState } from 'react';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { ro } from 'date-fns/locale';
import type { User } from '@/lib/auth';


interface ChatUser extends User {
    lastMessage?: {
        content: string;
        createdAt: string;
        isFromAdmin: boolean;
    };
    unreadCount: number;
}

interface ChatSelectorProps {
    users: ChatUser[];
    selectedUserId: string | null;
    onSelectUser: (userId: string) => void;
}

export function ChatSelector({ users, selectedUserId, onSelectUser }: ChatSelectorProps) {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredUsers = users.filter(
        (user) =>
            user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="dashboard-card flex flex-col h-full">
            <div className="p-4 border-b border-border-color flex items-center justify-between">
                <h2 className="font-semibold">Conversații</h2>
            </div>
            <div className="flex-grow overflow-y-auto">
                {filteredUsers.length === 0 ? (
                    <div className="p-4 text-center text-text-primary">
                        <p>Nu există conversații</p>
                    </div>
                ) : (
                    filteredUsers.map((user) => (
                        <div
                            key={user.id}
                            className={`w-full border-b border-border-color transition-all duration-200 relative group ${
                                selectedUserId === user.id
                                    ? 'bg-dark-blue-lighter border-l-4 border-l-primary'
                                    : 'hover:bg-dark-blue-lighter/50'
                            }`}
                        >
                            <button
                                onClick={() => onSelectUser(user.id)}
                                className="w-full p-4 text-left cursor-pointer"
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <h3 className={`font-medium truncate pr-2 ${
                                        selectedUserId === user.id ? 'text-text-primary' : 'group-hover:text-primary'
                                    }`}>
                                        {user.name}
                                    </h3>
                                    <div className="flex items-center gap-2">
                                        {user.unreadCount > 0 && (
                                            <span className="bg-primary text-white text-xs px-2 py-1 rounded-full animate-pulse">
                                                {user.unreadCount}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <p className="text-sm text-text-primary truncate">{user.email}</p>
                                {user.lastMessage && (
                                    <p className="text-sm text-text-primary mt-2 truncate italic">"{user.lastMessage.content}"</p>
                                )}
                                {user.lastMessage && user.lastMessage.createdAt && (
                                    <p className="text-xs text-text-primary/70 mt-1">
                                        {formatDistanceToNow(
                                            parseISO(user.lastMessage.createdAt),
                                            {
                                                addSuffix: true,
                                                locale: ro,
                                            }
                                        )}
                                    </p>
                                )}
                            </button>
                            <div className={`absolute right-4 top-1/2 -translate-y-1/2 transition-opacity ${
                                selectedUserId === user.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
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
    );
}