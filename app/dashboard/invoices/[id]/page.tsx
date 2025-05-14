'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

type InvoiceDetails = {
  id: string;
  date: string;
  dueDate: string;
  amount: string;
  status: string;
  orderId?: string;
  service: string;
  billingAddress: {
    name: string;
    address: string;
    city: string;
    country: string;
    postalCode: string;
    email: string;
  };
  items: {
    name: string;
    description: string;
    quantity: number;
    unitPrice: string;
    total: string;
  }[];
  subtotal: string;
  tax: string;
  total: string;
  paymentMethod: string;
  notes?: string;
};

export default function InvoiceDetailsPage() {
  const params = useParams();
  const invoiceId = params.id as string;
  const [loading, setLoading] = useState(true);
  const [invoice, setInvoice] = useState<InvoiceDetails | null>(null);

  useEffect(() => {
    // Simulating API fetch for invoice details
    setLoading(true);
    // In a real app, we would fetch this from the database
    setTimeout(() => {
      if (invoiceId === 'INV-785432') {
        setInvoice({
          id: 'INV-785432',
          date: 'May 12, 2025',
          dueDate: 'May 26, 2025',
          amount: '$12.99',
          status: 'paid',
          orderId: 'ORD-123456',
          service: 'Premium Hosting',
          billingAddress: {
            name: 'John Doe',
            address: '123 Main St',
            city: 'San Francisco',
            country: 'USA',
            postalCode: '94105',
            email: 'john.doe@example.com'
          },
          items: [
            {
              name: 'Premium Hosting Plan',
              description: 'Monthly subscription for premium web hosting services',
              quantity: 1,
              unitPrice: '$12.99',
              total: '$12.99'
            }
          ],
          subtotal: '$12.99',
          tax: '$0.00',
          total: '$12.99',
          paymentMethod: 'Credit Card (ending in 4242)',
          notes: 'Thank you for your business!'
        });
      } else if (invoiceId === 'INV-785431') {
        setInvoice({
          id: 'INV-785431',
          date: 'May 10, 2025',
          dueDate: 'May 24, 2025',
          amount: '$29.99',
          status: 'paid',
          orderId: 'ORD-123455',
          service: 'AI Assistant Pro',
          billingAddress: {
            name: 'John Doe',
            address: '123 Main St',
            city: 'San Francisco',
            country: 'USA',
            postalCode: '94105',
            email: 'john.doe@example.com'
          },
          items: [
            {
              name: 'AI Assistant Pro',
              description: 'Monthly subscription for AI assistant with advanced features',
              quantity: 1,
              unitPrice: '$29.99',
              total: '$29.99'
            }
          ],
          subtotal: '$29.99',
          tax: '$0.00',
          total: '$29.99',
          paymentMethod: 'Credit Card (ending in 4242)',
          notes: 'Thank you for your business!'
        });
      } else {
        // Use a generic invoice if ID doesn't match our hardcoded examples
        setInvoice({
          id: invoiceId,
          date: 'Unknown',
          dueDate: 'Unknown',
          amount: '$0.00',
          status: 'unknown',
          service: 'Unknown Service',
          billingAddress: {
            name: 'John Doe',
            address: '123 Main St',
            city: 'San Francisco',
            country: 'USA',
            postalCode: '94105',
            email: 'john.doe@example.com'
          },
          items: [],
          subtotal: '$0.00',
          tax: '$0.00',
          total: '$0.00',
          paymentMethod: 'Unknown',
          notes: 'Invoice details not found.'
        });
      }
      setLoading(false);
    }, 500);
  }, [invoiceId]);

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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="text-center py-16">
        <h2 className="text-xl font-semibold mb-2">Invoice Not Found</h2>
        <p className="text-text-secondary mb-4">We couldn't find the invoice you're looking for.</p>
        <Link 
          href="/dashboard/invoices" 
          className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-md transition-colors"
        >
          Back to Invoices
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-2">Invoice {invoice.id}</h1>
          <p className="text-text-secondary">Issued on {invoice.date}</p>
        </div>
        <div className="flex gap-3 mt-4 md:mt-0">
          <Link 
            href="/dashboard/invoices" 
            className="bg-dark-blue-lighter hover:bg-primary/20 text-white px-4 py-2 rounded-md transition-colors text-sm"
          >
            Back to Invoices
          </Link>
          <button className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-md transition-colors text-sm">
            Download PDF
          </button>
        </div>
      </div>

      {/* Invoice Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="dashboard-card p-4">
          <h3 className="text-sm font-semibold mb-1 text-text-secondary">Status</h3>
          <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(invoice.status)}`}>
            {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
          </span>
        </div>
        <div className="dashboard-card p-4">
          <h3 className="text-sm font-semibold mb-1 text-text-secondary">Due Date</h3>
          <div>{invoice.dueDate}</div>
        </div>
        <div className="dashboard-card p-4">
          <h3 className="text-sm font-semibold mb-1 text-text-secondary">Amount</h3>
          <div className="text-xl font-bold text-primary">{invoice.total}</div>
        </div>
        <div className="dashboard-card p-4">
          <h3 className="text-sm font-semibold mb-1 text-text-secondary">Payment Method</h3>
          <div>{invoice.paymentMethod}</div>
        </div>
      </div>

      {/* Invoice Details */}
      <div className="dashboard-card mb-6">
        <div className="p-4 border-b border-border-color">
          <h2 className="text-xl font-semibold">Invoice Details</h2>
        </div>
        <div className="p-4">
          <div className="flex flex-col md:flex-row justify-between mb-10">
            <div>
              <h3 className="text-lg font-semibold mb-3">Billed To</h3>
              <div className="text-text-secondary">
                <p>{invoice.billingAddress.name}</p>
                <p>{invoice.billingAddress.address}</p>
                <p>{invoice.billingAddress.city}, {invoice.billingAddress.postalCode}</p>
                <p>{invoice.billingAddress.country}</p>
                <p>{invoice.billingAddress.email}</p>
              </div>
            </div>
            <div className="mt-6 md:mt-0">
              <h3 className="text-lg font-semibold mb-3">Invoice Info</h3>
              <div className="grid grid-cols-2 gap-x-4 text-text-secondary">
                <p className="font-medium">Invoice Number:</p>
                <p>{invoice.id}</p>
                <p className="font-medium">Issue Date:</p>
                <p>{invoice.date}</p>
                <p className="font-medium">Due Date:</p>
                <p>{invoice.dueDate}</p>
                {invoice.orderId && (
                  <>
                    <p className="font-medium">Order ID:</p>
                    <p>
                      <Link href={`/dashboard/orders/${invoice.orderId}`} className="text-primary hover:text-primary-dark transition-colors">
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
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Item</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Description</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Quantity</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Unit Price</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-color">
                {invoice.items.map((item, index) => (
                  <tr key={index}>
                    <td className="px-4 py-4 whitespace-nowrap text-sm">{item.name}</td>
                    <td className="px-4 py-4 text-sm">{item.description}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm">{item.quantity}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm">{item.unitPrice}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm">{item.total}</td>
                  </tr>
                ))}
                {invoice.items.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-4 text-center text-text-secondary">No items found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-6 flex justify-end">
            <div className="w-full max-w-xs">
              <div className="flex justify-between py-2 border-b border-border-color">
                <span className="text-text-secondary">Subtotal</span>
                <span>{invoice.subtotal}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border-color">
                <span className="text-text-secondary">Tax</span>
                <span>{invoice.tax}</span>
              </div>
              <div className="flex justify-between py-3 font-bold">
                <span>Total</span>
                <span className="text-primary">{invoice.total}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notes and Payment Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {invoice.notes && (
          <div className="dashboard-card">
            <div className="p-4 border-b border-border-color">
              <h2 className="text-xl font-semibold">Notes</h2>
            </div>
            <div className="p-4">
              <p className="text-text-secondary">{invoice.notes}</p>
            </div>
          </div>
        )}
        
        <div className="dashboard-card">
          <div className="p-4 border-b border-border-color">
            <h2 className="text-xl font-semibold">Payment Actions</h2>
          </div>
          <div className="p-4">
            {invoice.status === 'paid' && (
              <div className="bg-green-900/20 border border-green-900/30 rounded-md p-4 mb-4">
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-green-300 font-medium">Payment Completed</span>
                </div>
                <p className="text-text-secondary text-sm mt-2">
                  This invoice has been paid in full. No further action is required.
                </p>
              </div>
            )}
            
            {invoice.status === 'pending' && (
              <div className="flex flex-col space-y-3">
                <p className="text-text-secondary mb-2">
                  This invoice is due on {invoice.dueDate}. Please complete payment to avoid late fees.
                </p>
                <button className="bg-primary hover:bg-primary-dark text-white py-2 px-4 rounded-md transition-colors">
                  Pay Now
                </button>
              </div>
            )}
            
            {invoice.status === 'overdue' && (
              <div className="bg-red-900/20 border border-red-900/30 rounded-md p-4 mb-4">
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span className="text-red-300 font-medium">Payment Overdue</span>
                </div>
                <p className="text-text-secondary text-sm mt-2">
                  This invoice is past due. Please make a payment as soon as possible.
                </p>
                <button className="mt-4 w-full bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-md transition-colors">
                  Pay Now
                </button>
              </div>
            )}
            
            {invoice.status === 'cancelled' && (
              <div className="bg-red-900/20 border border-red-900/30 rounded-md p-4">
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span className="text-red-300 font-medium">Invoice Cancelled</span>
                </div>
                <p className="text-text-secondary text-sm mt-2">
                  This invoice has been cancelled and is no longer valid.
                </p>
              </div>
            )}
            
            <div className="mt-6">
              <h3 className="font-semibold mb-2">Need Help?</h3>
              <p className="text-text-secondary text-sm mb-3">
                If you have any questions about this invoice, please contact our support team.
              </p>
              <button className="bg-dark-blue-lighter hover:bg-primary/20 text-white py-2 px-4 rounded-md transition-colors text-sm w-full">
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}