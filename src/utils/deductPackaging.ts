import firebase from 'firebase/compat/app';
import { db } from '../firebaseConfig';

/**
 * Automatically deduct packaging materials from inventory when an order is completed
 * @param orderItems - Array of order items to calculate packaging for
 */
export const deductPackaging = async (orderItems: any[]) => {
    try {
        const batch = db.batch();

        // Track what we're deducting
        const packagingNeeded: { [key: string]: number } = {
            'straw': 0,
            'napkins': 0,
            'cup-grande': 0,
            'cup-venti': 0,
            'lid-grande': 0,
            'lid-venti': 0,
            'takeout-pack': 0,
        };

        // Calculate packaging needed based on order items
        orderItems.forEach(item => {
            const productName = item.productName.toLowerCase();
            const quantity = item.quantity;

            // Determine cup/lid size for drinks
            if (productName.includes('grande')) {
                packagingNeeded['cup-grande'] += quantity;
                packagingNeeded['lid-grande'] += quantity;
                packagingNeeded['straw'] += quantity;
                packagingNeeded['napkins'] += quantity * 2; // 2 napkins per drink
            } else if (productName.includes('venti')) {
                packagingNeeded['cup-venti'] += quantity;
                packagingNeeded['lid-venti'] += quantity;
                packagingNeeded['straw'] += quantity;
                packagingNeeded['napkins'] += quantity * 2; // 2 napkins per drink
            }

            // Check for meals (need takeout packs)
            if (productName.includes('ala carte') || productName.includes('combo')) {
                packagingNeeded['takeout-pack'] += quantity;
                packagingNeeded['napkins'] += quantity * 2; // 2 napkins per meal
            }
        });

        // Deduct from inventory
        for (const [itemId, amount] of Object.entries(packagingNeeded)) {
            if (amount > 0) {
                const itemRef = db.collection('ingredients').doc(itemId);
                batch.update(itemRef, {
                    stock: firebase.firestore.FieldValue.increment(-amount)
                });
            }
        }

        await batch.commit();
        console.log('✅ Packaging deducted successfully:', packagingNeeded);
    } catch (error) {
        console.error('❌ Error deducting packaging:', error);
        // Don't throw - we don't want to block order completion if packaging deduction fails
    }
};
