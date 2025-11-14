

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Replicating the QueueItem interface to keep contexts independent
export interface QueueItem {
  id: string;
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
  addOrderToHistory: (order: QueueItem) => void;
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

    useEffect(() => {
        if (activeOrder && activeOrder.status !== 'completed') {
            const sequence: QueueItem['status'][] = ['waiting', 'preparing', 'ready', 'completed'];
            const currentStatus = activeOrder.status;
            const currentIndex = sequence.indexOf(currentStatus);

            if (currentIndex === -1 || currentIndex >= sequence.length - 1) return;

            const timer = setTimeout(() => {
                const nextStatus = sequence[currentIndex + 1];
                setActiveOrder(prev => prev ? { ...prev, status: nextStatus } : null);
            }, 10000); // 10 seconds for each status update

            return () => clearTimeout(timer);
        }
    }, [activeOrder]);

    const addOrderToHistory = (order: QueueItem) => {
        setOrderHistory(prevHistory => [order, ...prevHistory]);
    };

    const value = { activeOrder, setActiveOrder, orderHistory, addOrderToHistory };

    return (
        <OrderContext.Provider value={value}>
            {children}
        </OrderContext.Provider>
    );
};