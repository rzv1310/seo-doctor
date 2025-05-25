export interface Order {
  id: string;
  userId: string;
  serviceId?: string;
  subscriptionId?: string | null;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  createdAt: string;
  updatedAt?: string | null;
  amount: number;
  currency?: string;
  stripePaymentId?: string | null;
  serviceName?: string;
  serviceType?: string;
}