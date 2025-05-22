'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { User } from '@/lib/auth';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
  initialUser?: User | null;
  initialAuth?: boolean;
}

export function AuthProvider({ 
  children, 
  initialUser = null, 
  initialAuth = false 
}: AuthProviderProps) {
  const [user, setUserState] = useState<User | null>(initialUser);
  const [isAuthenticated, setIsAuthenticated] = useState(initialAuth);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = () => setError(null);

  const setUser = (newUser: User | null) => {
    setUserState(newUser);
    setIsAuthenticated(!!newUser);
  };

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      clearError();

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
        throw new Error(errorMessage);
      }

      setUser(data.user);
    } catch (err) {
      if (!error) {
        setError(err instanceof Error ? err.message : 'Login failed');
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, password: string, name: string) => {
    try {
      setIsLoading(true);
      clearError();

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
        throw new Error(errorMessage);
      }

      setUser(data.user);
    } catch (err) {
      if (!error) {
        setError(err instanceof Error ? err.message : 'Registration failed');
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      clearError();

      const res = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        console.error('Logout API error:', data.error);
      }

      // Always clear local state regardless of API response
      setUser(null);
      
      // Redirect to home page
      window.location.href = '/';
    } catch (err) {
      console.error('Logout error:', err);
      // Clear local state even on error
      setUser(null);
      window.location.href = '/';
    } finally {
      setIsLoading(false);
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