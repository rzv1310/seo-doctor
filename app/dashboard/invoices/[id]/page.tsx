'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useInvoice } from '@/hooks/useInvoices';



export default function InvoiceDetailsPage() {
    const params = useParams();
    const invoiceId = params.id as string;
    const { invoice, loading, error } = useInvoice(invoiceId);

    // Format price as currency
    const formatPrice = (price: number, currency?: string) => {
        return new Intl.NumberFormat('ro-RO', {
            style: 'currency',
            currency: currency?.toUpperCase() || 'EUR',
        }).format(price);
    };

    // Format date
    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('ro-RO', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'paid':
                return 'bg-green-900/30 text-green-300';
            case 'pending':
                return 'bg-amber-900/30 text-amber-300';
            case 'overdue':
                return 'bg-red-900/30 text-red-300';
            case 'cancelled':
                return 'bg-red-900/30 text-red-300';
            default:
                return 'bg-gray-900/30 text-gray-300';
        }
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
                return 'Necunoscut';
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-full py-16">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
        );
    }

    if (error || !invoice) {
        return (
            <div className="text-center py-16">
                <h2 className="text-xl font-semibold mb-2">Factura nu a fost găsită</h2>
                <p className="text-text-secondary mb-4">Nu am putut găsi factura pe care o cauți.</p>
                <Link
                    href="/dashboard/invoices"
                    className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-md transition-colors"
                >
                    Înapoi la Facturi
                </Link>
            </div>
        );
    }

    return (
        <>
            <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-2xl font-bold mb-2">Factura {invoice.number || invoice.id}</h1>
                    <p className="text-text-secondary">Emisă pe {formatDate(invoice.createdAt)}</p>
                </div>
                <div className="flex gap-3 mt-4 md:mt-0">
                    <Link
                        href="/dashboard/invoices"
                        className="bg-dark-blue-lighter hover:bg-primary/20 text-white px-4 py-2 rounded-md transition-colors text-sm"
                    >
                        Înapoi la Facturi
                    </Link>
                    {invoice.invoicePdf && (
                        <a
                            href={invoice.invoicePdf}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-md transition-colors text-sm inline-block"
                        >
                            Descarcă PDF
                        </a>
                    )}
                </div>
            </div>

            {/* Invoice Summary */}
            <div className={`grid grid-cols-1 ${invoice.discounts && invoice.discounts.length > 0 ? 'md:grid-cols-5' : 'md:grid-cols-4'} gap-6 mb-6`}>
                <div className="dashboard-card p-4">
                    <h3 className="text-sm font-semibold mb-1 text-text-secondary">Status</h3>
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(invoice.status)}`}>
                        {getStatusText(invoice.status)}
                    </span>
                </div>
                <div className="dashboard-card p-4">
                    <h3 className="text-sm font-semibold mb-1 text-text-secondary">Data Scadentă</h3>
                    <div>{formatDate(invoice.dueDate)}</div>
                </div>
                <div className="dashboard-card p-4">
                    <h3 className="text-sm font-semibold mb-1 text-text-secondary">Sumă</h3>
                    <div className="text-xl font-bold text-text-primary">{formatPrice(invoice.amount, invoice.currency)}</div>
                </div>
                {invoice.discounts && invoice.discounts.length > 0 && (
                    <div className="dashboard-card p-4 border-green-500/20 bg-green-900/10">
                        <h3 className="text-sm font-semibold mb-1 text-text-secondary">Discount</h3>
                        <div className="text-green-400 font-semibold">
                            {invoice.discounts[0].percentOff ? `${invoice.discounts[0].percentOff}%` : formatPrice(invoice.discountTotal || 0, invoice.currency)}
                        </div>
                        <div className="text-xs text-green-300 mt-1">
                            {invoice.discounts[0].couponName || invoice.discounts[0].couponId}
                        </div>
                    </div>
                )}
                <div className="dashboard-card p-4">
                    <h3 className="text-sm font-semibold mb-1 text-text-secondary">Metodă de Plată</h3>
                    <div>Card bancar</div>
                </div>
            </div>

            {/* Invoice Details */}
            <div className="dashboard-card mb-6">
                <div className="p-4 border-b border-border-color">
                    <h2 className="text-xl font-semibold">Detalii Factură</h2>
                </div>
                <div className="p-4">
                    <div className="flex flex-col md:flex-row justify-between mb-10">
                        <div>
                            <h3 className="text-lg font-semibold mb-3">Facturat către</h3>
                            <div className="text-text-secondary">
                                <p>{invoice.billingAddress.name}</p>
                                <p>{invoice.billingAddress.address}</p>
                                <p>{invoice.billingAddress.city}, {invoice.billingAddress.postalCode}</p>
                                <p>{invoice.billingAddress.country}</p>
                                <p>{invoice.billingAddress.email}</p>
                            </div>
                        </div>
                        <div className="mt-6 md:mt-0">
                            <h3 className="text-lg font-semibold mb-3">Informații Factură</h3>
                            <div className="grid grid-cols-2 gap-x-4 text-text-secondary">
                                <p className="font-medium">Număr Factură:</p>
                                <p>{invoice.number || invoice.id}</p>
                                <p className="font-medium">Data Emiterii:</p>
                                <p>{formatDate(invoice.createdAt)}</p>
                                <p className="font-medium">Data Scadentă:</p>
                                <p>{formatDate(invoice.dueDate)}</p>
                                {invoice.discounts && invoice.discounts.length > 0 && (
                                    <>
                                        <p className="font-medium">Cod Promoțional:</p>
                                        <p className="text-green-400">
                                            {invoice.discounts[0].couponName || invoice.discounts[0].couponId}
                                            {invoice.discounts[0].percentOff && ` (${invoice.discounts[0].percentOff}% reducere)`}
                                            {invoice.discounts[0].amountOff && ` (${formatPrice(invoice.discounts[0].amountOff, invoice.discounts[0].currency)} reducere)`}
                                        </p>
                                    </>
                                )}
                                {invoice.orderId && (
                                    <>
                                        <p className="font-medium">ID Comandă:</p>
                                        <p>
                                            <Link href={`/dashboard/orders/${invoice.orderId}`} className="text-text-primary hover:text-primary-dark transition-colors">
                                                {invoice.orderId}
                                            </Link>
                                        </p>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-border-color">
                            <thead>
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Serviciu</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Descriere</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Cantitate</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Preț Unitar</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border-color">
                                {invoice.items.map((item, index) => (
                                    <tr key={index}>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm">{item.name}</td>
                                        <td className="px-4 py-4 text-sm">{item.description}</td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm">{item.quantity}</td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm">{formatPrice(item.unitPrice, invoice.currency)}</td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm">{formatPrice(item.total, invoice.currency)}</td>
                                    </tr>
                                ))}
                                {invoice.items.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-4 py-4 text-center text-text-secondary">Nu s-au găsit articole</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-6 flex justify-end">
                        <div className="w-full max-w-xs">
                            <div className="flex justify-between py-2 border-b border-border-color">
                                <span className="text-text-secondary">Subtotal</span>
                                <span>{formatPrice(invoice.subtotal || invoice.amount, invoice.currency)}</span>
                            </div>
                            {invoice.discounts && invoice.discounts.length > 0 && (
                                <div className="flex justify-between py-2 border-b border-border-color">
                                    <span className="text-text-secondary">
                                        Discount {invoice.discounts[0].couponName && `(${invoice.discounts[0].couponName})`}
                                        {invoice.discounts[0].percentOff && ` - ${invoice.discounts[0].percentOff}%`}
                                    </span>
                                    <span className="text-green-500">-{formatPrice(invoice.discountTotal || 0, invoice.currency)}</span>
                                </div>
                            )}
                            <div className="flex justify-between py-2 border-b border-border-color">
                                <span className="text-text-secondary">Taxă</span>
                                <span>{formatPrice(invoice.tax || 0, invoice.currency)}</span>
                            </div>
                            <div className="flex justify-between py-3 font-bold">
                                <span>Total</span>
                                <span className="text-text-primary">{formatPrice(invoice.total || invoice.amount, invoice.currency)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Payment Actions */}
            <div className="dashboard-card">
                <div className="p-4 border-b border-border-color">
                    <h2 className="text-xl font-semibold">Acțiuni de Plată</h2>
                </div>
                <div className="p-4">
                    {invoice.status === 'paid' && (
                        <div className="bg-green-900/20 border border-green-900/30 rounded-md p-4 mb-4">
                            <div className="flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span className="text-green-300 font-medium">Plată Finalizată</span>
                            </div>
                            <p className="text-text-secondary text-sm mt-2">
                                Această factură a fost plătită integral. Nu este necesară nicio acțiune suplimentară.
                            </p>
                        </div>
                    )}

                    {invoice.status === 'pending' && (
                        <div className="flex flex-col space-y-3">
                            <p className="text-text-secondary mb-2">
                                Această factură este scadentă pe {formatDate(invoice.dueDate)}. Te rugăm să efectuezi plata pentru a evita taxele de întârziere.
                            </p>
                            {invoice.hostedInvoiceUrl && (
                                <a
                                    href={invoice.hostedInvoiceUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="bg-primary hover:bg-primary-dark text-white py-2 px-4 rounded-md transition-colors inline-block text-center"
                                >
                                    Plătește Acum
                                </a>
                            )}
                        </div>
                    )}

                    {invoice.status === 'overdue' && (
                        <div className="bg-red-900/20 border border-red-900/30 rounded-md p-4 mb-4">
                            <div className="flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                <span className="text-red-300 font-medium">Plată Întârziată</span>
                            </div>
                            <p className="text-text-secondary text-sm mt-2">
                                Această factură este restantă. Te rugăm să efectuezi plata cât mai curând posibil.
                            </p>
                            {invoice.hostedInvoiceUrl && (
                                <a
                                    href={invoice.hostedInvoiceUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="mt-4 block w-full bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-md transition-colors text-center"
                                >
                                    Plătește Acum
                                </a>
                            )}
                        </div>
                    )}

                    {invoice.status === 'cancelled' && (
                        <div className="bg-red-900/20 border border-red-900/30 rounded-md p-4">
                            <div className="flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                <span className="text-red-300 font-medium">Factură Anulată</span>
                            </div>
                            <p className="text-text-secondary text-sm mt-2">
                                Această factură a fost anulată și nu mai este validă.
                            </p>
                        </div>
                    )}

                    <div className="mt-6">
                        <h3 className="font-semibold mb-2">Ai nevoie de ajutor?</h3>
                        <p className="text-text-secondary text-sm mb-3">
                            Dacă ai întrebări despre această factură, te rugăm să contactezi echipa noastră de suport.
                        </p>
                        <button className="bg-dark-blue-lighter hover:bg-primary/20 text-white py-2 px-4 rounded-md transition-colors text-sm w-full">
                            Contactează Suportul
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
