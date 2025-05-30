import { useEffect, useState } from 'react';

import { useLogger } from '@/lib/client-logger';
import { Invoice, InvoiceDetail, PaginationResult } from '@/types/invoice';



export function useInvoices(page: number = 1, limit: number = 20) {
    const logger = useLogger('useInvoices');
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [pagination, setPagination] = useState<PaginationResult>({
        page: 1,
        limit: 20,
        totalItems: 0,
        totalPages: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchInvoices = async () => {
            try {
                setLoading(true);
                const response = await fetch(`/api/invoices?page=${page}&limit=${limit}`);

                if (!response.ok) {
                    throw new Error('Failed to fetch invoices');
                }

                const data = await response.json();
                setInvoices(data.invoices);
                setPagination(data.pagination);
                setError(null);
            } catch (err) {
                logger.error('Error fetching invoices', err);
                setError('Failed to load invoices. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchInvoices();
    }, [page, limit]);

    return { invoices, pagination, loading, error };
}

export function useInvoice(invoiceId: string) {
    const logger = useLogger('useInvoice');
    const [invoice, setInvoice] = useState<InvoiceDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchInvoice = async () => {
            if (!invoiceId) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const response = await fetch(`/api/invoices/${invoiceId}`);

                if (!response.ok) {
                    throw new Error('Failed to fetch invoice');
                }

                const data = await response.json();
                setInvoice(data.invoice);
                setError(null);
            } catch (err) {
                logger.error('Error fetching invoice', err, { invoiceId });
                setError('Failed to load invoice details. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchInvoice();
    }, [invoiceId]);

    return { invoice, loading, error };
}
