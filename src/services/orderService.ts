import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import { db } from '../firebaseConfig';
import { deductInventoryForOrder } from '../utils/inventoryDeduction';
import { Order, OrderItem } from '../types';

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
export const saveOrder = async (orderData: Omit<Order, 'id' | 'timestamp'>): Promise<string> => {
    try {
        // Deduct inventory immediately for POS orders
        try {
            await deductInventoryForOrder(orderData.orderItems);
        } catch (inventoryError) {
            console.error('⚠️ Order saved but inventory deduction failed:', inventoryError);
        }

        const docRef = await db.collection('orders').add({
            ...orderData,
            inventoryDeducted: true, // Flag to prevent double deduction
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        });

        console.log('✅ Order saved successfully:', docRef.id);
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
        console.log(`🛠️ updateOrderStatus called for ${orderId} -> ${status}`);
        const updateData: Partial<Order> = { status };

        // Add completedAt timestamp when marking as completed
        if (status === 'completed') {
            updateData.completedAt = firebase.firestore.FieldValue.serverTimestamp();

            // Calculate and award loyalty points
            const orderDoc = await db.collection('orders').doc(orderId).get();
            if (orderDoc.exists) {
                const orderData = orderDoc.data() as Order;
                // Check for userId or customerId (legacy support)
                const targetUserId = orderData.userId || orderData.customerId;

                if (targetUserId) {
                    let pointsEarned = 0;
                    const productNames: string[] = [];

                    // Calculate points based on items
                    if (orderData.orderItems) {
                        orderData.orderItems.forEach(item => {
                            productNames.push(item.productName);
                            // Points rules:
                            // Grande / Combo Meal = 4 points
                            // Venti / Ala Carte = 5 points
                            // Venti / Combo Meal = 5 points

                            // Check size field first, then fallback to product name
                            const size = item.size;
                            const productName = item.productName ? item.productName.toLowerCase() : '';

                            if (size === 'Grande' || productName.includes('grande')) {
                                pointsEarned += 4 * item.quantity;
                            } else if (size === 'Venti' || productName.includes('venti')) {
                                pointsEarned += 5 * item.quantity;
                            } else if (size === 'Combo Meal' || productName.includes('combo')) {
                                pointsEarned += 5 * item.quantity;
                            } else if (size === 'Ala Carte' || productName.includes('ala carte')) {
                                pointsEarned += 4 * item.quantity;
                            }
                        });
                    }

                    if (pointsEarned > 0) {
                        console.log(`🌟 Awarding ${pointsEarned} points to customer ${targetUserId}`);

                        const userRef = db.collection('users').doc(targetUserId);
                        const rewardHistoryEntry = {
                            id: `rh-${Date.now()}`,
                            type: 'earned',
                            points: pointsEarned,
                            description: `Earned from ${productNames.join(', ')}`,
                            date: new Date()
                        };

                        // Use totalAmount if available, otherwise fallback to subtotal
                        const amountToIncrement = orderData.totalAmount || orderData.subtotal || 0;

                        await userRef.update({
                            currentPoints: firebase.firestore.FieldValue.increment(pointsEarned),
                            lifetimePoints: firebase.firestore.FieldValue.increment(pointsEarned),
                            totalOrders: firebase.firestore.FieldValue.increment(1),
                            totalSpent: firebase.firestore.FieldValue.increment(amountToIncrement),
                            rewardsHistory: firebase.firestore.FieldValue.arrayUnion(rewardHistoryEntry)
                        });
                    }
                }
            }
        }

        // Deduct inventory when marking as ready (if not already deducted)
        if (status === 'ready') {
            const orderDoc = await db.collection('orders').doc(orderId).get();
            if (orderDoc.exists) {
                const orderData = orderDoc.data() as Order;

                // Check if inventory was already deducted
                if (orderData?.inventoryDeducted) {
                    console.log(`ℹ️ Inventory already deducted for order ${orderId}. Skipping.`);
                } else if (orderData && orderData.orderItems) {
                    console.log(`📉 Deducting inventory for order ${orderId} (Status: Ready)`);
                    try {
                        await deductInventoryForOrder(orderData.orderItems);
                        updateData.inventoryDeducted = true; // Mark as deducted
                    } catch (inventoryError) {
                        console.error('⚠️ Failed to deduct inventory:', inventoryError);
                    }
                }
            }
        }

        await db.collection('orders').doc(orderId).update(updateData);
        console.log(`✅ Order ${orderId} status updated to: ${status}`);
    } catch (error) {
        console.error('❌ Error updating order status:', error);
        throw new Error('Failed to update order status.');
    }
};
