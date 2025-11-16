
import * as React from 'react';
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

export interface ReorderItem {
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
  addMultipleToCart: (items: ReorderItem[]) => void;
  updateQuantity: (cartItemId: string, newQuantity: number) => void;
  removeFromCart: (cartItemId: string) => void;
  openCart: () => void;
  closeCart: () => void;
  showToast: (message: string) => void;
  clearCart: () => void;
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


  const updateFirestoreCart = React.useCallback(async (newCart: CartItem[]) => {
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

  const totalCartItems = React.useMemo(() => {
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

  const addMultipleToCart = (itemsToAdd: ReorderItem[]) => {
    if (!itemsToAdd || itemsToAdd.length === 0) return;

    let newCart = [...cartItems];
    let itemsAddedCount = 0;
    
    itemsToAdd.forEach(item => {
        const cartItemId = `${item.product.id}-${item.selectedSize.name}`;
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
    updateFirestoreCart([]);
  };

  const value = {
    cartItems,
    isCartOpen,
    toastMessage,
    totalCartItems,
    isCartLoading,
    addToCart,
    addMultipleToCart,
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