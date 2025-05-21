'use client';

import { useState, useEffect } from 'react';
import { Header, Footer } from '@/components/layout';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function ServiceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated } = useAuth();
  const pathname = usePathname();

  // Scroll to top when pathname changes
  // This ensures it only runs on the client side
  const isClient = typeof window !== 'undefined';
  useEffect(() => {
    if (isClient) {
      window.scrollTo(0, 0);
    }
  }, [pathname, isClient]);

  return (
    <div className="min-h-screen bg-dark-blue flex flex-col">
      <Header isSimplified={true} isAuthenticated={isAuthenticated} />
      <main className="flex-1 container mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {children}
      </main>
      <Footer />
    </div>
  );
}