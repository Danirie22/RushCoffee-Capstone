import { db } from '../firebaseConfig';
import firebase from 'firebase/compat/app';

/**
 * Recalculates a user's totalSpent from all completed orders
 * This is useful for backfilling data when the totalSpent tracking was added later
 */
export const recalculateUserTotalSpent = async (userId: string): Promise<number> => {
    try {
        console.log(`🔄 Recalculating totalSpent for user: ${userId}`);

        // Fetch all completed orders for this user
        const ordersSnapshot = await db
            .collection('orders')
            .where('userId', '==', userId)
            .where('status', '==', 'completed')
            .get();

        let totalSpent = 0;

        ordersSnapshot.forEach(doc => {
            const orderData = doc.data();

            // Try to get totalAmount first, then subtotal
            let orderTotal = orderData.totalAmount || orderData.subtotal || 0;

            // If both are missing, calculate from items
            if (!orderTotal && orderData.orderItems) {
                orderTotal = orderData.orderItems.reduce((sum: number, item: any) => {
                    return sum + (item.price * item.quantity);
                }, 0);
            }

            totalSpent += orderTotal;
            console.log(`  Order ${doc.id}: ₱${orderTotal}`);
        });

        console.log(`✅ Total spent calculated: ₱${totalSpent} from ${ordersSnapshot.size} orders`);

        // Update the user's totalSpent field
        await db.collection('users').doc(userId).update({
            totalSpent: totalSpent
        });

        console.log(`💾 Updated user profile with totalSpent: ₱${totalSpent}`);

        return totalSpent;
    } catch (error) {
        console.error('❌ Error recalculating totalSpent:', error);
        throw error;
    }
};

/**
 * Recalculates all user stats (totalOrders, totalSpent) from completed orders
 */
export const recalculateAllUserStats = async (userId: string): Promise<{ totalOrders: number; totalSpent: number }> => {
    try {
        console.log(`🔄 Recalculating all stats for user: ${userId}`);

        // Fetch all completed orders for this user
        const ordersSnapshot = await db
            .collection('orders')
            .where('userId', '==', userId)
            .where('status', '==', 'completed')
            .get();

        const totalOrders = ordersSnapshot.size;
        let totalSpent = 0;

        ordersSnapshot.forEach(doc => {
            const orderData = doc.data();

            // Try to get totalAmount first, then subtotal
            let orderTotal = orderData.totalAmount || orderData.subtotal || 0;

            // If both are missing, calculate from items
            if (!orderTotal && orderData.orderItems) {
                orderTotal = orderData.orderItems.reduce((sum: number, item: any) => {
                    return sum + (item.price * item.quantity);
                }, 0);
            }

            totalSpent += orderTotal;
        });

        console.log(`✅ Stats calculated: ${totalOrders} orders, ₱${totalSpent} spent`);

        // Update the user's profile
        await db.collection('users').doc(userId).update({
            totalOrders: totalOrders,
            totalSpent: totalSpent
        });

        console.log(`💾 Updated user profile`);

        return { totalOrders, totalSpent };
    } catch (error) {
        console.error('❌ Error recalculating stats:', error);
        throw error;
    }
};
