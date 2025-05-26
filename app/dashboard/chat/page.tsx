'use client';

import { useAuth } from '@/context/AuthContext';
import AdminChat from './AdminChat';
import UserChat from './UserChat';



export default function ChatPage() {
    const { user } = useAuth();

    if (user?.admin) {
        return <AdminChat />;
    }

    return <UserChat />;
}
