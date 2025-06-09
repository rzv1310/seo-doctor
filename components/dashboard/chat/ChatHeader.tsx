'use client';

import React from 'react';


interface ChatHeaderProps {
    title: string;
    subtitle?: string;
    showDeleteButton?: boolean;
    onDelete?: () => void;
    isAdmin?: boolean;
    onRefresh?: () => void;
    isRefreshing?: boolean;
}

export function ChatHeader({ title, subtitle, showDeleteButton, onDelete, isAdmin, onRefresh, isRefreshing }: ChatHeaderProps) {
    return (
        <div className="p-4 border-b border-border-color flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
                {!isAdmin ? (
                    <>
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <h2 className="text-lg font-semibold">{title}</h2>
                            {subtitle && (
                                <p className="text-xs text-text-primary">{subtitle}</p>
                            )}
                        </div>
                    </>
                ) : (
                    <div>
                        <h2 className="font-semibold">{title}</h2>
                        {subtitle && <p className="text-sm text-text-primary">{subtitle}</p>}
                    </div>
                )}
            </div>
            <div className="flex items-center gap-2">
                {onRefresh && (
                    <button
                        onClick={onRefresh}
                        disabled={isRefreshing}
                        className="text-text-primary hover:text-white transition-colors cursor-pointer disabled:opacity-50"
                        title="Reîmprospătează mesajele"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                    </button>
                )}
                {showDeleteButton && onDelete && (
                    <button
                        onClick={onDelete}
                        className="text-red-500 hover:text-red-600 transition-colors cursor-pointer"
                        title="Șterge conversația"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                )}
            </div>
        </div>
    );
}
