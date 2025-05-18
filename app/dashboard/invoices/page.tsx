'use client';

import { useState } from 'react';
import Link from 'next/link';

type Invoice = {
  id: string;
  date: string;
  dueDate: string;
  amount: string;
  status: string;
  orderId?: string;
  service: string;
};

export default function InvoicesPage() {
  // Mock data for invoices
  const allInvoices: Invoice[] = [
    {
      id: "INV-785432",
      date: "May 12, 2025",
      dueDate: "May 26, 2025",
      amount: "$12.99",
      status: "paid",
      orderId: "ORD-123456",
      service: "Premium Hosting"
    },
    {
      id: "INV-785431",
      date: "May 10, 2025",
      dueDate: "May 24, 2025",
      amount: "$29.99",
      status: "paid",
      orderId: "ORD-123455",
      service: "AI Assistant Pro"
    },
    {
      id: "INV-785430",
      date: "Apr 20, 2025",
      dueDate: "May 4, 2025",
      amount: "$12.99",
      status: "paid",
      orderId: "ORD-123451",
      service: "Premium Hosting"
    },
    {
      id: "INV-785429",
      date: "Apr 15, 2025",
      dueDate: "Apr 29, 2025",
      amount: "$14.99",
      status: "cancelled",
      orderId: "ORD-123452",
      service: "Security Suite"
    },
    {
      id: "INV-785428",
      date: "Apr 10, 2025",
      dueDate: "Apr 24, 2025",
      amount: "$29.99",
      status: "paid",
      orderId: "ORD-123450",
      service: "AI Assistant Pro"
    },
    {
      id: "INV-785427",
      date: "Mar 20, 2025",
      dueDate: "Apr 3, 2025",
      amount: "$12.99",
      status: "paid",
      orderId: "ORD-123447",
      service: "Premium Hosting"
    },
    {
      id: "INV-785426",
      date: "Mar 15, 2025",
      dueDate: "Mar 29, 2025",
      amount: "$39.99",
      status: "paid",
      orderId: "ORD-123448",
      service: "Data Analytics"
    },
    {
      id: "INV-785425",
      date: "Feb 20, 2025",
      dueDate: "Mar 6, 2025",
      amount: "$12.99",
      status: "paid",
      service: "Premium Hosting"
    },
    {
      id: "INV-785424",
      date: "Jan 20, 2025",
      dueDate: "Feb 3, 2025",
      amount: "$12.99",
      status: "paid",
      service: "Premium Hosting"
    },
    {
      id: "INV-785423",
      date: "Dec 20, 2024",
      dueDate: "Jan 3, 2025",
      amount: "$12.99",
      status: "paid",
      service: "Premium Hosting"
    }
  ];

  // State for filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortDirection, setSortDirection] = useState('desc');

  // Filter invoices based on status and search term
  const filteredInvoices = allInvoices.filter(invoice => {
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    const matchesSearch = invoice.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          invoice.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (invoice.orderId && invoice.orderId.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  // Sort invoices
  const sortedInvoices = [...filteredInvoices].sort((a, b) => {
    if (sortBy === 'date') {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return sortDirection === 'asc' ? dateA.getTime() - dateB.getTime() : dateB.getTime() - dateA.getTime();
    } else if (sortBy === 'amount') {
      const amountA = parseFloat(a.amount.replace('$', ''));
      const amountB = parseFloat(b.amount.replace('$', ''));
      return sortDirection === 'asc' ? amountA - amountB : amountB - amountA;
    } else if (sortBy === 'dueDate') {
      const dueDateA = new Date(a.dueDate);
      const dueDateB = new Date(b.dueDate);
      return sortDirection === 'asc' ? dueDateA.getTime() - dueDateB.getTime() : dueDateB.getTime() - dueDateA.getTime();
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
        <h1 className="text-2xl font-bold mb-2">Facturi</h1>
        <p className="text-text-secondary">Vizualizează și gestionează istoricul facturilor</p>
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
                placeholder="Caută facturi..."
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
              <option value="paid">Plătite</option>
              <option value="pending">În așteptare</option>
              <option value="overdue">Restante</option>
              <option value="cancelled">Anulate</option>
            </select>
          </div>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="dashboard-card">
        <div className="p-4 border-b border-border-color flex justify-between items-center">
          <h2 className="text-xl font-semibold">Istoric Facturi</h2>
          <div className="text-text-secondary text-sm">
            {filteredInvoices.length} {filteredInvoices.length === 1 ? 'factură' : 'facturi'} găsite
          </div>
        </div>
        <div className="p-4">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border-color">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Factură</th>
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
                    onClick={() => handleSortClick('dueDate')}
                  >
                    <div className="flex items-center">
                      Data Scadentă
                      {sortBy === 'dueDate' && (
                        <svg xmlns="http://www.w3.org/2000/svg" className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={sortDirection === 'asc' ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
                        </svg>
                      )}
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Serviciu</th>
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
                {sortedInvoices.map((invoice) => (
                  <tr key={invoice.id}>
                    <td className="px-4 py-4 whitespace-nowrap text-sm">
                      <Link
                        href={`/dashboard/invoices/${invoice.id}`}
                        className="text-primary hover:text-primary-dark transition-colors"
                      >
                        {invoice.id}
                      </Link>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm">{invoice.date}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm">{invoice.dueDate}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm">{invoice.service}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm">{invoice.amount}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs
                        ${invoice.status === 'paid' ? 'bg-green-900/30 text-green-300' :
                          invoice.status === 'pending' ? 'bg-amber-900/30 text-amber-300' :
                          invoice.status === 'overdue' ? 'bg-red-900/30 text-red-300' :
                          'bg-red-900/30 text-red-300'}`}>
                        {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm">
                      <div className="flex gap-3">
                        <Link
                          href={`/dashboard/invoices/${invoice.id}`}
                          className="text-primary hover:text-primary-dark transition-colors"
                        >
                          Vizualizare
                        </Link>
                        <button className="text-primary hover:text-primary-dark transition-colors">
                          Descărcare
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {sortedInvoices.length === 0 && (
            <div className="text-center py-8 text-text-secondary">
              Nu s-au găsit facturi care să corespundă filtrelor tale.
            </div>
          )}
        </div>
      </div>
    </>
  );
}