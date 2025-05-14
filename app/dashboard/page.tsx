'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

// Copy the dashboard content from the original page.tsx
export default function Dashboard() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  // Mock data for services
  const services = [
    {
      id: 1,
      name: "Premium Hosting",
      price: "$12.99",
      status: "active",
      renewalDate: "June 15, 2025",
      usage: 73,
    },
    {
      id: 2,
      name: "AI Assistant",
      price: "$29.99",
      status: "active",
      renewalDate: "July 2, 2025",
      usage: 45,
    },
    {
      id: 3,
      name: "Data Analytics",
      price: "$39.99",
      status: "trial",
      renewalDate: "May 22, 2025",
      usage: 12,
    },
  ];

  // Mock recommended services
  const recommendedServices = [
    {
      id: 4,
      name: "Cloud Storage Pro",
      price: "$8.99",
      description: "Expand your storage to 2TB with our premium plan.",
      discount: "20% off first 3 months",
    },
    {
      id: 5,
      name: "Security Suite",
      price: "$14.99",
      description: "Complete protection for all your digital assets.",
      discount: "Free 14-day trial",
    },
  ];

  // Mock usage statistics
  const usageStats = [
    { name: "API Calls", current: 12453, limit: 15000, percentage: 83 },
    { name: "Storage", current: 156, limit: 250, percentage: 62, unit: "GB" },
    { name: "Bandwidth", current: 873, limit: 1000, percentage: 87, unit: "GB" },
  ];

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
          <div className="sidebar-item active px-4 py-3 flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            Dashboard
          </div>
          <div className="sidebar-item px-4 py-3 flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            Services
          </div>
          <div className="sidebar-item px-4 py-3 flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            Billing
          </div>
          <div className="sidebar-item px-4 py-3 flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Analytics
          </div>
          <div className="sidebar-item px-4 py-3 flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Settings
          </div>
          <div className="sidebar-item px-4 py-3 flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Help
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* Overview Cards */}
            <div className="dashboard-card p-4">
              <h3 className="text-lg font-semibold mb-2">Active Services</h3>
              <div className="flex items-end justify-between">
                <div className="text-3xl font-bold text-primary">3</div>
                <span className="text-accent text-sm flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                  </svg>
                  10%
                </span>
              </div>
            </div>
            <div className="dashboard-card p-4">
              <h3 className="text-lg font-semibold mb-2">Monthly Spending</h3>
              <div className="flex items-end justify-between">
                <div className="text-3xl font-bold text-primary">$82.97</div>
                <span className="text-danger text-sm flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                  5%
                </span>
              </div>
            </div>
            <div className="dashboard-card p-4">
              <h3 className="text-lg font-semibold mb-2">Usage</h3>
              <div className="flex items-end justify-between">
                <div className="text-3xl font-bold text-primary">76%</div>
                <span className="text-accent text-sm flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                  </svg>
                  12%
                </span>
              </div>
            </div>
          </div>

          {/* Services Section */}
          <div className="dashboard-card mb-6">
            <div className="p-4 border-b border-border-color flex justify-between items-center">
              <h2 className="text-xl font-semibold">Your Services</h2>
              <button className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-md text-sm transition-colors">
                Add New Service
              </button>
            </div>
            <div className="p-4">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-border-color">
                  <thead>
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Service</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Price</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Renewal</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Usage</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-color">
                    {services.map((service) => (
                      <tr key={service.id}>
                        <td className="px-4 py-4 whitespace-nowrap text-sm">{service.name}</td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm">{service.price}/mo</td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs ${service.status === 'active' ? 'bg-green-900/30 text-green-300' : 'bg-amber-900/30 text-amber-300'}`}>
                            {service.status === 'active' ? 'Active' : 'Trial'}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm">{service.renewalDate}</td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm">
                          <div className="w-full bg-dark-blue rounded-full h-2 mb-1">
                            <div 
                              className={`h-2 rounded-full ${service.usage > 80 ? 'bg-danger' : 'bg-accent'}`} 
                              style={{ width: `${service.usage}%` }}>
                            </div>
                          </div>
                          <div className="text-xs text-text-secondary">{service.usage}%</div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm">
                          <button className="text-primary hover:text-primary-dark transition-colors">
                            Manage
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Usage Stats */}
            <div className="dashboard-card">
              <div className="p-4 border-b border-border-color">
                <h2 className="text-xl font-semibold">Resource Usage</h2>
              </div>
              <div className="p-4 space-y-4">
                {usageStats.map((stat, index) => (
                  <div key={index}>
                    <div className="flex justify-between mb-1">
                      <span>{stat.name}</span>
                      <span className="text-text-secondary">
                        {stat.current} / {stat.limit} {stat.unit || ''}
                      </span>
                    </div>
                    <div className="w-full bg-dark-blue rounded-full h-2 mb-1">
                      <div 
                        className={`h-2 rounded-full ${stat.percentage > 80 ? 'bg-danger' : 'bg-accent'}`}
                        style={{ width: `${stat.percentage}%` }}>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommended Services */}
            <div className="dashboard-card">
              <div className="p-4 border-b border-border-color">
                <h2 className="text-xl font-semibold">Recommended for You</h2>
              </div>
              <div className="p-4">
                {recommendedServices.map((service) => (
                  <div key={service.id} className="mb-4 p-3 rounded-lg border border-border-color hover:border-primary transition-colors">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{service.name}</h3>
                        <p className="text-text-secondary text-sm mt-1">{service.description}</p>
                        <span className="inline-block mt-2 text-xs bg-primary/20 text-primary px-2 py-1 rounded">
                          {service.discount}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-lg">{service.price}/mo</div>
                        <button className="mt-2 text-sm text-primary hover:text-primary-dark transition-colors">
                          Learn More
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}