'use client';

import { useState } from 'react';
import { ActionButton } from '@/components/ui';
import type { CartService } from '@/context/CartContext';

interface OrderSummaryProps {
  items: CartService[];
  totalPrice: number;
  formattedTotalPrice: string;
  couponCode: string;
  onCouponApply: (code: string) => void;
  discountAmount: number;
  formattedDiscountAmount: string;
  finalPrice: number;
  formattedFinalPrice: string;
}

export default function OrderSummary({
  items,
  totalPrice,
  formattedTotalPrice,
  couponCode,
  onCouponApply,
  discountAmount,
  formattedDiscountAmount,
  finalPrice,
  formattedFinalPrice
}: OrderSummaryProps) {
  const [inputCoupon, setInputCoupon] = useState(couponCode);

  const handleApplyCoupon = () => {
    onCouponApply(inputCoupon);
  };

  return (
    <div className="dashboard-card">
      <div className="p-4 border-b border-border-color">
        <h2 className="text-xl font-semibold">Rezumat Comandă</h2>
      </div>
      <div className="p-4">
        <div className="space-y-3 mb-4">
          {items.map((item) => (
            <div key={item.id} className="flex justify-between">
              <div>
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-text-primary">{item.description}</p>
              </div>
              <p className="font-medium">{item.price}</p>
            </div>
          ))}
        </div>

        {/* Coupon Code */}
        <div className="mb-4 pb-4 border-b border-border-color">
          <label htmlFor="coupon" className="block text-sm text-text-primary mb-2">
            Cod Promoțional
          </label>
          <div className="flex gap-2">
            <input
              id="coupon"
              type="text"
              value={inputCoupon}
              onChange={(e) => setInputCoupon(e.target.value)}
              placeholder="Introdu codul"
              className="flex-1 bg-dark-blue-lighter/50 border border-border-color rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-200"
            />
            <ActionButton
              onClick={handleApplyCoupon}
              size="sm"
              showArrow={false}
              fullRounded={false}
              disabled={!inputCoupon || inputCoupon === couponCode}
            >
              Aplică
            </ActionButton>
          </div>
          {couponCode && (
            <p className="text-sm text-success mt-2">
              Cod aplicat: {couponCode}
            </p>
          )}
        </div>

        {/* Totals */}
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-text-primary">Subtotal</span>
            <span>{formattedTotalPrice}</span>
          </div>
          {discountAmount > 0 && (
            <div className="flex justify-between text-success">
              <span>Reducere</span>
              <span>-{formattedDiscountAmount}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-lg pt-2 border-t border-border-color">
            <span>Total</span>
            <span className="text-sky-400">{formattedFinalPrice}</span>
          </div>
        </div>
      </div>
    </div>
  );
}