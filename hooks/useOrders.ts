import { useEffect, useState } from 'react';



export interface Order {
    id: string;
    serviceId: string;
    serviceName: string;
    createdAt: string;
    price: number;
    status: 'pending' | 'completed' | 'cancelled';
    notes?: string;
}

export function useOrders() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                setLoading(true);
                const response = await fetch('/api/orders');

                if (!response.ok) {
                    throw new Error('Failed to fetch orders');
                }

                const data = await response.json();
                setOrders(data.orders);
                setError(null);
            } catch (err) {
                console.error('Error fetching orders:', err);
                setError('Failed to load orders. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    return { orders, loading, error };
}

export function useOrder(orderId: string) {
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchOrder = async () => {
            if (!orderId) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const response = await fetch(`/api/orders/${orderId}`);

                if (!response.ok) {
                    throw new Error('Failed to fetch order');
                }

                const data = await response.json();
                setOrder(data.order);
                setError(null);
            } catch (err) {
                console.error(`Error fetching order ${orderId}:`, err);
                setError('Failed to load order details. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();
    }, [orderId]);

    return { order, loading, error };
}
