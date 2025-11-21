
import * as React from 'react';
import { db } from '../firebaseConfig';
import { Product, ProductSize } from '../data/mockProducts';
import { useAuth } from './AuthContext';
import { useProduct } from './ProductContext';

export interface Customizations {
  sugarLevel?: string;
  iceLevel?: string;
  toppings?: string[];
}

export interface CartItem {
  id: string; // Composite ID: `${product.id}-${selectedSize.name}-${customizationString}`
  product: Product;
  selectedSize: ProductSize;
  quantity: number;
  customizations?: Customizations;
}

export interface ReorderItem {
  product: Product;
  selectedSize: ProductSize;
  quantity: number;
  customizations?: Customizations;
}

// Simplified structure for Firestore
interface FirestoreCartItem {
  productId: string;
  sizeName: string;
  quantity: number;
  customizations?: Customizations;
}

interface CartContextType {
  cartItems: CartItem[];
  isCartOpen: boolean;
  toastMessage: string | null;
  totalCartItems: number;
  isCartLoading: boolean;
  selectedItemIds: string[];
  addToCart: (product: Product, selectedSize: ProductSize, customizations?: Customizations, quantity?: number) => void;
  addMultipleToCart: (items: ReorderItem[]) => void;
  updateQuantity: (cartItemId: string, newQuantity: number) => void;
  removeFromCart: (cartItemId: string) => void;
  openCart: () => void;
  closeCart: () => void;
  showToast: (message: string) => void;
  clearCart: () => void;
  toggleItemSelection: (cartItemId: string) => void;
  selectAllItems: () => void;
  deselectAllItems: () => void;
}

const CartContext = React.createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = React.useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: React.ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [cartItems, setCartItems] = React.useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = React.useState(false);
  const [toastMessage, setToastMessage] = React.useState<string | null>(null);
  const [isCartLoading, setIsCartLoading] = React.useState(true);
  const [selectedItemIds, setSelectedItemIds] = React.useState<string[]>([]);

  const { currentUser } = useAuth();
  const { products, isLoading: productsLoading } = useProduct();

  // Toast message handler
  React.useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 4000); // Increased duration for longer messages
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const showToast = React.useCallback((message: string) => {
    setToastMessage(message);
  }, []);

  // Fetch cart from Firestore on user login
  React.useEffect(() => {
    const fetchAndHydrateCart = async () => {
      if (!currentUser || productsLoading) return;

      setIsCartLoading(true);
      try {
        const userDocRef = db.collection('users').doc(currentUser.uid);
        const userDoc = await userDocRef.get();
        if (userDoc.exists) {
          const firestoreCart = userDoc.data()?.cart as FirestoreCartItem[] || [];

          const hydratedCart = firestoreCart.map(item => {
            const product = products.find(p => p.id === item.productId);
            if (!product) return null;
            const selectedSize = product.sizes.find(s => s.name === item.sizeName);
            if (!selectedSize) return null;

            // Generate ID consistent with addToCart logic
            const customizationString = item.customizations ? JSON.stringify(item.customizations) : '';
            const id = `${product.id}-${selectedSize.name}-${customizationString}`;

            return {
              id,
              product,
              selectedSize,
              quantity: item.quantity,
              customizations: item.customizations
            };
          }).filter((item) => item !== null) as CartItem[];

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


  const updateFirestoreCart = React.useCallback(async (newCart: CartItem[]) => {
    if (!currentUser) return;
    try {
      const userDocRef = db.collection('users').doc(currentUser.uid);
      const firestoreCart: FirestoreCartItem[] = newCart.map(item => {
        // Clean customizations to remove undefined values (Firestore doesn't accept them)
        const cleanCustomizations: Partial<Customizations> = {};
        if (item.customizations) {
          if (item.customizations.sugarLevel !== undefined) {
            cleanCustomizations.sugarLevel = item.customizations.sugarLevel;
          }
          if (item.customizations.iceLevel !== undefined) {
            cleanCustomizations.iceLevel = item.customizations.iceLevel;
          }
          if (item.customizations.toppings !== undefined) {
            cleanCustomizations.toppings = item.customizations.toppings;
          }
        }

        return {
          productId: item.product.id,
          sizeName: item.selectedSize.name,
          quantity: item.quantity,
          ...(Object.keys(cleanCustomizations).length > 0 && { customizations: cleanCustomizations as Customizations })
        };
      });
      await userDocRef.set({ cart: firestoreCart }, { merge: true });
    } catch (error) {
      console.error("Error updating Firestore cart:", error);
      showToast("Error saving your cart.");
    }
  }, [currentUser, showToast]);

  const totalCartItems = React.useMemo(() => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  }, [cartItems]);

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  const addToCart = (product: Product, selectedSize: ProductSize, customizations?: Customizations, quantity: number = 1) => {
    const customizationString = customizations ? JSON.stringify(customizations) : '';
    const cartItemId = `${product.id}-${selectedSize.name}-${customizationString}`;

    let newCart;
    const existingItem = cartItems.find(item => item.id === cartItemId);

    if (existingItem) {
      newCart = cartItems.map(item =>
        item.id === cartItemId ? { ...item, quantity: Math.min(item.quantity + quantity, product.stock) } : item
      );
    } else {
      newCart = [...cartItems, { id: cartItemId, product, selectedSize, quantity: Math.min(quantity, product.stock), customizations }];
    }

    setCartItems(newCart);
    updateFirestoreCart(newCart);
    showToast(`${product.name} (${selectedSize.name}) added to cart!`);
    openCart();
  };

  const addMultipleToCart = (itemsToAdd: ReorderItem[]) => {
    if (!itemsToAdd || itemsToAdd.length === 0) return;

    let newCart = [...cartItems];
    let itemsAddedCount = 0;

    itemsToAdd.forEach(item => {
      const customizationString = item.customizations ? JSON.stringify(item.customizations) : '';
      const cartItemId = `${item.product.id}-${item.selectedSize.name}-${customizationString}`;
      const existingItemIndex = newCart.findIndex(cartItem => cartItem.id === cartItemId);

      if (existingItemIndex > -1) {
        const existingItem = newCart[existingItemIndex];
        const newQuantity = existingItem.quantity + item.quantity;
        newCart[existingItemIndex] = {
          ...existingItem,
          quantity: Math.min(newQuantity, item.product.stock),
        };
      } else {
        newCart.push({
          id: cartItemId,
          product: item.product,
          selectedSize: item.selectedSize,
          quantity: Math.min(item.quantity, item.product.stock),
          customizations: item.customizations
        });
      }
      itemsAddedCount += item.quantity;
    });

    setCartItems(newCart);
    updateFirestoreCart(newCart);
    showToast(`${itemsAddedCount} item(s) added to your cart!`);
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
    setSelectedItemIds([]);
    updateFirestoreCart([]);
  };

  const toggleItemSelection = (cartItemId: string) => {
    setSelectedItemIds(prev =>
      prev.includes(cartItemId)
        ? prev.filter(id => id !== cartItemId)
        : [...prev, cartItemId]
    );
  };

  const selectAllItems = () => {
    setSelectedItemIds(cartItems.map(item => item.id));
  };

  const deselectAllItems = () => {
    setSelectedItemIds([]);
  };

  // Auto-select newly added items
  React.useEffect(() => {
    const newItemIds = cartItems.map(item => item.id);
    setSelectedItemIds(prev => {
      // Keep only IDs that still exist in cart, and add new ones
      const validIds = prev.filter(id => newItemIds.includes(id));
      const addedIds = newItemIds.filter(id => !prev.includes(id));
      return [...validIds, ...addedIds];
    });
  }, [cartItems]);

  const value = {
    cartItems,
    isCartOpen,
    toastMessage,
    totalCartItems,
    isCartLoading,
    selectedItemIds,
    addToCart,
    addMultipleToCart,
    updateQuantity,
    removeFromCart,
    openCart,
    closeCart,
    showToast,
    toggleItemSelection,
    selectAllItems,
    deselectAllItems,
    clearCart,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
