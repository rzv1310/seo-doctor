'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useCart } from '../context/CartContext';

type CartProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function Cart({ isOpen, onClose }: CartProps) {
  const { 
    items, 
    removeItem, 
    clearCart, 
    formattedTotalPrice, 
    couponCode, 
    setCouponCode, 
    formattedDiscountAmount,
    formattedFinalPrice
  } = useCart();
  
  const [inputCoupon, setInputCoupon] = useState(couponCode);
  
  const handleApplyCoupon = () => {
    setCouponCode(inputCoupon);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/70 transition-opacity"
        onClick={onClose}
      />

      {/* Cart panel */}
      <div className="relative w-full max-w-md bg-dark-blue overflow-auto flex flex-col h-full border-l border-border-color shadow-xl transform transition-transform">
        {/* Header */}
        <div className="p-4 border-b border-border-color flex justify-between items-center">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Coș
          </h2>
          <button 
            onClick={onClose}
            className="rounded-md p-1 hover:bg-dark-blue-lighter"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Cart body */}
        <div className="flex-1 overflow-auto">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-6 text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-text-secondary mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <h3 className="text-lg font-medium mb-2">Coșul tău este gol</h3>
              <p className="text-text-secondary mb-6">Adaugă servicii în coș pentru a continua.</p>
              <button
                onClick={onClose}
                className="bg-primary hover:bg-primary-dark text-white px-6 py-2 rounded-md transition-colors"
              >
                Continuă Cumpărăturile
              </button>
            </div>
          ) : (
            <div className="p-4 space-y-4">
              {items.map((item) => (
                <div 
                  key={item.id} 
                  className="p-3 border border-border-color rounded-lg flex justify-between items-start"
                >
                  <div>
                    <h3 className="font-medium">{item.name}</h3>
                    <p className="text-text-secondary text-sm mt-1">{item.description}</p>
                  </div>
                  <div className="text-right flex flex-col items-end gap-2">
                    <div className="font-bold">{item.price}<span className="text-xs text-text-secondary">/mo</span></div>
                    <button 
                      onClick={() => removeItem(item.id)}
                      className="text-xs text-danger hover:text-red-400 transition-colors flex items-center gap-1"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Elimină
                    </button>
                  </div>
                </div>
              ))}
              
              {items.length > 0 && (
                <div className="text-right mt-4">
                  <button 
                    onClick={clearCart}
                    className="text-xs text-text-secondary hover:text-text-primary transition-colors"
                  >
                    Golește Coșul
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Footer with checkout */}
        {items.length > 0 && (
          <div className="p-4 border-t border-border-color bg-dark-blue-lighter">
            {/* Coupon Code Input */}
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-1">
                <input
                  type="text"
                  value={inputCoupon}
                  onChange={(e) => setInputCoupon(e.target.value)}
                  placeholder="Cod promoțional"
                  className="flex-1 px-3 py-2 rounded bg-dark-blue border border-border-color focus:border-primary focus:outline-none text-sm"
                />
                <button 
                  onClick={handleApplyCoupon}
                  className="px-3 py-2 bg-secondary hover:bg-secondary-dark text-white rounded text-sm transition-colors"
                >
                  Aplică
                </button>
              </div>
              {couponCode && (
                <div className="text-xs text-green-500 flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Cod promoțional aplicat: {couponCode}
                </div>
              )}
            </div>
            
            {/* Price Summary */}
            <div className="space-y-2 mb-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-text-secondary">Subtotal:</span>
                <span>{formattedTotalPrice}</span>
              </div>
              
              {couponCode && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-text-secondary">Discount:</span>
                  <span className="text-green-500">-{formattedDiscountAmount}</span>
                </div>
              )}
              
              <div className="flex justify-between items-center">
                <span className="text-text-secondary">Total:</span>
                <span className="text-lg font-bold text-primary">{couponCode ? formattedFinalPrice : formattedTotalPrice}</span>
              </div>
            </div>
            
            <Link
              href="/dashboard/checkout"
              className="block w-full bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-md transition-colors text-center font-medium"
              onClick={onClose}
            >
              Finalizează Comanda
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}