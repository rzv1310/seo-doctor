'use client';

import { Link } from '@/components/ui';
import { Invoice } from '@/types/invoice';



interface InvoicesTableProps {
    invoices: Invoice[];
    sortBy: string;
    sortDirection: string;
    onSort: (field: string) => void;
}

export default function InvoicesTable({
    invoices,
    sortBy,
    sortDirection,
    onSort
}: InvoicesTableProps) {
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const formatPrice = (price: number, currency?: string) => {
        return new Intl.NumberFormat('ro-RO', {
            style: 'currency',
            currency: currency?.toUpperCase() || 'EUR'
        }).format(price);
    };

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


    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border-color">
                <thead>
                    <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-text-primary uppercase tracking-wider">Factură</th>
                        <th
                            className="px-4 py-3 text-left text-xs font-medium text-text-primary uppercase tracking-wider cursor-pointer"
                            onClick={() => onSort('date')}
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
                            onClick={() => onSort('amount')}
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
                    {invoices.map((invoice) => (
                        <tr key={invoice.id}>
                            <td className="px-4 py-4 whitespace-nowrap text-sm">
                                <Link
                                    href={`/dashboard/invoices/${invoice.id}`}
                                >
                                    {invoice.number || invoice.id}
                                </Link>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm">{formatDate(invoice.createdAt)}</td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm">{invoice.serviceName || 'N/A'}</td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm">{formatPrice(invoice.amount, invoice.currency)}</td>
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
                                    >
                                        Vizualizare
                                    </Link>
                                    {invoice.invoicePdf && (
                                        <a 
                                            href={invoice.invoicePdf}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-text-primary transition-colors hover:text-primary"
                                        >
                                            Descărcare
                                        </a>
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
