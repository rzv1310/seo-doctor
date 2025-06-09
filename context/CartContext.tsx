'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useLogger } from '@/lib/client-logger';
import { convertRONBaniToEURCents } from '@/lib/currency-utils';
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

    useEffect(() => {
        const storedCart = localStorage.getItem('cart');

        if (storedCart) {
            try {
                const parsedCart = JSON.parse(storedCart);
                setItems(parsedCart);
                logger.info('Cart loaded from localStorage', { itemCount: parsedCart.length });
            } catch (error) {
                logger.error('Failed to parse cart from localStorage', error as Error);
            }
        }

        // Clear any stored coupon codes to prevent automatic application
        try {
            localStorage.removeItem('couponCode');
            logger.info('Cleared stored coupon code from localStorage');
        } catch (error) {
            logger.error('Failed to clear coupon from localStorage', error as Error);
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
        // Don't persist coupon codes in localStorage
        // Coupons should be explicitly entered by users each time
        if (initialized && !couponCode) {
            setCouponData(null);
            logger.info('Coupon data cleared');
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
