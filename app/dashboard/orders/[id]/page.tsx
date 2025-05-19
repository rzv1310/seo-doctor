'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useOrder } from '@/hooks/useOrders';

export default function OrderDetailsPage() {
  const params = useParams();
  const orderId = params.id as string;
  const { user } = useAuth();
  const { order, loading, error } = useOrder(orderId);

  // Format price as currency
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (error || !order) {
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

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Finalizată';
      case 'pending':
        return 'În așteptare';
      case 'cancelled':
        return 'Anulată';
      default:
        return 'Necunoscut';
    }
  };

  return (
    <>
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-2">Comandă {order.id}</h1>
          <p className="text-text-secondary">Plasată pe {formatDate(order.createdAt)}</p>
        </div>
        <div className="flex gap-3 mt-4 md:mt-0">
          <Link
            href="/dashboard/orders"
            className="bg-dark-blue-lighter hover:bg-primary/20 text-white px-4 py-2 rounded-md transition-colors text-sm"
          >
            Înapoi la Comenzi
          </Link>
        </div>
      </div>

      {/* Order Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="dashboard-card p-4">
          <h3 className="text-lg font-semibold mb-3">Status Comandă</h3>
          <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(order.status)}`}>
            {getStatusText(order.status)}
          </span>
        </div>
        <div className="dashboard-card p-4">
          <h3 className="text-lg font-semibold mb-3">Plată</h3>
          <div className="text-2xl font-bold text-primary">{formatPrice(order.price)}</div>
        </div>
        <div className="dashboard-card p-4">
          <h3 className="text-lg font-semibold mb-3">Client</h3>
          <div className="font-medium">{user?.name || 'N/A'}</div>
          <div className="text-text-secondary text-sm">{user?.email || 'N/A'}</div>
        </div>
      </div>

      {/* Order Items */}
      <div className="dashboard-card mb-6">
        <div className="p-4 border-b border-border-color">
          <h2 className="text-xl font-semibold">Detalii Comandă</h2>
        </div>
        <div className="p-4">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border-color">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Serviciu</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Cantitate</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Preț</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-color">
                <tr>
                  <td className="px-4 py-4 whitespace-nowrap text-sm">{order.serviceName}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm">1</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm">{formatPrice(order.price)}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm">{formatPrice(order.price)}</td>
                </tr>
              </tbody>
              <tfoot className="border-t border-border-color">
                <tr>
                  <td colSpan={3} className="px-4 py-3 text-right text-sm font-medium">Subtotal</td>
                  <td className="px-4 py-3 text-sm">{formatPrice(order.price)}</td>
                </tr>
                <tr>
                  <td colSpan={3} className="px-4 py-3 text-right text-sm font-medium">Taxă</td>
                  <td className="px-4 py-3 text-sm">{formatPrice(0)}</td>
                </tr>
                <tr>
                  <td colSpan={3} className="px-4 py-3 text-right text-sm font-medium">Total</td>
                  <td className="px-4 py-3 text-sm font-bold text-primary">{formatPrice(order.price)}</td>
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
            <h2 className="text-xl font-semibold">Note</h2>
          </div>
          <div className="p-4">
            <p className="text-text-secondary">{order.notes}</p>
          </div>
        </div>
      )}
    </>
  );
}