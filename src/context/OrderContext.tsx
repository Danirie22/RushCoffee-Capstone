import * as React from 'react';
// FIX: Use compat import for v8 syntax.
import firebase from 'firebase/compat/app';
import { db } from '../firebaseConfig';
import { useAuth } from './AuthContext';
import { Customizations } from './CartContext';
import { useNotification } from './NotificationContext';

export interface QueueItem {
    id: string; // Firestore document ID
    userId: string;
    customerName: string;
    orderNumber: string;
    position: number;
    status: 'waiting' | 'preparing' | 'ready' | 'completed' | 'cancelled';
    orderItems: Array<{
        productId: string;
        productName: string;
        quantity: number;
        price: number;
        customizations?: Customizations;
    }>;
    totalAmount: number;
    paymentMethod: 'gcash' | 'cash';
    paymentStatus: 'pending' | 'paid';
    timestamp: Date;
    estimatedTime: number; // in minutes
    cancellationReason?: string;
}

interface OrderContextType {
    activeOrder: QueueItem | null;
    setActiveOrder: (order: QueueItem | null) => void;
    orderHistory: QueueItem[];
    addOrderToHistory: (order: Omit<QueueItem, 'id' | 'timestamp'>) => Promise<void>;
    isHistoryLoading: boolean;
}

const OrderContext = React.createContext<OrderContextType | undefined>(undefined);

export const useOrder = () => {
    const context = React.useContext(OrderContext);
    if (context === undefined) {
        throw new Error('useOrder must be used within an OrderProvider');
    }
    return context;
};

interface OrderProviderProps {
    children: React.ReactNode;
}

export const OrderProvider: React.FC<OrderProviderProps> = ({ children }) => {
    const [activeOrder, setActiveOrder] = React.useState<QueueItem | null>(null);
    const [orderHistory, setOrderHistory] = React.useState<QueueItem[]>([]);
    const [isHistoryLoading, setIsHistoryLoading] = React.useState(true);
    const { currentUser } = useAuth();
    const { showNotification } = useNotification();

    // Ref to track previous status for notification triggering
    const prevStatusRef = React.useRef<string | undefined>(undefined);

    // Real-time subscription to order history
    React.useEffect(() => {
        let unsubscribe: () => void;

        if (currentUser) {
            setIsHistoryLoading(true);
            const ordersRef = db.collection('orders');
            const q = ordersRef.where('userId', '==', currentUser.uid);

            unsubscribe = q.onSnapshot((snapshot) => {
                const history = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    timestamp: doc.data().timestamp?.toDate() || new Date(),
                })) as QueueItem[];

                // Perform sorting on the client-side
                history.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

                setOrderHistory(history);

                // Check for an incomplete order to set as active (excluding cancelled)
                const active = history.find(order => order.status !== 'completed' && order.status !== 'cancelled') || null;
                setActiveOrder(active);

                setIsHistoryLoading(false);
            }, (error) => {
                console.error("Error listening to order history:", error);
                setIsHistoryLoading(false);
            });
        } else {
            // Clear data on logout
            setOrderHistory([]);
            setActiveOrder(null);
            setIsHistoryLoading(false);
        }

        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, [currentUser]);

    // Trigger notification ONLY when status changes to 'ready'
    React.useEffect(() => {
        const currentStatus = activeOrder?.status;
        const prevStatus = prevStatusRef.current;

        if (currentStatus === 'ready' && prevStatus !== 'ready') {
            const items = activeOrder?.orderItems.map(item => item.productName).join(', ');
            showNotification(`Your order for ${items} is ready!`, 'success');
        }

        // Update ref for next render
        prevStatusRef.current = currentStatus;
    }, [activeOrder?.status, activeOrder?.orderItems, showNotification]);

    const addOrderToHistory = async (orderData: Omit<QueueItem, 'id' | 'timestamp'>) => {
        try {
            const docRef = await db.collection('orders').add({
                ...orderData,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
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