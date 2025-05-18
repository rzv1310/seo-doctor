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
  const { isAuthenticated, user, logout, isLoading } = useAuth();
  const [activeItem, setActiveItem] = useState('dashboard');
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isAuthenticated && !isLoading) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  // Get the current path to highlight the active sidebar item
  useEffect(() => {
    const path = window.location.pathname;
    if (path === '/dashboard') setActiveItem('dashboard');
    else if (path.includes('/dashboard/orders')) setActiveItem('orders');
    else if (path.includes('/dashboard/services')) setActiveItem('services');
    else if (path.includes('/dashboard/invoices')) setActiveItem('invoices');
    else if (path.includes('/dashboard/payment-methods')) setActiveItem('payment-methods');
  }, []);

  // Handle logout
  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Get user initials for the avatar
  const getUserInitials = () => {
    if (!user?.name) return '?';
    
    const nameParts = user.name.split(' ');
    if (nameParts.length === 1) return nameParts[0].charAt(0).toUpperCase();
    
    return (nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)).toUpperCase();
  };

  // Show loading spinner when authentication state is being checked
  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-dark-blue">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }
  
  // Don't render anything when not authenticated (redirect will happen)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex h-screen bg-dark-blue text-text-primary">
      {/* Sidebar */}
      <div className="sidebar w-64 flex-shrink-0 h-full">
        <div className="p-6 flex items-center border-b border-border-color h-20 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/5 to-transparent opacity-50"></div>
          <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-primary/10 rounded-full blur-xl"></div>
          
          <div className="font-bold text-2xl relative z-10 bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
            MiniDash
            <span className="absolute -inset-1 bg-primary opacity-10 blur-lg rounded-full -z-10"></span>
          </div>
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
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="sidebar-item w-full text-left px-4 py-3 flex items-center gap-3 text-danger disabled:opacity-70"
            >
              {isLoggingOut ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-danger border-t-transparent"></div>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              )}
              Logout
            </button>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="dashboard-header h-20 flex items-center justify-between px-8 relative overflow-hidden backdrop-blur-sm bg-dark-blue bg-opacity-80 z-10">
          {/* Background decorative elements */}
          <div className="absolute inset-0 bg-gradient-to-r from-dark-blue via-dark-blue-lighter to-dark-blue opacity-50 z-0"></div>
          <div className="absolute top-0 right-0 w-96 h-20 bg-primary opacity-5 blur-3xl rounded-full"></div>
          <div className="absolute bottom-0 left-0 w-72 h-10 bg-accent opacity-10 blur-2xl rounded-full"></div>
          
          <div className="flex items-center z-10">
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent relative">
              Dashboard
              <span className="absolute -inset-1 bg-primary opacity-10 blur-lg rounded-full -z-10"></span>
            </h1>
          </div>
          <div className="flex items-center gap-6 z-10">
            {/* Search */}
            <div className="relative group">
              <input
                type="text"
                placeholder="Search..."
                className="bg-dark-blue-lighter h-10 rounded-full py-2 px-5 pr-10 text-sm border border-border-color focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all w-56 shadow-sm group-hover:shadow-md"
              />
              <div className="absolute right-3 top-2.5 text-text-secondary bg-primary/10 p-1 rounded-full group-hover:bg-primary/20 transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            
            {/* Notifications */}
            <div className="relative group">
              <button className="w-10 h-10 rounded-full bg-dark-blue-lighter flex items-center justify-center border border-border-color hover:border-primary/50 transition-all group-hover:shadow-md">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-text-secondary group-hover:text-primary transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span className="absolute -top-1 -right-1 bg-primary w-4 h-4 rounded-full text-xs flex items-center justify-center text-white shadow-lg shadow-primary/30">3</span>
              </button>
            </div>
            
            {/* User Profile */}
            <div className="relative group">
              <div 
                className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center shadow-lg shadow-primary/20 cursor-pointer group-hover:shadow-xl group-hover:shadow-primary/30 transition-all border-2 border-transparent group-hover:border-white/10"
                title={user?.name || 'User'}
              >
                <span className="text-white font-bold">{getUserInitials()}</span>
              </div>
              
              {/* Dropdown menu (can be expanded later) */}
              <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-dark-blue-lighter border border-border-color hidden group-hover:block z-50">
                <div className="py-2">
                  <div className="px-4 py-3 border-b border-border-color">
                    <p className="text-sm font-medium text-white truncate">{user?.name || 'User'}</p>
                    <p className="text-xs text-text-secondary truncate">{user?.email || 'user@example.com'}</p>
                  </div>
                  <a href="#" className="block px-4 py-2 text-sm text-text-primary hover:bg-primary/10 transition-colors">Profile</a>
                  <a href="#" className="block px-4 py-2 text-sm text-text-primary hover:bg-primary/10 transition-colors">Settings</a>
                  <button 
                    onClick={handleLogout} 
                    disabled={isLoggingOut}
                    className="block w-full text-left px-4 py-2 text-sm text-danger hover:bg-danger/10 transition-colors disabled:opacity-70"
                  >
                    {isLoggingOut ? 'Logging out...' : 'Logout'}
                  </button>
                </div>
              </div>
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