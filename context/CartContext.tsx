'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define the Service type (similar to what's in services page)
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
};

// Create the context with default values
const CartContext = createContext<CartContextType>({
  items: [],
  addItem: () => {},
  removeItem: () => {},
  clearCart: () => {},
  isInCart: () => false,
  itemCount: 0,
  totalPrice: 0,
  formattedTotalPrice: '$0.00',
});

// Custom hook to use the cart context
export const useCart = () => useContext(CartContext);

// CartProvider component
export function CartProvider({ children }: { children: ReactNode }) {
  // Initialize cart from localStorage if available
  const [items, setItems] = useState<CartService[]>([]);
  const [initialized, setInitialized] = useState(false);

  // Load cart from localStorage on component mount
  useEffect(() => {
    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
      try {
        setItems(JSON.parse(storedCart));
      } catch (error) {
        console.error('Failed to parse cart from localStorage:', error);
      }
    }
    setInitialized(true);
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (initialized) {
      localStorage.setItem('cart', JSON.stringify(items));
    }
  }, [items, initialized]);

  // Add an item to the cart
  const addItem = (service: CartService) => {
    // Check if service already exists in cart
    if (!isInCart(service.id)) {
      setItems([...items, service]);
    }
  };

  // Remove an item from the cart
  const removeItem = (serviceId: number) => {
    setItems(items.filter(item => item.id !== serviceId));
  };

  // Clear the entire cart
  const clearCart = () => {
    setItems([]);
  };

  // Check if a service is already in the cart
  const isInCart = (serviceId: number) => {
    return items.some(item => item.id === serviceId);
  };

  // Calculate the total number of items
  const itemCount = items.length;

  // Calculate the total price in cents
  const totalPrice = items.reduce((sum, item) => {
    // Extract the numeric value from price strings like "$99.99"
    const priceValue = item.priceValue;
    return sum + priceValue;
  }, 0);

  // Format the total price as a string
  const formattedTotalPrice = `$${(totalPrice / 100).toFixed(2)}`;

  // Provide the cart context value
  const contextValue: CartContextType = {
    items,
    addItem,
    removeItem,
    clearCart,
    isInCart,
    itemCount,
    totalPrice,
    formattedTotalPrice,
  };

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
}