'use client';

import { sidebarItems, logoutButton } from './data';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { DashboardProvider } from '@/context/DashboardContext';
import Link from 'next/link';
import { LinkButton, SidebarButton } from '@/components/ui';

interface DashboardContentProps {
    children: React.ReactNode;
}

export default function DashboardContent({ children }: DashboardContentProps) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const pathname = usePathname();
    const { user } = useAuth();
    const { itemCount } = useCart();

    useEffect(() => {
        setIsSidebarOpen(false);
    }, [pathname]);

    // Fetch unread message count with real-time updates
    useEffect(() => {
        let debounceTimer: NodeJS.Timeout;
        
        const fetchUnreadCount = async () => {
            try {
                const response = await fetch('/api/messages/unread-count');
                if (response.ok) {
                    const data = await response.json();
                    setUnreadCount(data.unreadCount);
                }
            } catch (error) {
                console.error('Error fetching unread count:', error);
            }
        };

        // Debounced fetch to prevent rapid updates
        const debouncedFetch = () => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(fetchUnreadCount, 100);
        };

        // Initial fetch
        fetchUnreadCount();

        // Set up SSE for real-time updates
        const eventSource = new EventSource('/api/messages/sse');
        
        eventSource.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === 'new_message' || data.type === 'message_read') {
                // Refresh count on any message event with debounce
                debouncedFetch();
            }
        };

        eventSource.onerror = (error) => {
            console.error('SSE error in DashboardContent:', error);
            eventSource.close();
        };

        // Also keep a slower interval as backup
        const interval = setInterval(fetchUnreadCount, 60000); // 1 minute

        return () => {
            clearTimeout(debounceTimer);
            eventSource.close();
            clearInterval(interval);
        };
    }, []);

    // Filter sidebar items based on user role
    const filteredSidebarItems = sidebarItems.filter(item => {
        // Only show admin-only items to admin users
        if (item.adminOnly) {
            return user?.admin;
        }
        return true;
    });

    return (
        <DashboardProvider>
            <div className="flex h-screen bg-dark-blue relative">
                {/* Mobile menu button */}
                <div className="md:hidden fixed top-4 left-4 z-50">
                    <LinkButton
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        variant="default"
                        size="lg"
                    >
                        <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d={isSidebarOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
                            />
                        </svg>
                    </LinkButton>
                </div>

                {/* Sidebar */}
                <aside className={`sidebar ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} transition-transform duration-300 ease-in-out`}>
                    <div className="flex items-center justify-between px-4 py-5 border-b border-glass-border">
                        <div className="flex items-center">
                            <Link href="/" className="text-xl font-bold text-text-primary">
                                SEO Doctor
                            </Link>
                        </div>
                    </div>
                    <nav className="mt-5 px-2">
                        {filteredSidebarItems.map((item) => (
                            <SidebarButton
                                key={item.id}
                                href={item.href}
                                icon={item.icon}
                                label={item.label}
                                divider={item.divider}
                                badge={item.href === '/dashboard/chat' ? unreadCount : undefined}
                            />
                        ))}
                        <SidebarButton
                            href="/"
                            icon={logoutButton.icon}
                            label={logoutButton.label}
                            divider={true}
                            onClick={async () => {
                                await fetch('/api/auth/logout', { method: 'POST' });
                            }}
                        />
                    </nav>
                </aside>

                {/* Main content */}
                <main className="flex-1 overflow-hidden flex flex-col">
                    {/* Mobile header space */}
                    <div className="md:hidden h-16 bg-dark-blue sticky top-0 z-20 flex items-center justify-center shrink-0">
                        <h1 className="text-lg font-semibold text-text-primary">SEO Doctor</h1>
                    </div>

                    {/* Cart icon in top right */}
                    <div className="fixed top-4 right-4 z-40">
                        <Link
                            href="/dashboard/checkout"
                            className="relative inline-flex items-center justify-center w-12 h-12 rounded-full bg-glass-bg backdrop-blur-sm border border-glass-border hover:bg-sky-400/10 transition-colors"
                        >
                            <svg
                                className="w-6 h-6 text-text-primary"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                                />
                            </svg>
                            {itemCount > 0 && (
                                <span className="absolute -top-1 -right-1 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-sky-400 rounded-full">
                                    {itemCount}
                                </span>
                            )}
                        </Link>
                    </div>

                    <div className="p-4 md:p-8 flex-1 overflow-hidden flex flex-col">
                        {children}
                    </div>
                </main>

                {/* Mobile sidebar overlay */}
                {isSidebarOpen && (
                    <div
                        className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
                        onClick={() => setIsSidebarOpen(false)}
                    />
                )}
            </div>
        </DashboardProvider>
    );
}