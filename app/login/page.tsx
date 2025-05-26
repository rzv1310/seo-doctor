'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LoginPage from '@/containers/LoginPage';
import { useAuth } from '@/context/AuthContext';
import { useLogger } from '@/lib/client-logger';



export default function LoginRoute() {
    const router = useRouter();
    const { isAuthenticated, isLoading } = useAuth();
    const logger = useLogger('LoginRoute');

    useEffect(() => {
        if (isAuthenticated) {
            logger.info('Already authenticated, redirecting to dashboard');
            router.push('/dashboard');
        }
    }, [isAuthenticated, router, logger]);

    if (isLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-dark-blue">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
        );
    }

    if (isAuthenticated) {
        return null;
    }

    return <LoginPage />;
}
