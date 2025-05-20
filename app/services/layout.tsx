'use client';

import { useState, useEffect } from 'react';
import { getAuthUser } from '@/utils/client-auth';
import { Footer } from '@/containers/LandingPage/components';
import ServiceHeader from './components/ServiceHeader';
import { usePathname } from 'next/navigation';

export default function ServiceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    try {
      // Check if user is authenticated
      const user = getAuthUser();
      setIsAuthenticated(!!user);
    } catch (error) {
      console.error('Error checking auth:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Scroll to top when pathname changes
  // This ensures it only runs on the client side
  const isClient = typeof window !== 'undefined';
  useEffect(() => {
    if (isClient) {
      window.scrollTo(0, 0);
    }
  }, [pathname, isClient]);

  // Show content immediately for services pages without waiting for auth check
  return (
    <div className="min-h-screen bg-dark-blue flex flex-col">
      <ServiceHeader isAuthenticated={isAuthenticated} />
      <main className="flex-1 container mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {children}
      </main>
      <Footer />
    </div>
  );
}