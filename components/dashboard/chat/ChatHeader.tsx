'use client';

import React from 'react';
import { MessageCircle, Trash2 } from 'lucide-react';


interface ChatHeaderProps {
    title: string;
    subtitle?: string;
    showDeleteButton?: boolean;
    onDelete?: () => void;
}

export function ChatHeader({ title, subtitle, showDeleteButton, onDelete }: ChatHeaderProps) {
    return (
        <div className="p-4 border-b bg-white">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <MessageCircle className="h-5 w-5 text-blue-600" />
                    <div>
                        <h2 className="font-semibold text-gray-900">{title}</h2>
                        {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
                    </div>
                </div>
                {showDeleteButton && onDelete && (
                    <button
                        onClick={onDelete}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Ștergeți conversația"
                    >
                        <Trash2 className="h-5 w-5" />
                    </button>
                )}
            </div>
        </div>
    );
}