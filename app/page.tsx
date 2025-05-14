'use client';

import { useEffect, useState } from 'react';
import { useAuth } from './context/AuthContext';
import LandingPage from './components/LandingPage';

export default function Home() {
  const { isAuthenticated } = useAuth();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // This ensures authentication check happens on client side
    setIsMounted(true);
  }, []);

  // Before hydration, show nothing to avoid content flash
  if (!isMounted) {
    return null;
  }

  // Always show the landing page, whether authenticated or not
  return <LandingPage isAuthenticated={isAuthenticated} />;
}