'use client';

import { useState } from 'react';
import { useDashboardInvoices } from '@/context/DashboardContext';
import { Invoice } from '@/types/invoice';
import { LinkButton, Spinner } from '@/components/ui';
import { DashboardPageLayout } from '@/components/layout';
import InvoiceFilters from '@/components/dashboard/invoices/InvoiceFilters';
import InvoicesTable from '@/components/dashboard/invoices/InvoicesTable';



export default function InvoicesPage() {
    // State for filters and pagination
    const [statusFilter, setStatusFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('date');
    const [sortDirection, setSortDirection] = useState('desc');
    const [currentPage, setCurrentPage] = useState(1);
    const PAGE_SIZE = 20;

    // Get invoices from context
    const { invoices, isLoading: loading, error } = useDashboardInvoices();

    // Calculate pagination
    const totalItems = (invoices || []).length;
    const totalPages = Math.ceil(totalItems / PAGE_SIZE);
    const pagination = {
        totalItems,
        totalPages,
        currentPage,
        pageSize: PAGE_SIZE
    };


    // Filter invoices based on status and search term
    const filteredInvoices = (invoices || []).filter(invoice => {
        const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
        const matchesSearch = invoice.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (invoice.serviceName?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
        return matchesStatus && matchesSearch;
    });

    // Paginate invoices after filtering and sorting
    const sortedInvoices = [...filteredInvoices].sort((a: Invoice, b: Invoice) => {
        if (sortBy === 'date') {
            const dateA = new Date(a.createdAt);
            const dateB = new Date(b.createdAt);
            return sortDirection === 'asc' ? dateA.getTime() - dateB.getTime() : dateB.getTime() - dateA.getTime();
        } else if (sortBy === 'amount') {
            return sortDirection === 'asc' ? a.amount - b.amount : b.amount - a.amount;
        } else if (sortBy === 'dueDate') {
            const dueDateA = a.dueDate ? new Date(a.dueDate) : new Date(0);
            const dueDateB = b.dueDate ? new Date(b.dueDate) : new Date(0);
            return sortDirection === 'asc' ? dueDateA.getTime() - dueDateB.getTime() : dueDateB.getTime() - dueDateA.getTime();
        }
        return 0;
    });

    // Apply pagination to sorted invoices
    const paginatedInvoices = sortedInvoices.slice(
        (currentPage - 1) * PAGE_SIZE,
        currentPage * PAGE_SIZE
    );

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


    // Generate pagination buttons
    const generatePaginationButtons = () => {
        const buttons = [];
        const totalPages = pagination.totalPages;

        // Add previous page button
        buttons.push(
            <LinkButton
                key="prev"
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                variant="default"
                size="sm"
            >
                ← Anterior
            </LinkButton>
        );

        // Add page number buttons (show 5 pages at most)
        const startPage = Math.max(1, Math.min(currentPage - 2, totalPages - 4));
        const endPage = Math.min(totalPages, Math.max(5, currentPage + 2));

        // Add first page button if not already in range
        if (startPage > 1) {
            buttons.push(
                <LinkButton
                    key={1}
                    onClick={() => handlePageChange(1)}
                    variant="default"
                    size="sm"
                >
                    1
                </LinkButton>
            );
            if (startPage > 2) {
                buttons.push(<span key="ellipsis1" className="px-1">...</span>);
            }
        }

        // Add page buttons
        for (let i = startPage; i <= endPage; i++) {
            buttons.push(
                <LinkButton
                    key={i}
                    onClick={() => handlePageChange(i)}
                    variant={i === currentPage ? 'primary' : 'default'}
                    size="sm"
                >
                    {i}
                </LinkButton>
            );
        }

        // Add last page button if not already in range
        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                buttons.push(<span key="ellipsis2" className="px-1">...</span>);
            }
            buttons.push(
                <LinkButton
                    key={totalPages}
                    onClick={() => handlePageChange(totalPages)}
                    variant="default"
                    size="sm"
                >
                    {totalPages}
                </LinkButton>
            );
        }

        // Add next page button
        buttons.push(
            <LinkButton
                key="next"
                onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                variant="default"
                size="sm"
            >
                Următor →
            </LinkButton>
        );

        return buttons;
    };

    return (
        <DashboardPageLayout
            title="Facturi"
            subtitle="Vizualizează și gestionează istoricul facturilor"
        >

            <InvoiceFilters
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                statusFilter={statusFilter}
                onStatusChange={setStatusFilter}
            />

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
                            <Spinner size="lg" />
                        </div>
                    ) : error ? (
                        <div className="text-center py-8 text-danger">
                            {error}
                        </div>
                    ) : (
                        <InvoicesTable
                            invoices={paginatedInvoices}
                            sortBy={sortBy}
                            sortDirection={sortDirection}
                            onSort={handleSortClick}
                        />
                    )}

                    {!loading && !error && filteredInvoices.length === 0 && (
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
        </DashboardPageLayout>
    );
}
