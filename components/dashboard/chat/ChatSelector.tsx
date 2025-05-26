'use client';

import React, { useState } from 'react';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { ro } from 'date-fns/locale';
import { Search, MessageCircle } from 'lucide-react';
import type { User } from '@/database/schema';


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
    selectedUserId: number | null;
    onSelectUser: (userId: number) => void;
}

export function ChatSelector({ users, selectedUserId, onSelectUser }: ChatSelectorProps) {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredUsers = users.filter(
        (user) =>
            user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="h-full flex flex-col bg-gray-50">
            <div className="p-4 border-b bg-white">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Căutați utilizatori..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto">
                {filteredUsers.length === 0 ? (
                    <div className="text-center text-gray-500 mt-8 px-4">
                        {searchQuery
                            ? 'Niciun utilizator găsit pentru căutarea dvs.'
                            : 'Niciun utilizator disponibil'}
                    </div>
                ) : (
                    <ul className="divide-y divide-gray-200">
                        {filteredUsers.map((user) => (
                            <li key={user.id}>
                                <button
                                    onClick={() => onSelectUser(user.id)}
                                    className={`w-full p-4 text-left hover:bg-gray-100 transition-colors ${
                                        selectedUserId === user.id
                                            ? 'bg-blue-50 border-l-4 border-blue-600'
                                            : ''
                                    }`}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-medium text-gray-900 truncate">
                                                    {user.name}
                                                </h3>
                                                {user.unreadCount > 0 && (
                                                    <span className="bg-red-500 text-white text-xs font-medium px-2 py-0.5 rounded-full">
                                                        {user.unreadCount}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-500 truncate">
                                                {user.email}
                                            </p>
                                            {user.lastMessage && (
                                                <div className="mt-1">
                                                    <p className="text-sm text-gray-600 truncate">
                                                        {user.lastMessage.isFromAdmin && (
                                                            <span className="text-gray-500">
                                                                Dvs:{' '}
                                                            </span>
                                                        )}
                                                        {user.lastMessage.content}
                                                    </p>
                                                    <p className="text-xs text-gray-400 mt-1">
                                                        {formatDistanceToNow(
                                                            parseISO(user.lastMessage.createdAt),
                                                            {
                                                                addSuffix: true,
                                                                locale: ro,
                                                            }
                                                        )}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                        {!user.lastMessage && (
                                            <MessageCircle className="h-4 w-4 text-gray-400 flex-shrink-0 ml-2" />
                                        )}
                                    </div>
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}