'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useInvoices, Invoice } from '@/hooks/useInvoices';

export default function InvoicesPage() {
  // State for filters and pagination
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortDirection, setSortDirection] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 20;

  // Get invoices from our custom hook
  const { invoices, pagination, loading, error } = useInvoices(currentPage, PAGE_SIZE);

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Format price as currency
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  // Filter invoices based on status and search term
  const filteredInvoices = invoices.filter(invoice => {
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    const matchesSearch = invoice.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (invoice.serviceName?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
    return matchesStatus && matchesSearch;
  });

  // Sort invoices
  const sortedInvoices = [...filteredInvoices].sort((a: Invoice, b: Invoice) => {
    if (sortBy === 'date') {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return sortDirection === 'asc' ? dateA.getTime() - dateB.getTime() : dateB.getTime() - dateA.getTime();
    } else if (sortBy === 'amount') {
      return sortDirection === 'asc' ? a.amount - b.amount : b.amount - a.amount;
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

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Get status text
  const getStatusText = (status: string) => {
    switch (status) {
      case 'paid':
        return 'Plătită';
      case 'pending':
        return 'În așteptare';
      case 'overdue':
        return 'Restantă';
      case 'cancelled':
        return 'Anulată';
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  // Generate pagination buttons
  const generatePaginationButtons = () => {
    const buttons = [];
    const totalPages = pagination.totalPages;

    // Add previous page button
    buttons.push(
      <button
        key="prev"
        onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className={`px-3 py-1 rounded-md ${
          currentPage === 1
            ? 'text-text-primary opacity-50 cursor-not-allowed'
            : 'text-text-primary hover:bg-dark-blue-lighter'
        }`}
      >
        ← Anterior
      </button>
    );

    // Add page number buttons (show 5 pages at most)
    const startPage = Math.max(1, Math.min(currentPage - 2, totalPages - 4));
    const endPage = Math.min(totalPages, Math.max(5, currentPage + 2));

    // Add first page button if not already in range
    if (startPage > 1) {
      buttons.push(
        <button
          key={1}
          onClick={() => handlePageChange(1)}
          className={`px-3 py-1 rounded-md hover:bg-dark-blue-lighter`}
        >
          1
        </button>
      );
      if (startPage > 2) {
        buttons.push(<span key="ellipsis1" className="px-1">...</span>);
      }
    }

    // Add page buttons
    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-3 py-1 rounded-md ${
            i === currentPage
              ? 'bg-primary text-white'
              : 'hover:bg-dark-blue-lighter'
          }`}
        >
          {i}
        </button>
      );
    }

    // Add last page button if not already in range
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        buttons.push(<span key="ellipsis2" className="px-1">...</span>);
      }
      buttons.push(
        <button
          key={totalPages}
          onClick={() => handlePageChange(totalPages)}
          className={`px-3 py-1 rounded-md hover:bg-dark-blue-lighter`}
        >
          {totalPages}
        </button>
      );
    }

    // Add next page button
    buttons.push(
      <button
        key="next"
        onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className={`px-3 py-1 rounded-md ${
          currentPage === totalPages
            ? 'text-text-primary opacity-50 cursor-not-allowed'
            : 'text-text-primary hover:bg-dark-blue-lighter'
        }`}
      >
        Următor →
      </button>
    );

    return buttons;
  };

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Facturi</h1>
        <p className="text-text-primary">Vizualizează și gestionează istoricul facturilor</p>
      </div>

      {/* Filters and search */}
      <div className="dashboard-card mb-6">
        <div className="p-4 border-b border-border-color">
          <h2 className="text-xl font-semibold">Filtre</h2>
        </div>
        <div className="p-4 flex flex-col md:flex-row md:items-end gap-4">
          <div className="md:flex-1">
            <label htmlFor="search-input" className="block text-sm text-text-primary mb-1">Căutare</label>
            <div className="relative">
              <input
                id="search-input"
                type="text"
                placeholder="Caută facturi..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-dark-blue-lighter rounded-md py-2 px-3 text-white border border-border-color focus:outline-none focus:border-primary"
              />
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 absolute right-3 top-3 text-text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          <div className="max-w-[300px]">
            <label htmlFor="status-filter" className="block text-sm text-text-primary mb-1">Status</label>
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
          <div className="text-text-primary text-sm">
            {loading ? (
              'Se încarcă...'
            ) : (
              `${filteredInvoices.length} ${filteredInvoices.length === 1 ? 'factură' : 'facturi'} găsite din ${pagination.totalItems} total`
            )}
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
                    <th className="px-4 py-3 text-left text-xs font-medium text-text-primary uppercase tracking-wider">Factură</th>
                    <th
                      className="px-4 py-3 text-left text-xs font-medium text-text-primary uppercase tracking-wider cursor-pointer"
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
                    <th className="px-4 py-3 text-left text-xs font-medium text-text-primary uppercase tracking-wider">Serviciu</th>
                    <th
                      className="px-4 py-3 text-left text-xs font-medium text-text-primary uppercase tracking-wider cursor-pointer"
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
                    <th className="px-4 py-3 text-left text-xs font-medium text-text-primary uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-text-primary uppercase tracking-wider">Acțiuni</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-color">
                  {sortedInvoices.map((invoice) => (
                    <tr key={invoice.id}>
                      <td className="px-4 py-4 whitespace-nowrap text-sm">
                        <Link
                          href={`/dashboard/invoices/${invoice.id}`}
                          className="text-text-primary hover:text-primary-dark transition-colors"
                        >
                          {invoice.id}
                        </Link>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm">{formatDate(invoice.createdAt)}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm">{invoice.serviceName || 'N/A'}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm">{formatPrice(invoice.amount)}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs
                          ${invoice.status === 'paid' ? 'bg-green-900/30 text-green-300' :
                            invoice.status === 'pending' ? 'bg-amber-900/30 text-amber-300' :
                            invoice.status === 'overdue' ? 'bg-red-900/30 text-red-300' :
                            'bg-red-900/30 text-red-300'}`}>
                          {getStatusText(invoice.status)}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm">
                        <div className="flex gap-3">
                          <Link
                            href={`/dashboard/invoices/${invoice.id}`}
                            className="text-text-primary hover:text-sky-300 transition-colors"
                          >
                            Vizualizare
                          </Link>
                          <button className="text-text-primary hover:text-sky-300 transition-colors">
                            Descărcare
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!loading && !error && sortedInvoices.length === 0 && (
            <div className="text-center py-8 text-text-primary">
              Nu s-au găsit facturi care să corespundă filtrelor tale.
            </div>
          )}

          {/* Pagination */}
          {!loading && !error && pagination.totalPages > 1 && (
            <div className="mt-6 flex justify-between items-center">
              <div className="text-sm text-text-primary">
                Afișez {(currentPage - 1) * PAGE_SIZE + 1}-
                {Math.min(currentPage * PAGE_SIZE, pagination.totalItems)} din {pagination.totalItems} rezultate
              </div>
              <div className="flex space-x-1">
                {generatePaginationButtons()}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}