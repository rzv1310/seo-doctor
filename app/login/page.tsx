'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LoginPage from '../components/LoginPage';
import { useAuth } from '../context/AuthContext';

export default function LoginRoute() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    // If already authenticated, redirect to dashboard
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  // If authenticated, don't render anything (we'll redirect in the useEffect)
  if (isAuthenticated) {
    return null;
  }

  return <LoginPage />;
}