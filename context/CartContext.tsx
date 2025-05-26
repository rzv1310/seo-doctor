'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useLogger } from '@/lib/client-logger';



export type CartService = {
    id: number;
    name: string;
    description: string;
    price: string; // Price in display format "$XX.XX"
    priceValue: number; // Price in cents for calculations
    features: string[];
};

// Define the Cart context type
type CartContextType = {
    items: CartService[];
    addItem: (service: CartService) => void;
    removeItem: (serviceId: number) => void;
    clearCart: () => void;
    isInCart: (serviceId: number) => boolean;
    itemCount: number;
    totalPrice: number;
    formattedTotalPrice: string;
    couponCode: string;
    setCouponCode: (code: string) => void;
    discountAmount: number;
    formattedDiscountAmount: string;
    finalPrice: number;
    formattedFinalPrice: string;
};

// Create the context with default values
const CartContext = createContext<CartContextType>({
    items: [],
    addItem: () => { },
    removeItem: () => { },
    clearCart: () => { },
    isInCart: () => false,
    itemCount: 0,
    totalPrice: 0,
    formattedTotalPrice: '$0.00',
    couponCode: '',
    setCouponCode: () => { },
    discountAmount: 0,
    formattedDiscountAmount: '$0.00',
    finalPrice: 0,
    formattedFinalPrice: '$0.00',
});

// Custom hook to use the cart context
export const useCart = () => useContext(CartContext);

export function CartProvider({ children }: { children: ReactNode }) {
    const logger = useLogger('CartProvider');
    const [items, setItems] = useState<CartService[]>([]);
    const [couponCode, setCouponCode] = useState('');
    const [initialized, setInitialized] = useState(false);

    useEffect(() => {
        const storedCart = localStorage.getItem('cart');
        const storedCoupon = localStorage.getItem('couponCode');

        if (storedCart) {
            try {
                const parsedCart = JSON.parse(storedCart);
                setItems(parsedCart);
                logger.info('Cart loaded from localStorage', { itemCount: parsedCart.length });
            } catch (error) {
                logger.error('Failed to parse cart from localStorage', error as Error);
            }
        }

        if (storedCoupon) {
            setCouponCode(storedCoupon);
            logger.info('Coupon loaded from localStorage', { couponCode: storedCoupon });
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
        if (initialized && couponCode) {
            localStorage.setItem('couponCode', couponCode);
            logger.info('Coupon saved to localStorage', { couponCode });
        } else if (initialized) {
            localStorage.removeItem('couponCode');
            logger.info('Coupon removed from localStorage');
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
        const priceValue = item.priceValue;
        return sum + priceValue;
    }, 0);

    const formattedTotalPrice = `$${(totalPrice / 100).toFixed(2)}`;

    const applyCouponDiscount = (price: number, code: string): number => {
        if (!code) return 0;

        return Math.round(price * 0.1);
    };

    const discountAmount = applyCouponDiscount(totalPrice, couponCode);
    const formattedDiscountAmount = `$${(discountAmount / 100).toFixed(2)}`;

    const finalPrice = totalPrice - discountAmount;
    const formattedFinalPrice = `$${(finalPrice / 100).toFixed(2)}`;

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
