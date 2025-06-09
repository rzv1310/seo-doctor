'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useLogger } from '@/lib/client-logger';
import { convertRONBaniToEURCents } from '@/lib/currency-utils';
import { services } from '@/data/services';
import type { CartService, CouponData, CartContextType } from '@/types/cart';

// Create the context with default values
const CartContext = createContext<CartContextType>({
    items: [],
    addItem: () => { },
    removeItem: () => { },
    clearCart: () => { },
    isInCart: () => false,
    itemCount: 0,
    totalPrice: 0,
    formattedTotalPrice: '0,00 €',
    couponCode: '',
    setCouponCode: () => { },
    couponData: null,
    setCouponData: () => { },
    discountAmount: 0,
    formattedDiscountAmount: '0,00 €',
    finalPrice: 0,
    formattedFinalPrice: '0,00 €',
});

// Custom hook to use the cart context
export const useCart = () => useContext(CartContext);

export function CartProvider({ children }: { children: ReactNode }) {
    const logger = useLogger('CartProvider');
    const [items, setItems] = useState<CartService[]>([]);
    const [couponCode, setCouponCode] = useState('');
    const [couponData, setCouponData] = useState<CouponData | null>(null);
    const [initialized, setInitialized] = useState(false);

    const loadPendingPaymentItems = async (currentItems: CartService[]) => {
        try {
            logger.info('Loading pending payment items for checkout');
            
            const response = await fetch('/api/subscriptions/pending-payments');
            if (!response.ok) {
                logger.error('Failed to fetch pending payments', new Error(`HTTP ${response.status}`));
                return;
            }
            
            const data = await response.json();
            const pendingPayments = data.pendingPayments || [];
            
            logger.info('Found pending payments', { count: pendingPayments.length });
            
            // Add each pending payment service to cart if not already present
            const newItems: CartService[] = [];
            for (const payment of pendingPayments) {
                const serviceId = parseInt(payment.serviceId);
                const service = services.find(s => s.id === serviceId);
                
                if (service && !currentItems.some(item => item.id === serviceId)) {
                    const cartService: CartService = {
                        id: service.id,
                        name: service.name,
                        description: service.description,
                        price: service.price,
                        priceValue: service.priceValue,
                        priceValueEUR: service.priceValueEUR,
                        features: service.features,
                        isPendingPayment: true, // Mark as pending payment item
                        pendingSubscriptionId: payment.id
                    };
                    
                    newItems.push(cartService);
                    logger.info('Adding pending payment item to cart', { 
                        serviceId, 
                        serviceName: service.name,
                        pendingSubscriptionId: payment.id 
                    });
                }
            }

            if (newItems.length > 0) {
                setItems(prev => [...prev, ...newItems]);
                logger.info('Added pending payment items to cart', { count: newItems.length });
            }
        } catch (error) {
            logger.error('Failed to load pending payment items', error as Error);
        }
    };

    useEffect(() => {
        let initialItems: CartService[] = [];

        const storedCart = localStorage.getItem('cart');
        if (storedCart) {
            try {
                const parsedCart = JSON.parse(storedCart);
                initialItems = parsedCart;
                setItems(parsedCart);
                logger.info('Cart loaded from localStorage', { itemCount: parsedCart.length });
            } catch (error) {
                logger.error('Failed to parse cart from localStorage', error as Error);
            }
        }

        // Check for stored coupon code and pending payments on checkout page only
        if (window.location.pathname === '/dashboard/checkout') {
            try {
                const storedCouponCode = localStorage.getItem('couponCode');
                if (storedCouponCode) {
                    setCouponCode(storedCouponCode);
                    logger.info('Restored coupon code for checkout', { couponCode: storedCouponCode });
                }
            } catch (error) {
                logger.error('Failed to restore coupon from localStorage', error as Error);
            }

            // Add pending payment items to cart
            loadPendingPaymentItems(initialItems);
        }

        setInitialized(true);
    }, []);

    useEffect(() => {
        if (initialized) {
            localStorage.setItem('cart', JSON.stringify(items));
            logger.info('Cart saved to localStorage', { itemCount: items.length });
        }
    }, [items, initialized]);

    useEffect(() => {
        if (initialized) {
            if (couponCode) {
                // Store coupon code for checkout persistence
                try {
                    localStorage.setItem('couponCode', couponCode);
                    logger.info('Coupon code stored in localStorage', { couponCode });
                } catch (error) {
                    logger.error('Failed to store coupon in localStorage', error as Error);
                }
            } else {
                // Clear coupon data when no code is set
                setCouponData(null);
                try {
                    localStorage.removeItem('couponCode');
                    logger.info('Coupon code cleared from localStorage');
                } catch (error) {
                    logger.error('Failed to clear coupon from localStorage', error as Error);
                }
            }
        }
    }, [couponCode, initialized]);

    const addItem = (service: CartService) => {
        if (!isInCart(service.id)) {
            setItems([...items, service]);
            logger.interaction('item_added_to_cart', {
                serviceId: service.id,
                serviceName: service.name,
                price: service.price
            });
        } else {
            logger.warn('Attempted to add duplicate item to cart', { serviceId: service.id });
        }
    };

    const removeItem = (serviceId: number) => {
        const itemToRemove = items.find(item => item.id === serviceId);
        setItems(items.filter(item => item.id !== serviceId));
        logger.interaction('item_removed_from_cart', {
            serviceId,
            serviceName: itemToRemove?.name
        });
    };

    const clearCart = () => {
        const previousItemCount = items.length;
        setItems([]);
        logger.interaction('cart_cleared', { previousItemCount });
    };

    const isInCart = (serviceId: number) => {
        return items.some(item => item.id === serviceId);
    };

    const itemCount = items.length;

    const totalPrice = items.reduce((sum, item) => {
        // Fallback to convert priceValue if priceValueEUR is missing (for existing cart items)
        const priceValue = item.priceValueEUR || convertRONBaniToEURCents(item.priceValue || 0);
        return sum + (priceValue || 0);
    }, 0);

    const formattedTotalPrice = new Intl.NumberFormat('ro-RO', {
        style: 'currency',
        currency: 'EUR',
    }).format(totalPrice / 100);

    const calculateDiscount = (price: number, data: CouponData | null): number => {
        if (!data || !data.valid) return 0;

        if (data.percentOff) {
            return Math.round((price * data.percentOff) / 100);
        } else if (data.amountOff) {
            // amountOff is in RON bani from Stripe, convert to EUR cents for display
            const discountInEURCents = convertRONBaniToEURCents(data.amountOff);
            return Math.min(discountInEURCents, price);
        }

        return 0;
    };

    const discountAmount = calculateDiscount(totalPrice, couponData);
    const formattedDiscountAmount = new Intl.NumberFormat('ro-RO', {
        style: 'currency',
        currency: 'EUR',
    }).format(discountAmount / 100);

    const finalPrice = totalPrice - discountAmount;
    const formattedFinalPrice = new Intl.NumberFormat('ro-RO', {
        style: 'currency',
        currency: 'EUR',
    }).format(finalPrice / 100);

    const contextValue: CartContextType = {
        items,
        addItem,
        removeItem,
        clearCart,
        isInCart,
        itemCount,
        totalPrice,
        formattedTotalPrice,
        couponCode,
        setCouponCode,
        couponData,
        setCouponData,
        discountAmount,
        formattedDiscountAmount,
        finalPrice,
        formattedFinalPrice,
    };

    return (
        <CartContext.Provider value={contextValue}>
            {children}
        </CartContext.Provider>
    );
}
