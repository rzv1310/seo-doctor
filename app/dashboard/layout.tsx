'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import Cart from '../../components/Cart';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter();
  const { isAuthenticated, user, logout, isLoading } = useAuth();
  const { itemCount } = useCart();
  const [activeItem, setActiveItem] = useState('dashboard');
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);

  // Handle navigation and set active item
  const handleNavigation = (item: string) => {
    setActiveItem(item);
    // Close sidebar on mobile when navigating
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isAuthenticated && !isLoading) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  // Get the current path to highlight the active sidebar item
  useEffect(() => {
    const updateActiveItem = () => {
      const path = window.location.pathname;
      if (path === '/dashboard') setActiveItem('dashboard');
      else if (path.includes('/dashboard/orders')) setActiveItem('orders');
      else if (path.includes('/dashboard/services')) setActiveItem('services');
      else if (path.includes('/dashboard/invoices')) setActiveItem('invoices');
      else if (path.includes('/dashboard/payment-methods')) setActiveItem('payment-methods');
      else if (path.includes('/dashboard/settings')) setActiveItem('settings');
    };

    // Set initial active item
    updateActiveItem();

    // Listen for route changes
    window.addEventListener('popstate', updateActiveItem);

    return () => {
      window.removeEventListener('popstate', updateActiveItem);
    };
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

  // Toggle cart visibility
  const toggleCart = () => {
    setCartOpen(!cartOpen);
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

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex h-screen bg-dark-blue text-text-primary overflow-hidden">
      {/* Cart Component */}
      <Cart isOpen={cartOpen} onClose={() => setCartOpen(false)} />

      {/* Mobile sidebar backdrop overlay */}
      <div
        className={`md:hidden fixed inset-0 bg-black bg-opacity-70 z-25 transition-opacity duration-300 ${sidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={toggleSidebar}
      />

      {/* Enhanced Sidebar with glass effect */}
      <aside className={`sidebar flex-shrink-0 h-full transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        <div className="p-6 flex items-center border-b border-border-color h-20 relative overflow-hidden">
          <Link
            href="/"
            className="flex items-center gap-3 font-bold text-lg w-full justify-center md:justify-start z-10 relative"
          >
            <div className="bg-primary w-10 h-10 md:w-8 md:h-8 rounded-full flex items-center justify-center pulse-animation">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-4 md:w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="bg-clip-text bg-gradient-to-r from-primary to-accent text-xl md:text-lg">SEO Doctor</span>
          </Link>
        </div>

        <nav className="py-4 px-2">
          <Link
            href="/dashboard"
            onClick={() => handleNavigation('dashboard')}
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
            onClick={() => handleNavigation('orders')}
            className={`sidebar-item ${activeItem === 'orders' ? 'active' : ''} px-4 py-3 flex items-center gap-3`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            Comenzi
          </Link>
          <Link
            href="/dashboard/services"
            onClick={() => handleNavigation('services')}
            className={`sidebar-item ${activeItem === 'services' ? 'active' : ''} px-4 py-3 flex items-center gap-3`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            Servicii
          </Link>
          <Link
            href="/dashboard/invoices"
            onClick={() => handleNavigation('invoices')}
            className={`sidebar-item ${activeItem === 'invoices' ? 'active' : ''} px-4 py-3 flex items-center gap-3`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Facturi
          </Link>
          <Link
            href="/dashboard/payment-methods"
            onClick={() => handleNavigation('payment-methods')}
            className={`sidebar-item ${activeItem === 'payment-methods' ? 'active' : ''} px-4 py-3 flex items-center gap-3`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            Plată
          </Link>

          <div className="mt-8 border-t border-border-color pt-4">
            <Link
              href="/dashboard/settings"
              onClick={() => handleNavigation('settings')}
              className={`sidebar-item ${activeItem === 'settings' ? 'active' : ''} px-4 py-3 flex items-center gap-3`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Setări
            </Link>

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
              Deconectare
            </button>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Enhanced Glassy Header */}
        <header className="dashboard-header h-16 sm:h-20 flex items-center justify-between px-4 md:px-8 relative overflow-hidden z-10">
          {/* Background decorative elements */}
          <div className="absolute inset-0 bg-gradient-to-r from-dark-blue via-dark-blue-lighter to-dark-blue opacity-50 z-0"></div>
          <div className="absolute top-0 right-0 w-96 h-20 bg-primary opacity-5 blur-3xl rounded-full"></div>
          <div className="absolute bottom-0 left-0 w-72 h-10 bg-accent opacity-10 blur-2xl rounded-full"></div>

          {/* Sidebar Toggle Button for Mobile */}
          <button
            className="md:hidden flex items-center justify-center p-2 rounded-md text-text-primary hover:text-primary hover:bg-dark-blue-lighter/40 transition-colors relative z-50"
            onClick={toggleSidebar}
            aria-label="Toggle sidebar menu"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Title shown in center on mobile */}
          <div className="md:hidden text-center flex-1 font-medium text-lg">
            {activeItem === 'dashboard' && 'Panou Control'}
            {activeItem === 'orders' && 'Comenzi'}
            {activeItem === 'services' && 'Servicii'}
            {activeItem === 'invoices' && 'Facturi'}
            {activeItem === 'payment-methods' && 'Plată'}
            {activeItem === 'settings' && 'Setări'}
          </div>

          <div className="md:block hidden" />

          {/* Cart and User Avatar */}
          <div className="relative z-10 flex items-center gap-4">
            {/* Cart Button */}
            <button
              onClick={toggleCart}
              className="relative flex items-center justify-center w-10 h-10 rounded-full bg-dark-blue-lighter/40 hover:bg-dark-blue-lighter/60 transition-colors"
              aria-label="Cart"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              
              {/* Cart Item Count Badge */}
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </button>

            {/* User Avatar */}
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30 text-primary font-semibold">
              {getUserInitials()}
            </div>
          </div>
        </header>

        {/* Dashboard Content with subtle background */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-5 md:p-6 relative">
          {/* Subtle grid pattern background */}
          <div className="absolute inset-0 opacity-5 z-0"
            style={{
              backgroundImage: 'radial-gradient(var(--primary) 1px, transparent 1px)',
              backgroundSize: '30px 30px'
            }}>
          </div>

          {/* Subtle glow effects */}
          <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-primary opacity-3 blur-3xl rounded-full -z-10"></div>
          <div className="absolute bottom-0 left-0 w-1/4 h-1/4 bg-accent opacity-3 blur-2xl rounded-full -z-10"></div>

          {/* Content */}
          <div className="relative z-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}