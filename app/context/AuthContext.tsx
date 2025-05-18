'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  billingName?: string;
  billingCompany?: string;
  billingVat?: string;
  billingAddress?: string;
  billingPhone?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Clear any error
  const clearError = () => setError(null);

  // Check auth status on initial load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/me', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include', // Include cookies in the request
        });

        const data = await res.json();

        if (res.ok && data.success === true && data.authenticated) {
          setUser(data.user);
          setIsAuthenticated(true);
        } else {
          // Not authenticated
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (err) {
        // Error checking auth status
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Login with email and password
  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      clearError();

      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include', // Include cookies in the request
      });

      const data = await res.json();

      if (!res.ok || data.success === false) {
        const errorMessage = data.error || 'Login failed';
        setError(errorMessage);
        throw new Error(errorMessage);
      }

      setUser(data.user);
      setIsAuthenticated(true);
    } catch (err) {
      // If the error was already set (by the condition above), we don't need to set it again
      if (!error) {
        setError(err instanceof Error ? err.message : 'Login failed');
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Register new user
  const signup = async (email: string, password: string, name: string) => {
    try {
      setIsLoading(true);
      clearError();

      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name }),
        credentials: 'include', // Include cookies in the request
      });

      const data = await res.json();

      if (!res.ok || data.success === false) {
        const errorMessage = data.error || 'Registration failed';
        setError(errorMessage);
        throw new Error(errorMessage);
      }

      setUser(data.user);
      setIsAuthenticated(true);
    } catch (err) {
      // If the error was already set (by the condition above), we don't need to set it again
      if (!error) {
        setError(err instanceof Error ? err.message : 'Registration failed');
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout
  const logout = async () => {
    try {
      setIsLoading(true);
      clearError();

      const res = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies in the request
      });

      const data = await res.json();

      if (!res.ok || data.success === false) {
        throw new Error(data.error || 'Logout failed');
      }

      setUser(null);
      setIsAuthenticated(false);

      // Redirect to home page
      window.location.href = '/';
    } catch (err) {
      console.error('Logout error:', err);
      // Even if there's an error, we still want to clear the local state
      setUser(null);
      setIsAuthenticated(false);

      // Redirect to home page even on error
      window.location.href = '/';
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state while checking authentication on initial load
  if (isLoading && !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-dark-blue">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

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