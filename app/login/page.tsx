'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import LoginPage from '@/containers/LoginPage';
import { useLogger } from '@/lib/client-logger';



export default function LoginRoute() {
    const logger = useLogger('LoginRoute');
    const router = useRouter();
    
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const response = await fetch('/api/auth/me', {
                    credentials: 'include'
                });
                const data = await response.json();
                
                if (data.authenticated && data.user) {
                    router.push('/dashboard');
                } else if (!data.authenticated) {
                    await fetch('/api/auth/logout', {
                        method: 'POST',
                        credentials: 'include'
                    });
                }
            } catch (error) {
                logger.error('Auth check error', error);
            }
        };
        
        checkAuth();
    }, [router]); // eslint-disable-line react-hooks/exhaustive-deps
    
    return <LoginPage />;
}
