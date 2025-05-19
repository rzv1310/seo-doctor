'use client';

import { useState, useEffect } from 'react';
import { getAuthUser } from '@/utils/auth';
import { Footer } from '@/containers/LandingPage/components';
import ServiceHeader from './components/ServiceHeader';
import { usePathname } from 'next/navigation';

export default function ServiceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // Check if user is authenticated
    const user = getAuthUser();
    setIsAuthenticated(!!user);
  }, []);

  // Scroll to top when pathname changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

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