'use client';

import { useState } from 'react';
import Link from 'next/link';

type Service = {
  id: number;
  name: string;
  description: string;
  price: string;
  status: string;
  renewalDate: string;
  usage: number;
  features: string[];
};

export default function ServicesPage() {
  // Mock data for services
  const allServices: Service[] = [
    {
      id: 1,
      name: "GBP MAX",
      description: "Google Business Profile optimization service for maximum local visibility",
      price: "$99.99",
      status: "active",
      renewalDate: "May 20, 2025",
      usage: 73,
      features: ["Local SEO Optimization", "Review Management", "Business Info Updates", "Photo Optimization", "Performance Analytics"]
    },
    {
      id: 2,
      name: "Google Organic",
      description: "Comprehensive organic search engine optimization for Google",
      price: "$149.99",
      status: "trial",
      renewalDate: "July 2, 2025",
      usage: 45,
      features: ["Keyword Research", "Content Optimization", "Backlink Analysis", "Technical SEO", "Monthly Reports"]
    }
  ];

  // State for filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Filter services based on status and search term
  const filteredServices = allServices.filter(service => {
    const matchesStatus = statusFilter === 'all' || service.status === statusFilter;
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          service.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Services</h1>
        <p className="text-text-secondary">Manage your subscribed services</p>
      </div>

      {/* Filters and search */}
      <div className="dashboard-card mb-6">
        <div className="p-4 border-b border-border-color">
          <h2 className="text-xl font-semibold">Filters</h2>
        </div>
        <div className="p-4 flex flex-col md:flex-row md:items-center gap-4">
          <div className="relative md:w-1/2">
            <input
              type="text"
              placeholder="Search services..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-dark-blue-lighter rounded-md py-2 px-3 text-white border border-border-color focus:outline-none focus:border-primary"
            />
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 absolute right-3 top-3 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          
          <div className="flex-1">
            <label htmlFor="status-filter" className="block text-sm text-text-secondary mb-1">Status</label>
            <select
              id="status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-dark-blue-lighter rounded-md py-2 px-3 text-white border border-border-color focus:outline-none focus:border-primary"
            >
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="trial">Trial</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          
          <div className="self-end">
            <button className="bg-primary hover:bg-primary-dark text-white px-6 py-2 rounded-md transition-colors text-sm">
              Add New Service
            </button>
          </div>
        </div>
      </div>

      {/* Services Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {filteredServices.map(service => (
          <div key={service.id} className="dashboard-card overflow-hidden flex flex-col">
            <div className="p-4 border-b border-border-color">
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-semibold">{service.name}</h3>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  service.status === 'active' ? 'bg-green-900/30 text-green-300' : 
                  service.status === 'trial' ? 'bg-amber-900/30 text-amber-300' : 
                  'bg-red-900/30 text-red-300'
                }`}>
                  {service.status.charAt(0).toUpperCase() + service.status.slice(1)}
                </span>
              </div>
              <p className="text-text-secondary text-sm mt-2">{service.description}</p>
            </div>
            
            <div className="p-4 flex-1">
              <div className="mb-4">
                <div className="text-sm text-text-secondary mb-1">Usage</div>
                <div className="w-full bg-dark-blue rounded-full h-2 mb-1">
                  <div 
                    className={`h-2 rounded-full ${service.usage > 80 ? 'bg-danger' : 'bg-accent'}`} 
                    style={{ width: `${service.usage}%` }}>
                  </div>
                </div>
                <div className="text-xs text-text-secondary">{service.usage}%</div>
              </div>
              
              <div className="mb-4">
                <div className="text-sm text-text-secondary mb-1">Features</div>
                <ul className="text-sm space-y-1">
                  {service.features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-accent mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="flex justify-between items-center mt-auto pt-4 border-t border-border-color">
                <div>
                  <div className="font-bold text-primary text-lg">{service.price}<span className="text-xs text-text-secondary">/mo</span></div>
                  <div className="text-xs text-text-secondary">Renews: {service.renewalDate}</div>
                </div>
                <Link 
                  href={`/dashboard/services/${service.id}`} 
                  className="bg-primary/20 hover:bg-primary/30 text-primary px-4 py-1 rounded text-sm transition-colors"
                >
                  Manage
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {filteredServices.length === 0 && (
        <div className="dashboard-card p-8 text-center">
          <div className="text-xl font-semibold mb-2">No services found</div>
          <p className="text-text-secondary mb-6">Try adjusting your search or filter criteria.</p>
          <button className="bg-primary hover:bg-primary-dark text-white px-6 py-2 rounded-md transition-colors">
            Browse Available Services
          </button>
        </div>
      )}
      
      {/* Available Services Section */}
      <div className="dashboard-card mb-6">
        <div className="p-4 border-b border-border-color">
          <h2 className="text-xl font-semibold">Recommended Services</h2>
        </div>
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-3 border border-border-color rounded-lg hover:border-primary transition-all duration-300">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium">Social Media Management</h3>
                <p className="text-text-secondary text-sm mt-1">Complete management of your social media profiles for better engagement and visibility.</p>
                <span className="inline-block mt-2 text-xs bg-primary/20 text-primary px-2 py-1 rounded">
                  20% off first 3 months
                </span>
              </div>
              <div className="text-right">
                <div className="font-bold text-lg">$199.99<span className="text-xs text-text-secondary">/mo</span></div>
                <button className="mt-2 text-sm text-primary hover:text-primary-dark transition-colors">
                  Learn More
                </button>
              </div>
            </div>
          </div>
          
          <div className="p-3 border border-border-color rounded-lg hover:border-primary transition-all duration-300">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium">Content Marketing</h3>
                <p className="text-text-secondary text-sm mt-1">Strategic content creation and distribution to drive traffic and conversions.</p>
                <span className="inline-block mt-2 text-xs bg-primary/20 text-primary px-2 py-1 rounded">
                  Free consultation
                </span>
              </div>
              <div className="text-right">
                <div className="font-bold text-lg">$249.99<span className="text-xs text-text-secondary">/mo</span></div>
                <button className="mt-2 text-sm text-primary hover:text-primary-dark transition-colors">
                  Learn More
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}