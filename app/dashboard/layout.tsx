'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter();
  const { isAuthenticated, logout } = useAuth();
  const [activeItem, setActiveItem] = useState('dashboard');

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  // Get the current path to highlight the active sidebar item
  useEffect(() => {
    const path = window.location.pathname;
    if (path === '/dashboard') setActiveItem('dashboard');
    else if (path.includes('/dashboard/orders')) setActiveItem('orders');
    else if (path.includes('/dashboard/services')) setActiveItem('services');
    else if (path.includes('/dashboard/invoices')) setActiveItem('invoices');
    else if (path.includes('/dashboard/payment-methods')) setActiveItem('payment-methods');
  }, []);

  // If not authenticated, don't render anything (we'll redirect in the useEffect)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex h-screen bg-dark-blue text-text-primary">
      {/* Sidebar */}
      <div className="sidebar w-64 flex-shrink-0 h-full">
        <div className="p-4 flex items-center border-b border-border-color h-16">
          <div className="font-bold text-xl">MiniDash</div>
        </div>

        <nav className="py-4">
          <Link 
            href="/dashboard" 
            className={`sidebar-item ${activeItem === 'dashboard' ? 'active' : ''} px-4 py-3 flex items-center gap-3`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            Panou Control
          </Link>
          <Link 
            href="/dashboard/orders" 
            className={`sidebar-item ${activeItem === 'orders' ? 'active' : ''} px-4 py-3 flex items-center gap-3`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            Comenzi
          </Link>
          <Link 
            href="/dashboard/services" 
            className={`sidebar-item ${activeItem === 'services' ? 'active' : ''} px-4 py-3 flex items-center gap-3`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            Servicii
          </Link>
          <Link 
            href="/dashboard/invoices" 
            className={`sidebar-item ${activeItem === 'invoices' ? 'active' : ''} px-4 py-3 flex items-center gap-3`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Facturi
          </Link>
          <Link 
            href="/dashboard/payment-methods" 
            className={`sidebar-item ${activeItem === 'payment-methods' ? 'active' : ''} px-4 py-3 flex items-center gap-3`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            Payment
          </Link>
          
          <div className="mt-8 border-t border-border-color pt-4">
            <button 
              onClick={() => logout()}
              className="sidebar-item w-full text-left px-4 py-3 flex items-center gap-3 text-danger"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="dashboard-header h-16 flex items-center justify-between px-6">
          <div className="flex items-center">
            <h1 className="text-xl font-semibold">Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                className="bg-dark-blue-lighter rounded-md py-2 px-3 text-sm border border-border-color focus:outline-none focus:border-primary"
              />
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 absolute right-3 top-2.5 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <div className="w-10 h-10 rounded-full bg-primary-dark flex items-center justify-center">
              <span className="text-white font-semibold">JD</span>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}