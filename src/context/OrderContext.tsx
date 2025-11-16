
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { useAuth } from './AuthContext';

export interface QueueItem {
  id: string; // Firestore document ID
  userId: string;
  customerName: string;
  orderNumber: string;
  position: number;
  status: 'waiting' | 'preparing' | 'ready' | 'completed';
  orderItems: Array<{
    productId: string;
    productName: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  paymentMethod: 'gcash' | 'cash';
  paymentStatus: 'pending' | 'paid';
  timestamp: Date;
  estimatedTime: number; // in minutes
}

interface OrderContextType {
  activeOrder: QueueItem | null;
  setActiveOrder: (order: QueueItem | null) => void;
  orderHistory: QueueItem[];
  addOrderToHistory: (order: Omit<QueueItem, 'id' | 'timestamp'>) => Promise<void>;
  isHistoryLoading: boolean;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const useOrder = () => {
    const context = useContext(OrderContext);
    if (context === undefined) {
        throw new Error('useOrder must be used within an OrderProvider');
    }
    return context;
};

interface OrderProviderProps {
    children: ReactNode;
}

export const OrderProvider: React.FC<OrderProviderProps> = ({ children }) => {
    const [activeOrder, setActiveOrder] = useState<QueueItem | null>(null);
    const [orderHistory, setOrderHistory] = useState<QueueItem[]>([]);
    const [isHistoryLoading, setIsHistoryLoading] = useState(true);
    const { currentUser } = useAuth();

    // Fetch order history for logged-in user
    useEffect(() => {
        if (currentUser) {
            const fetchHistory = async () => {
                setIsHistoryLoading(true);
                try {
                    const ordersRef = collection(db, 'orders');
                    // Removed orderBy from query to avoid needing a composite index
                    const q = query(ordersRef, where('userId', '==', currentUser.uid));
                    const querySnapshot = await getDocs(q);

                    const history = querySnapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data(),
                        timestamp: doc.data().timestamp.toDate(),
                    })) as QueueItem[];
                    
                    // Perform sorting on the client-side
                    history.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
                    
                    setOrderHistory(history);

                    // Check for an incomplete order to set as active
                    const lastIncompleteOrder = history.find(order => order.status !== 'completed');
                    setActiveOrder(lastIncompleteOrder || null);
                } catch (error) {
                    console.error("Error fetching order history:", error);
                } finally {
                    setIsHistoryLoading(false);
                }
            };
            fetchHistory();
        } else {
            // Clear data on logout
            setOrderHistory([]);
            setActiveOrder(null);
            setIsHistoryLoading(false);
        }
    }, [currentUser]);

    // Simulate order status progression for the active order
    useEffect(() => {
        if (activeOrder && activeOrder.status !== 'completed') {
            const sequence: QueueItem['status'][] = ['waiting', 'preparing', 'ready', 'completed'];
            const currentStatus = activeOrder.status;
            const currentIndex = sequence.indexOf(currentStatus);

            if (currentIndex === -1 || currentIndex >= sequence.length - 1) return;

            const timer = setTimeout(() => {
                const nextStatus = sequence[currentIndex + 1];
                setActiveOrder(prev => prev ? { ...prev, status: nextStatus } : null);
            }, 10000);

            return () => clearTimeout(timer);
        }
    }, [activeOrder]);

    const addOrderToHistory = async (orderData: Omit<QueueItem, 'id' | 'timestamp'>) => {
        try {
            const docRef = await addDoc(collection(db, 'orders'), {
                ...orderData,
                timestamp: serverTimestamp(),
            });

            // Optimistically update local state
            const newOrder: QueueItem = {
                ...orderData,
                id: docRef.id,
                timestamp: new Date(),
            };
            setOrderHistory(prevHistory => [newOrder, ...prevHistory]);
            setActiveOrder(newOrder);

        } catch (error) {
            console.error("Error adding order to Firestore:", error);
        }
    };

    const value = { activeOrder, setActiveOrder, orderHistory, addOrderToHistory, isHistoryLoading };

    return (
        <OrderContext.Provider value={value}>
            {children}
        </OrderContext.Provider>
    );
};
