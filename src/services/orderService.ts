import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import { db } from '../firebaseConfig';
import { deductInventoryForOrder } from '../utils/inventoryDeduction';

export interface OrderItem {
    productId: string;
    productName: string;
    category: string;
    size: string;
    sizeLabel: string;
    price: number;
    quantity: number;
    customizations?: {
        sugarLevel?: string;
        iceLevel?: string;
        toppings?: string[];
    };
}

export interface OrderData {
    orderNumber: string;
    orderItems: OrderItem[];
    subtotal: number;
    paymentMethod: 'cash' | 'gcash';
    paymentDetails: {
        amountReceived: number;
        change: number;
        referenceNumber?: string;
    };
    discount?: {
        type: 'senior' | 'pwd' | 'none';
        amount: number;
        percentage: number;
        cardId?: string;
    } | null;
    status: 'preparing' | 'ready' | 'completed' | 'cancelled';
    customerId?: string;
    customerName?: string;
    employeeId: string;
    employeeName: string;
    timestamp: any;
    completedAt?: any;
}

/**
 * Generate a unique order number
 * Format: #YYYYMMDD-XXXX (e.g., #20231125-0001)
 */
export const generateOrderNumber = async (): Promise<string> => {
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const randomSuffix = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `#${dateStr}-${randomSuffix}`;
};

/**
 * Save a new order to Firestore
 */
export const saveOrder = async (orderData: Omit<OrderData, 'timestamp'>): Promise<string> => {
    try {
        const docRef = await db.collection('orders').add({
            ...orderData,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        });

        console.log('✅ Order saved successfully:', docRef.id);

        // Deduct inventory
        try {
            await deductInventoryForOrder(orderData.orderItems);
        } catch (inventoryError) {
            console.error('⚠️ Order saved but inventory deduction failed:', inventoryError);
            // We don't throw here to avoid failing the order if inventory fails
            // But in a real app, we might want to handle this better (e.g. alert admin)
        }

        return docRef.id;
    } catch (error) {
        console.error('❌ Error saving order:', error);
        throw new Error('Failed to save order. Please try again.');
    }
};

/**
 * Update order status
 */
export const updateOrderStatus = async (
    orderId: string,
    status: 'preparing' | 'ready' | 'completed' | 'cancelled'
): Promise<void> => {
    try {
        const updateData: any = { status };

        // Add completedAt timestamp when marking as completed
        if (status === 'completed') {
            updateData.completedAt = firebase.firestore.FieldValue.serverTimestamp();
        }

        await db.collection('orders').doc(orderId).update(updateData);
        console.log(`✅ Order ${orderId} status updated to: ${status}`);
    } catch (error) {
        console.error('❌ Error updating order status:', error);
        throw new Error('Failed to update order status.');
    }
};
