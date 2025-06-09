'use client';

import { useState, useEffect } from 'react';
import { Invoice } from '@/types/invoice';
import { LinkButton, Spinner, Input, Link } from '@/components/ui';
import { DashboardPageLayout } from '@/components/layout';
import InvoicesTable from '@/components/dashboard/invoices/InvoicesTable';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useUsers } from '@/hooks/useUsers';
import { useLogger } from '@/lib/client-logger';



export default function AdminInvoicesPage() {
    const logger = useLogger('AdminInvoicesPage');
    const { user } = useAuth();
    const router = useRouter();
    const { users, isLoading: usersLoading } = useUsers();
    
    // State for filters and pagination
    const [statusFilter, setStatusFilter] = useState('all');
    const [userFilter, setUserFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('date');
    const [sortDirection, setSortDirection] = useState('desc');
    const [currentPage, setCurrentPage] = useState(1);
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState(false);
    const PAGE_SIZE = 20;

    // Fetch invoices
    const fetchInvoices = async () => {
        setLoading(true);
        setError(null);
        
        try {
            const params = new URLSearchParams({
                page: currentPage.toString(),
                limit: PAGE_SIZE.toString(),
            });
            
            if (userFilter !== 'all') {
                params.append('userId', userFilter);
            }
            
            if (statusFilter !== 'all') {
                params.append('status', statusFilter);
            }

            const response = await fetch(`/api/admin/invoices?${params}`);
            
            if (!response.ok) {
                if (response.status === 401) {
                    router.push('/dashboard');
                    return;
                }
                throw new Error('Failed to fetch invoices');
            }

            const data = await response.json();
            setInvoices(data.invoices);
            setHasMore(data.hasMore);
            
            logger.info('Invoices fetched', { count: data.invoices.length });
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch invoices';
            setError(errorMessage);
            logger.error('Failed to fetch invoices', { error: errorMessage });
        } finally {
            setLoading(false);
        }
    };

    // Fetch invoices when filters change
    useEffect(() => {
        fetchInvoices();
    }, [currentPage, userFilter, statusFilter]); // eslint-disable-line react-hooks/exhaustive-deps

    // Reset page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [userFilter, statusFilter]);

    // Filter invoices based on search term
    const filteredInvoices = invoices.filter(invoice => {
        const matchesSearch = 
            invoice.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (invoice.serviceName?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
            ((invoice as any).userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
            ((invoice as any).userName?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
        return matchesSearch;
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
            const dueDateA = a.dueDate ? new Date(a.dueDate) : new Date(0);
            const dueDateB = b.dueDate ? new Date(b.dueDate) : new Date(0);
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

    // Redirect if not admin
    if (user && !user.admin) {
        router.push('/dashboard');
        return null;
    }

    return (
        <DashboardPageLayout
            title="Toate Facturile"
            subtitle="Administrare facturi pentru toți utilizatorii"
        >
            {/* Filters */}
            <div className="dashboard-card mb-6">
                <div className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label htmlFor="search" className="block text-sm mb-1">Căutare</label>
                            <Input
                                id="search"
                                type="text"
                                placeholder="Caută după ID, serviciu, email sau nume"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        
                        <div>
                            <label htmlFor="user-filter" className="block text-sm mb-1">Filtru Utilizator</label>
                            <select
                                id="user-filter"
                                value={userFilter}
                                onChange={(e) => setUserFilter(e.target.value)}
                                className="w-full p-2 bg-dark-blue border border-border-color rounded-md focus:ring-1 focus:ring-primary focus:border-primary"
                                disabled={usersLoading}
                            >
                                <option value="all">Toți utilizatorii</option>
                                {users.map(user => (
                                    <option key={user.id} value={user.id}>
                                        {user.name} ({user.email})
                                    </option>
                                ))}
                            </select>
                        </div>
                        
                        <div>
                            <label htmlFor="status-filter" className="block text-sm mb-1">Status</label>
                            <select
                                id="status-filter"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full p-2 bg-dark-blue border border-border-color rounded-md focus:ring-1 focus:ring-primary focus:border-primary"
                            >
                                <option value="all">Toate statusurile</option>
                                <option value="paid">Plătite</option>
                                <option value="open">În așteptare</option>
                                <option value="uncollectible">Anulate</option>
                                <option value="void">Nule</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Invoices Table */}
            <div className="dashboard-card">
                <div className="p-4 border-b border-border-color flex justify-between items-center">
                    <h2 className="text-xl font-semibold">Facturi</h2>
                    <div className="text-text-primary text-sm">
                        {loading ? (
                            'Se încarcă...'
                        ) : (
                            `${filteredInvoices.length} facturi găsite`
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
                        <>
                            {/* Add user info to invoices table */}
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-dark-blue/50">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                                                Factură
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                                                Utilizator
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                                                Serviciu
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider cursor-pointer" onClick={() => handleSortClick('date')}>
                                                Data {sortBy === 'date' && (sortDirection === 'asc' ? '↑' : '↓')}
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider cursor-pointer" onClick={() => handleSortClick('amount')}>
                                                Sumă {sortBy === 'amount' && (sortDirection === 'asc' ? '↑' : '↓')}
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                                                Acțiuni
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border-color">
                                        {sortedInvoices.map((invoice) => (
                                            <tr key={invoice.id} className="hover:bg-dark-blue/30">
                                                <td className="px-4 py-3 whitespace-nowrap text-sm">
                                                    {(invoice as any).number || invoice.id.slice(-8)}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="text-sm">
                                                        <div className="font-medium">{(invoice as any).userName}</div>
                                                        <div className="text-text-secondary">{(invoice as any).userEmail}</div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-sm">
                                                    {invoice.serviceName}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm">
                                                    {new Date(invoice.createdAt).toLocaleDateString('ro-RO')}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                                                    {new Intl.NumberFormat('ro-RO', {
                                                        style: 'currency',
                                                        currency: (invoice as any).currency?.toUpperCase() || 'RON'
                                                    }).format(invoice.amount / 100)}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                        invoice.status === 'paid'
                                                            ? 'bg-green-900/30 text-green-300'
                                                            : invoice.status === 'pending'
                                                            ? 'bg-yellow-900/30 text-yellow-300'
                                                            : invoice.status === 'cancelled'
                                                            ? 'bg-red-900/30 text-red-300'
                                                            : 'bg-gray-900/30 text-gray-300'
                                                    }`}>
                                                        {invoice.status === 'paid' ? 'Plătită' :
                                                         invoice.status === 'pending' ? 'În așteptare' :
                                                         invoice.status === 'cancelled' ? 'Anulată' :
                                                         invoice.status === 'void' ? 'Nulă' : invoice.status}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm">
                                                    <Link
                                                        href={`/dashboard/invoices/${invoice.id}`}
                                                        variant="primary"
                                                    >
                                                        Vezi Detalii
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {!loading && !error && filteredInvoices.length === 0 && (
                                <div className="text-center py-8 text-text-primary">
                                    Nu s-au găsit facturi care să corespundă filtrelor tale.
                                </div>
                            )}

                            {/* Pagination */}
                            {!loading && !error && (invoices.length > 0 || currentPage > 1) && (
                                <div className="mt-6 flex justify-between items-center">
                                    <div className="text-sm text-text-primary">
                                        Pagina {currentPage}
                                    </div>
                                    <div className="flex space-x-2">
                                        <LinkButton
                                            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                            disabled={currentPage === 1}
                                            variant="default"
                                            size="sm"
                                        >
                                            ← Anterior
                                        </LinkButton>
                                        <LinkButton
                                            onClick={() => setCurrentPage(currentPage + 1)}
                                            disabled={!hasMore}
                                            variant="default"
                                            size="sm"
                                        >
                                            Următor →
                                        </LinkButton>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </DashboardPageLayout>
    );
}