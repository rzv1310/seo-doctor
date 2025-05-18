'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

type OrderDetails = {
  id: string;
  service: string;
  date: string;
  amount: string;
  status: string;
  invoiceId?: string;
  customerName: string;
  customerEmail: string;
  orderItems: {
    name: string;
    description: string;
    quantity: number;
    unitPrice: string;
    total: string;
  }[];
  subtotal: string;
  tax: string;
  total: string;
  notes?: string;
};

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<OrderDetails | null>(null);

  useEffect(() => {
    // Simulating API fetch for order details
    setLoading(true);
    // In a real app, we would fetch this from the database
    setTimeout(() => {
      if (orderId === 'ORD-123456') {
        setOrder({
          id: 'ORD-123456',
          service: 'Premium Hosting',
          date: 'May 12, 2025',
          amount: '$12.99',
          status: 'completed',
          invoiceId: 'INV-785432',
          customerName: 'John Doe',
          customerEmail: 'john.doe@example.com',
          orderItems: [
            {
              name: 'Premium Hosting Plan',
              description: 'Monthly subscription for premium web hosting services',
              quantity: 1,
              unitPrice: '$12.99',
              total: '$12.99',
            }
          ],
          subtotal: '$12.99',
          tax: '$0.00',
          total: '$12.99',
          notes: 'Customer requested additional storage space in the future.',
        });
      } else if (orderId === 'ORD-123455') {
        setOrder({
          id: 'ORD-123455',
          service: 'AI Assistant Pro',
          date: 'May 10, 2025',
          amount: '$29.99',
          status: 'completed',
          invoiceId: 'INV-785431',
          customerName: 'John Doe',
          customerEmail: 'john.doe@example.com',
          orderItems: [
            {
              name: 'AI Assistant Pro',
              description: 'Monthly subscription for AI assistant with advanced features',
              quantity: 1,
              unitPrice: '$29.99',
              total: '$29.99',
            }
          ],
          subtotal: '$29.99',
          tax: '$0.00',
          total: '$29.99',
        });
      } else if (orderId === 'ORD-123454') {
        setOrder({
          id: 'ORD-123454',
          service: 'Data Analytics',
          date: 'May 5, 2025',
          amount: '$39.99',
          status: 'pending',
          customerName: 'John Doe',
          customerEmail: 'john.doe@example.com',
          orderItems: [
            {
              name: 'Data Analytics Platform',
              description: 'Monthly subscription for data analytics platform',
              quantity: 1,
              unitPrice: '$39.99',
              total: '$39.99',
            }
          ],
          subtotal: '$39.99',
          tax: '$0.00',
          total: '$39.99',
          notes: 'Pending payment verification.',
        });
      } else {
        // Use a generic order if ID doesn't match our hardcoded examples
        setOrder({
          id: orderId,
          service: 'Unknown Service',
          date: 'Unknown Date',
          amount: '$0.00',
          status: 'unknown',
          customerName: 'John Doe',
          customerEmail: 'john.doe@example.com',
          orderItems: [],
          subtotal: '$0.00',
          tax: '$0.00',
          total: '$0.00',
          notes: 'Order details not found.',
        });
      }
      setLoading(false);
    }, 500);
  }, [orderId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-16">
        <h2 className="text-xl font-semibold mb-2">Order Not Found</h2>
        <p className="text-text-secondary mb-4">We couldn't find the order you're looking for.</p>
        <Link
          href="/dashboard/orders"
          className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-md transition-colors"
        >
          Back to Orders
        </Link>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-900/30 text-green-300';
      case 'pending':
        return 'bg-amber-900/30 text-amber-300';
      case 'cancelled':
        return 'bg-red-900/30 text-red-300';
      default:
        return 'bg-gray-900/30 text-gray-300';
    }
  };

  return (
    <>
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-2">Order {order.id}</h1>
          <p className="text-text-secondary">Placed on {order.date}</p>
        </div>
        <div className="flex gap-3 mt-4 md:mt-0">
          <Link
            href="/dashboard/orders"
            className="bg-dark-blue-lighter hover:bg-primary/20 text-white px-4 py-2 rounded-md transition-colors text-sm"
          >
            Back to Orders
          </Link>
          {order.invoiceId && (
            <Link
              href={`/dashboard/invoices/${order.invoiceId}`}
              className="bg-primary/20 hover:bg-primary/30 text-primary px-4 py-2 rounded-md transition-colors text-sm"
            >
              View Invoice
            </Link>
          )}
        </div>
      </div>

      {/* Order Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="dashboard-card p-4">
          <h3 className="text-lg font-semibold mb-3">Order Status</h3>
          <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(order.status)}`}>
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </span>
        </div>
        <div className="dashboard-card p-4">
          <h3 className="text-lg font-semibold mb-3">Payment</h3>
          <div className="text-2xl font-bold text-primary">{order.total}</div>
          {order.invoiceId && (
            <div className="text-sm text-text-secondary mt-1">
              Invoice: {order.invoiceId}
            </div>
          )}
        </div>
        <div className="dashboard-card p-4">
          <h3 className="text-lg font-semibold mb-3">Customer</h3>
          <div className="font-medium">{order.customerName}</div>
          <div className="text-text-secondary text-sm">{order.customerEmail}</div>
        </div>
      </div>

      {/* Order Items */}
      <div className="dashboard-card mb-6">
        <div className="p-4 border-b border-border-color">
          <h2 className="text-xl font-semibold">Order Details</h2>
        </div>
        <div className="p-4">
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
                {order.orderItems.map((item, index) => (
                  <tr key={index}>
                    <td className="px-4 py-4 whitespace-nowrap text-sm">{item.name}</td>
                    <td className="px-4 py-4 text-sm">{item.description}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm">{item.quantity}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm">{item.unitPrice}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm">{item.total}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="border-t border-border-color">
                <tr>
                  <td colSpan={4} className="px-4 py-3 text-right text-sm font-medium">Subtotal</td>
                  <td className="px-4 py-3 text-sm">{order.subtotal}</td>
                </tr>
                <tr>
                  <td colSpan={4} className="px-4 py-3 text-right text-sm font-medium">Tax</td>
                  <td className="px-4 py-3 text-sm">{order.tax}</td>
                </tr>
                <tr>
                  <td colSpan={4} className="px-4 py-3 text-right text-sm font-medium">Total</td>
                  <td className="px-4 py-3 text-sm font-bold text-primary">{order.total}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>

      {/* Notes */}
      {order.notes && (
        <div className="dashboard-card">
          <div className="p-4 border-b border-border-color">
            <h2 className="text-xl font-semibold">Notes</h2>
          </div>
          <div className="p-4">
            <p className="text-text-secondary">{order.notes}</p>
          </div>
        </div>
      )}
    </>
  );
}