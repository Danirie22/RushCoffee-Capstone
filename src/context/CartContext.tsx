
import React, { createContext, useContext, useState, ReactNode, useMemo, useEffect } from 'react';
import { Product, ProductSize } from '../data/mockProducts';

export interface CartItem {
  id: string; // Composite ID: `${product.id}-${selectedSize.name}`
  product: Product;
  selectedSize: ProductSize;
  quantity: number;
}

interface CartContextType {
  cartItems: CartItem[];
  isCartOpen: boolean;
  toastMessage: string | null;
  totalCartItems: number;
  addToCart: (product: Product, selectedSize: ProductSize) => void;
  updateQuantity: (cartItemId: string, newQuantity: number) => void;
  removeFromCart: (cartItemId: string) => void;
  openCart: () => void;
  closeCart: () => void;
  showToast: (message: string) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const showToast = (message: string) => {
    setToastMessage(message);
  };

  const totalCartItems = useMemo(() => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  }, [cartItems]);
  
  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  const addToCart = (product: Product, selectedSize: ProductSize) => {
    const cartItemId = `${product.id}-${selectedSize.name}`;
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === cartItemId);
      if (existingItem) {
        // Increase quantity if item already exists
        return prevItems.map(item =>
          item.id === cartItemId ? { ...item, quantity: Math.min(item.quantity + 1, product.stock) } : item
        );
      }
      return [...prevItems, { id: cartItemId, product, selectedSize, quantity: 1 }];
    });
    showToast(`${product.name} (${selectedSize.name}) added to cart!`);
    openCart();
  };

  const updateQuantity = (cartItemId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      removeFromCart(cartItemId);
      return;
    }
    setCartItems(prevItems =>
      prevItems.map(item => {
        if (item.id === cartItemId) {
           return { ...item, quantity: Math.min(newQuantity, item.product.stock) };
        }
        return item;
      })
    );
  };

  const removeFromCart = (cartItemId: string) => {
    const itemToRemove = cartItems.find(item => item.id === cartItemId);
    setCartItems(prevItems => prevItems.filter(item => item.id !== cartItemId));
    if (itemToRemove) {
      showToast(`${itemToRemove.product.name} (${itemToRemove.selectedSize.name}) removed from cart.`);
    }
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const value = {
    cartItems,
    isCartOpen,
    toastMessage,
    totalCartItems,
    addToCart,
    updateQuantity,
    removeFromCart,
    openCart,
    closeCart,
    showToast,
    clearCart,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
