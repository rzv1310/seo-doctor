'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function OrdersPage() {
  // Simulated orders data
  const allOrders = [
    {
      id: "ORD-123456",
      service: "Premium Hosting",
      date: "May 12, 2025",
      amount: "$12.99",
      status: "completed",
    },
    {
      id: "ORD-123455",
      service: "AI Assistant Pro",
      date: "May 10, 2025",
      amount: "$29.99",
      status: "completed",
    },
    {
      id: "ORD-123454",
      service: "Data Analytics",
      date: "May 5, 2025",
      amount: "$39.99",
      status: "pending",
    },
    {
      id: "ORD-123453",
      service: "Cloud Storage",
      date: "Apr 28, 2025",
      amount: "$8.99",
      status: "completed",
    },
    {
      id: "ORD-123452",
      service: "Security Suite",
      date: "Apr 15, 2025",
      amount: "$14.99",
      status: "cancelled",
    },
    {
      id: "ORD-123451",
      service: "Premium Hosting",
      date: "Apr 10, 2025",
      amount: "$12.99",
      status: "completed",
    },
    {
      id: "ORD-123450",
      service: "Email Marketing",
      date: "Apr 5, 2025",
      amount: "$19.99",
      status: "completed",
    },
    {
      id: "ORD-123449",
      service: "AI Assistant Pro",
      date: "Mar 25, 2025",
      amount: "$29.99",
      status: "completed",
    },
    {
      id: "ORD-123448",
      service: "Data Analytics",
      date: "Mar 20, 2025",
      amount: "$39.99",
      status: "completed",
    },
    {
      id: "ORD-123447",
      service: "Premium Hosting",
      date: "Mar 12, 2025",
      amount: "$12.99",
      status: "completed",
    }
  ];

  // State for filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortDirection, setSortDirection] = useState('desc');

  // Filter orders based on status and search term
  const filteredOrders = allOrders.filter(order => {
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          order.service.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Sort orders
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    if (sortBy === 'date') {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return sortDirection === 'asc' ? dateA.getTime() - dateB.getTime() : dateB.getTime() - dateA.getTime();
    } else if (sortBy === 'amount') {
      const amountA = parseFloat(a.amount.replace('$', ''));
      const amountB = parseFloat(b.amount.replace('$', ''));
      return sortDirection === 'asc' ? amountA - amountB : amountB - amountA;
    }
    return 0;
  });

  // Handle sort click
  const handleSortClick = (field: string) => {
    if (sortBy === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDirection('desc');
    }
  };

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Orders</h1>
        <p className="text-text-secondary">View and manage your order history</p>
      </div>

      {/* Filters and search */}
      <div className="dashboard-card mb-6">
        <div className="p-4 border-b border-border-color">
          <h2 className="text-xl font-semibold">Filters</h2>
        </div>
        <div className="p-4 flex flex-col md:flex-row md:items-center gap-4">
          <div className="relative md:w-1/3">
            <input
              type="text"
              placeholder="Search orders..."
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
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="dashboard-card">
        <div className="p-4 border-b border-border-color flex justify-between items-center">
          <h2 className="text-xl font-semibold">Order History</h2>
          <div className="text-text-secondary text-sm">
            {filteredOrders.length} {filteredOrders.length === 1 ? 'order' : 'orders'} found
          </div>
        </div>
        <div className="p-4">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border-color">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Order ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Service</th>
                  <th
                    className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSortClick('date')}
                  >
                    <div className="flex items-center">
                      Date
                      {sortBy === 'date' && (
                        <svg xmlns="http://www.w3.org/2000/svg" className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={sortDirection === 'asc' ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
                        </svg>
                      )}
                    </div>
                  </th>
                  <th
                    className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSortClick('amount')}
                  >
                    <div className="flex items-center">
                      Amount
                      {sortBy === 'amount' && (
                        <svg xmlns="http://www.w3.org/2000/svg" className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={sortDirection === 'asc' ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
                        </svg>
                      )}
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-color">
                {sortedOrders.map((order) => (
                  <tr key={order.id}>
                    <td className="px-4 py-4 whitespace-nowrap text-sm">{order.id}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm">{order.service}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm">{order.date}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm">{order.amount}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs 
                        ${order.status === 'completed' ? 'bg-green-900/30 text-green-300' : 
                          order.status === 'pending' ? 'bg-amber-900/30 text-amber-300' : 
                          'bg-red-900/30 text-red-300'}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm">
                      <Link 
                        href={`/dashboard/orders/${order.id}`} 
                        className="text-primary hover:text-primary-dark transition-colors"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {sortedOrders.length === 0 && (
            <div className="text-center py-8 text-text-secondary">
              No orders found matching your filters.
            </div>
          )}
        </div>
      </div>
    </>
  );
}