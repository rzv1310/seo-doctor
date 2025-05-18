'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LoginPage from '../components/LoginPage';
import { useAuth } from '../context/AuthContext';

export default function LoginRoute() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    // If already authenticated, redirect to dashboard
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  // If loading, show a spinner
  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-dark-blue">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  // If authenticated, don't render anything (we'll redirect in the useEffect)
  if (isAuthenticated) {
    return null;
  }

  return <LoginPage />;
}