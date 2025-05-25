'use client';

import { useAuth } from '@/context/AuthContext';
import ChatInterface from './ChatInterface';
import MessagesPage from '../messages/page';

export default function ChatPage() {
    const { user } = useAuth();

    // Show messages interface for admin, chat interface for regular users
    if (user?.admin) {
        return <MessagesPage />;
    }

    return <ChatInterface />;
}
