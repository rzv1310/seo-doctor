'use client';

import { useState } from 'react';
import { Link, ActionButton, Modal } from '@/components/ui';
import { Invoice } from '@/types/invoice';
import { convertRONtoEUR, formatEUR } from '@/lib/currency-utils';



interface InvoicesTableProps {
    invoices: Invoice[];
    sortBy: string;
    sortDirection: string;
    onSort: (field: string) => void;
    onInvoiceUpdate?: () => void;
}

export default function InvoicesTable({
    invoices,
    sortBy,
    sortDirection,
    onSort,
    onInvoiceUpdate
}: InvoicesTableProps) {
    const [cancelModalOpen, setCancelModalOpen] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('ro-RO', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const formatPrice = (price: number, currency?: string) => {
        // Always display in EUR, converting from RON if needed
        if (currency?.toLowerCase() === 'ron') {
            const eurAmount = convertRONtoEUR(price);
            return formatEUR(eurAmount);
        }
        // If already in EUR or other currency, format as EUR
        return formatEUR(price);
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
            case 'void':
                return 'Anulată';
            default:
                return status.charAt(0).toUpperCase() + status.slice(1);
        }
    };

    const handleCancelPayment = (invoice: Invoice) => {
        setSelectedInvoice(invoice);
        setCancelModalOpen(true);
    };

    const cancelPayment = async (): Promise<boolean> => {
        if (!selectedInvoice?.id) return false;

        setIsSubmitting(true);
        try {
            const response = await fetch('/api/invoices/cancel-payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    invoiceId: selectedInvoice.id
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to cancel payment');
            }

            // Refresh the invoices list
            if (onInvoiceUpdate) {
                onInvoiceUpdate();
            }

            return true;
        } catch (error) {
            console.error('Error cancelling payment:', error);
            throw error;
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleModalClose = () => {
        if (!isSubmitting) {
            setCancelModalOpen(false);
            setSelectedInvoice(null);
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
                                                invoice.status === 'cancelled' ? 'bg-gray-900/30 text-gray-300' :
                                                    invoice.status === 'void' ? 'bg-gray-900/30 text-gray-300' :
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
                                    {invoice.status === 'pending' && (
                                        <>
                                            <Link
                                                href="/dashboard/checkout"
                                            >
                                                Finalizează
                                            </Link>
                                            <button
                                                onClick={() => handleCancelPayment(invoice)}
                                                disabled={isSubmitting}
                                            >
                                                Anulează
                                            </button>
                                        </>
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Cancel Payment Modal */}
            {selectedInvoice && (
                <Modal
                    isOpen={cancelModalOpen}
                    onClose={handleModalClose}
                    title="Anulează Plata în Așteptare"
                >
                    <div className="space-y-4">
                        <div className="bg-amber-900/20 border border-amber-900/30 rounded-md p-4">
                            <div className="flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                <span className="text-amber-300 font-medium">Confirmare Anulare</span>
                            </div>
                            <p className="text-amber-200 text-sm mt-2">
                                Sigur vrei să anulezi plata în așteptare pentru serviciul <strong>{selectedInvoice.serviceName}</strong>?
                            </p>
                            <p className="text-amber-200 text-xs mt-2">
                                Această acțiune va șterge plata în așteptare și vei putea încerca din nou mai târziu.
                            </p>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
                            <ActionButton
                                onClick={handleModalClose}
                                disabled={isSubmitting}
                                variant="default"
                            >
                                Înapoi
                            </ActionButton>
                            <ActionButton
                                onClick={cancelPayment}
                                variant="danger"
                                disabled={isSubmitting}
                                loading={isSubmitting}
                            >
                                {isSubmitting ? 'Se anulează...' : 'Anulează Plata'}
                            </ActionButton>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
}
