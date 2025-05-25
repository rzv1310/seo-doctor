export interface PaymentMethod {
  id: string;
  userId?: string;
  type?: string;
  brand?: string;
  lastFour?: string;
  last4?: string;
  expiryMonth?: number | null;
  expiryYear?: number | null;
  expMonth?: number;
  expYear?: number;
  isDefault?: boolean;
  stripePaymentMethodId?: string | null;
  funding?: string;
  country?: string;
}