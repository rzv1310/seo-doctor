'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LoginPage from '@/containers/LoginPage';



export default function LoginRoute() {
    const router = useRouter();
    
    useEffect(() => {
        // Check if there's a stale auth cookie
        const checkAuth = async () => {
            try {
                const response = await fetch('/api/auth/me', {
                    credentials: 'include'
                });
                const data = await response.json();
                
                // If authenticated with a valid user, redirect to dashboard
                if (data.authenticated && data.user) {
                    router.push('/dashboard');
                } else if (!data.authenticated) {
                    // If not authenticated, clear any stale cookies by calling logout
                    await fetch('/api/auth/logout', {
                        method: 'POST',
                        credentials: 'include'
                    });
                }
            } catch (error) {
                console.error('Auth check error:', error);
            }
        };
        
        checkAuth();
    }, [router]);
    
    return <LoginPage />;
}
