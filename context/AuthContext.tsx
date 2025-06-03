'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { useLogger } from '@/lib/client-logger';
import { User, AuthContextType, AuthProviderProps } from '@/types/auth';



const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({
    children,
    initialUser = null,
    initialAuth = false
}: AuthProviderProps) {
    const [user, setUserState] = useState<User | null>(initialUser);
    const [isAuthenticated, setIsAuthenticated] = useState(initialAuth);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const logger = useLogger('AuthContext');

    const clearError = () => setError(null);

    const setUser = (newUser: User | null) => {
        setUserState(newUser);
        setIsAuthenticated(!!newUser);
        logger.info('Authentication state changed', {
            userId: newUser?.id,
            isAuthenticated: !!newUser
        });
    };

    const login = async (email: string, password: string) => {
        try {
            setIsLoading(true);
            clearError();
            logger.info('Login attempt', { email });

            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
                credentials: 'include',
            });

            const data = await res.json();

            if (!res.ok || !data.success) {
                const errorMessage = data.error || 'Login failed';
                setError(errorMessage);
                logger.error('Login failed', new Error(errorMessage), { email, status: res.status });
                throw new Error(errorMessage);
            }

            setUser(data.user);
            logger.info('Login successful', { userId: data.user.id, email });
        } catch (err) {
            if (!error) {
                setError(err instanceof Error ? err.message : 'Login failed');
            }
            logger.error('Login error', err, { email });
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const signup = async (email: string, password: string, name: string) => {
        try {
            setIsLoading(true);
            clearError();
            logger.info('Registration attempt', { email, name });

            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, name }),
                credentials: 'include',
            });

            const data = await res.json();

            if (!res.ok || !data.success) {
                const errorMessage = data.error || 'Registration failed';
                setError(errorMessage);
                logger.error('Registration failed', new Error(errorMessage), { email, name, status: res.status });
                throw new Error(errorMessage);
            }

            setUser(data.user);
            logger.info('Registration successful', { userId: data.user.id, email });
        } catch (err) {
            if (!error) {
                setError(err instanceof Error ? err.message : 'Registration failed');
            }
            logger.error('Registration error', err, { email, name });
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const refreshUser = async () => {
        try {
            logger.info('Refreshing user data', { userId: user?.id });

            const res = await fetch('/api/auth/me', {
                method: 'GET',
                credentials: 'include',
            });

            if (!res.ok) {
                if (res.status === 401) {
                    logger.info('User not authenticated, clearing user state');
                    setUser(null);
                    return;
                }
                throw new Error('Failed to refresh user data');
            }

            const data = await res.json();
            
            if (data.success && data.authenticated && data.user) {
                setUser(data.user);
                logger.info('User data refreshed successfully', { userId: data.user.id });
            } else if (data.success && !data.authenticated) {
                logger.info('User not authenticated, clearing user state');
                setUser(null);
            } else {
                logger.warn('No user data in refresh response');
                setUser(null);
            }
        } catch (err) {
            logger.error('Failed to refresh user data', err);
            // Don't clear user on refresh error to avoid unexpected logouts
        }
    };

    const logout = async () => {
        try {
            // Clear user state immediately to prevent any UI from showing authenticated state
            setUser(null);
            clearError();
            logger.info('Logout attempt', { userId: user?.id });

            const res = await fetch('/api/auth/logout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
            });

            const data = await res.json();

            if (!res.ok || !data.success) {
                logger.error('Logout API error', new Error(data.error || 'Logout failed'), { status: res.status });
            }

            logger.info('Logout successful');

            // Use replace to prevent back button issues
            window.location.replace('/');
        } catch (err) {
            logger.error('Logout error', err);
            // Even on error, ensure we're logged out client-side
            setUser(null);
            window.location.replace('/');
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated,
                isLoading,
                error,
                login,
                signup,
                logout,
                clearError,
                setUser,
                refreshUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
