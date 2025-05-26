'use client';

import { useAuth } from '@/context/AuthContext';
import ChatInterface from './ChatInterface';
import MessagesPage from '../messages/page';

export default function ChatPage() {
    const { user } = useAuth();

    if (user?.admin) {
        return <MessagesPage />;
    }

    return <ChatInterface />;
}
