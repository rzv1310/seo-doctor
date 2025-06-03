'use client';

import { useEffect } from 'react';
import LandingPage from '@/containers/LandingPage';
import { useAuth } from '@/context/AuthContext';



export default function Home() {
    const { isAuthenticated, refreshUser } = useAuth();

    // Check auth status on mount to ensure sync with server
    useEffect(() => {
        refreshUser();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    return <LandingPage isAuthenticated={isAuthenticated} />;
}
