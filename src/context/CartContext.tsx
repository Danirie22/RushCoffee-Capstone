import React, { createContext, useContext, useState, ReactNode, useMemo, useEffect, useCallback } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { Product, ProductSize } from '../data/mockProducts';
import { useAuth } from './AuthContext';
import { useProduct } from './ProductContext';

export interface CartItem {
  id: string; // Composite ID: `${product.id}-${selectedSize.name}`
  product: Product;
  selectedSize: ProductSize;
  quantity: number;
}

// Simplified structure for Firestore
interface FirestoreCartItem {
  productId: string;
  sizeName: string;
  quantity: number;
}

interface CartContextType {
  cartItems: CartItem[];
  isCartOpen: boolean;
  toastMessage: string | null;
  totalCartItems: number;
  isCartLoading: boolean;
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
  const [isCartLoading, setIsCartLoading] = useState(true);

  const { currentUser } = useAuth();
  const { products, isLoading: productsLoading } = useProduct();

  // Toast message handler
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const showToast = useCallback((message: string) => {
    setToastMessage(message);
  }, []);

  // Fetch cart from Firestore on user login
  useEffect(() => {
    const fetchAndHydrateCart = async () => {
      if (!currentUser || productsLoading) return;

      setIsCartLoading(true);
      try {
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const firestoreCart = userDoc.data()?.cart as FirestoreCartItem[] || [];
          
          const hydratedCart = firestoreCart.map(item => {
            const product = products.find(p => p.id === item.productId);
            if (!product) return null;
            const selectedSize = product.sizes.find(s => s.name === item.sizeName);
            if (!selectedSize) return null;
            
            return {
              id: `${product.id}-${selectedSize.name}`,
              product,
              selectedSize,
              quantity: item.quantity
            };
          }).filter((item): item is CartItem => item !== null);
          
          setCartItems(hydratedCart);
        }
      } catch (error) {
        console.error("Error fetching cart from Firestore:", error);
        showToast("Couldn't load your cart.");
      } finally {
        setIsCartLoading(false);
      }
    };
    
    if (currentUser) {
        fetchAndHydrateCart();
    } else {
        // Clear cart on logout
        setCartItems([]);
        setIsCartLoading(false);
    }
}, [currentUser, products, productsLoading, showToast]);


  const updateFirestoreCart = useCallback(async (newCart: CartItem[]) => {
    if (!currentUser) return;
    try {
      const userDocRef = doc(db, 'users', currentUser.uid);
      const firestoreCart: FirestoreCartItem[] = newCart.map(item => ({
        productId: item.product.id,
        sizeName: item.selectedSize.name,
        quantity: item.quantity,
      }));
      await updateDoc(userDocRef, { cart: firestoreCart });
    } catch (error) {
      console.error("Error updating Firestore cart:", error);
      showToast("Error saving your cart.");
    }
  }, [currentUser, showToast]);

  const totalCartItems = useMemo(() => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  }, [cartItems]);
  
  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  const addToCart = (product: Product, selectedSize: ProductSize) => {
    const cartItemId = `${product.id}-${selectedSize.name}`;
    let newCart;
    const existingItem = cartItems.find(item => item.id === cartItemId);
    
    if (existingItem) {
      newCart = cartItems.map(item =>
        item.id === cartItemId ? { ...item, quantity: Math.min(item.quantity + 1, product.stock) } : item
      );
    } else {
      newCart = [...cartItems, { id: cartItemId, product, selectedSize, quantity: 1 }];
    }
    
    setCartItems(newCart);
    updateFirestoreCart(newCart);
    showToast(`${product.name} (${selectedSize.name}) added to cart!`);
    openCart();
  };

  const updateQuantity = (cartItemId: string, newQuantity: number) => {
     let newCart;
    if (newQuantity < 1) {
      newCart = cartItems.filter(item => item.id !== cartItemId);
    } else {
      newCart = cartItems.map(item => {
        if (item.id === cartItemId) {
           return { ...item, quantity: Math.min(newQuantity, item.product.stock) };
        }
        return item;
      });
    }
    setCartItems(newCart);
    updateFirestoreCart(newCart);
  };

  const removeFromCart = (cartItemId: string) => {
    const itemToRemove = cartItems.find(item => item.id === cartItemId);
    const newCart = cartItems.filter(item => item.id !== cartItemId);
    setCartItems(newCart);
    updateFirestoreCart(newCart);
    if (itemToRemove) {
      showToast(`${itemToRemove.product.name} (${itemToRemove.selectedSize.name}) removed from cart.`);
    }
  };

  const clearCart = () => {
    setCartItems([]);
    updateFirestoreCart([]);
  };

  const value = {
    cartItems,
    isCartOpen,
    toastMessage,
    totalCartItems,
    isCartLoading,
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
