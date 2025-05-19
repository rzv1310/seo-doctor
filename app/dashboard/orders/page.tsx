'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useOrders, Order } from '@/hooks/useOrders';

export default function OrdersPage() {
  // Get orders from our custom hook
  const { orders, loading, error } = useOrders();

  // State for filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortDirection, setSortDirection] = useState('desc');

  // Format price as currency
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Filter orders based on status and search term
  const filteredOrders = orders.filter(order => {
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          order.serviceName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Sort orders
  const sortedOrders = [...filteredOrders].sort((a: Order, b: Order) => {
    if (sortBy === 'date') {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return sortDirection === 'asc' ? dateA.getTime() - dateB.getTime() : dateB.getTime() - dateA.getTime();
    } else if (sortBy === 'amount') {
      return sortDirection === 'asc' ? a.price - b.price : b.price - a.price;
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
        <h1 className="text-2xl font-bold mb-2">Comenzi</h1>
        <p className="text-text-secondary">Vizualizează și gestionează istoricul comenzilor</p>
      </div>

      {/* Filters and search */}
      <div className="dashboard-card mb-6">
        <div className="p-4 border-b border-border-color">
          <h2 className="text-xl font-semibold">Filtre</h2>
        </div>
        <div className="p-4 flex flex-col md:flex-row md:items-end gap-4">
          <div className="md:flex-1">
            <label htmlFor="search-input" className="block text-sm text-text-secondary mb-1">Căutare</label>
            <div className="relative">
              <input
                id="search-input"
                type="text"
                placeholder="Caută comenzi..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-dark-blue-lighter rounded-md py-2 px-3 text-white border border-border-color focus:outline-none focus:border-primary"
              />
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 absolute right-3 top-3 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          <div className="max-w-[300px]">
            <label htmlFor="status-filter" className="block text-sm text-text-secondary mb-1">Status</label>
            <select
              id="status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-dark-blue-lighter rounded-md py-2 px-3 text-white border border-border-color focus:outline-none focus:border-primary"
            >
              <option value="all">Toate</option>
              <option value="completed">Finalizate</option>
              <option value="pending">În așteptare</option>
              <option value="cancelled">Anulate</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="dashboard-card">
        <div className="p-4 border-b border-border-color flex justify-between items-center">
          <h2 className="text-xl font-semibold">Istoric Comenzi</h2>
          <div className="text-text-secondary text-sm">
            {filteredOrders.length} {filteredOrders.length === 1 ? 'comandă' : 'comenzi'} găsite
          </div>
        </div>
        <div className="p-4">
          {loading ? (
            <div className="flex justify-center items-center p-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-danger">
              {error}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border-color">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">ID Comandă</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Serviciu</th>
                    <th
                      className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSortClick('date')}
                    >
                      <div className="flex items-center">
                        Data
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
                        Sumă
                        {sortBy === 'amount' && (
                          <svg xmlns="http://www.w3.org/2000/svg" className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={sortDirection === 'asc' ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
                          </svg>
                        )}
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Acțiuni</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-color">
                  {sortedOrders.map((order) => (
                    <tr key={order.id}>
                      <td className="px-4 py-4 whitespace-nowrap text-sm">{order.id}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm">{order.serviceName}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm">{formatDate(order.createdAt)}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm">{formatPrice(order.price)}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs
                          ${order.status === 'completed' ? 'bg-green-900/30 text-green-300' :
                            order.status === 'pending' ? 'bg-amber-900/30 text-amber-300' :
                            'bg-red-900/30 text-red-300'}`}>
                          {order.status === 'completed' ? 'Finalizată' : 
                           order.status === 'pending' ? 'În așteptare' : 
                           'Anulată'}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm">
                        <Link
                          href={`/dashboard/orders/${order.id}`}
                          className="text-primary hover:text-primary-dark transition-colors"
                        >
                          Vizualizare
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!loading && !error && sortedOrders.length === 0 && (
            <div className="text-center py-8 text-text-secondary">
              Nu s-au găsit comenzi care să corespundă filtrelor tale.
            </div>
          )}
        </div>
      </div>
    </>
  );
}