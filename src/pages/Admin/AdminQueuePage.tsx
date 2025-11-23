
import React, { useState, useEffect, useMemo } from 'react';
// FIX: Update Firebase imports for v8 compatibility.
import firebase from 'firebase/compat/app';
import { db } from '../../firebaseConfig';
import { QueueItem } from '../../context/OrderContext';
import QueueColumn from '../../components/admin/QueueColumn';
import { Loader2, Coffee } from 'lucide-react';
// FIX: The useCart hook is exported from CartContext, not AuthContext.
import { useCart } from '../../context/CartContext';
import { tierThresholds } from '../../data/mockRewards';
import { UserProfile } from '../../context/AuthContext';
import { mockCustomizationOptions } from '../../data/mockCustomizationOptions';

type OrderStatus = 'waiting' | 'preparing' | 'ready' | 'completed';

const AdminQueuePage: React.FC = () => {
    const [orders, setOrders] = useState<QueueItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { showToast } = useCart();

    useEffect(() => {
        // FIX: Use v8 Firestore query syntax.
        const q = db
            .collection("orders")
            .where("status", "in", ["waiting", "preparing", "ready"]);

        // FIX: Use v8 onSnapshot syntax.
        const unsubscribe = q.onSnapshot((querySnapshot) => {
            const activeOrders: QueueItem[] = [];
            querySnapshot.forEach((doc) => {
                activeOrders.push({
                    id: doc.id,
                    ...doc.data(),
                    timestamp: doc.data().timestamp.toDate(),
                } as QueueItem);
            });

            // Sort on the client-side because composite indexes are not available by default.
            activeOrders.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
            setOrders(activeOrders);
            setIsLoading(false);
        }, (error) => {
            console.error("Error fetching real-time orders: ", error);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleCancelOrder = async (orderId: string) => {
        const reason = prompt('Please enter a reason for cancellation:', 'Out of Stock');

        if (!reason) {
            return; // User cancelled the prompt
        }

        try {
            await db.collection('orders').doc(orderId).update({
                status: 'cancelled',
                cancellationReason: reason,
                updatedAt: new Date(),
            });
            showToast(`Order cancelled: ${reason}`);
        } catch (error) {
            console.error('Error cancelling order:', error);
            showToast('Failed to cancel order');
        }
    };

    const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
        let pointsData: { userId: string; pointsEarned: number; newTier: 'bronze' | 'silver' | 'gold'; totalAmount: number; orderNumber: string } | null = null;

        try {
            await db.runTransaction(async (transaction) => {
                // === PHASE 1: ALL READS FIRST ===

                // 1. Read the order document.
                const orderRef = db.collection("orders").doc(orderId);
                const orderDoc = await transaction.get(orderRef);

                if (!orderDoc.exists) {
                    throw new Error("Order does not exist!");
                }
                const orderData = orderDoc.data() as QueueItem;
                const currentStatus = orderData.status;

                const ingredientDocsToRead = new Map<string, firebase.firestore.DocumentReference>();
                const ingredientDeductions = new Map<string, number>();

                // 2. If preparing order, read product recipes AND customizations to determine which ingredients to read.
                if (currentStatus === 'waiting' && newStatus === 'preparing') {
                    const productRefs = orderData.orderItems.map(item => db.collection("products").doc(item.productId));
                    const productDocs = await Promise.all(productRefs.map(ref => transaction.get(ref)));

                    for (let i = 0; i < orderData.orderItems.length; i++) {
                        const item = orderData.orderItems[i];
                        const productDoc = productDocs[i];

                        // Deduct base recipe ingredients
                        if (productDoc.exists && productDoc.data()!.recipe) {
                            for (const recipeItem of productDoc.data()!.recipe) {
                                const ingredientRef = db.collection("ingredients").doc(recipeItem.ingredientId);
                                const amountToDeduct = recipeItem.quantity * item.quantity;

                                ingredientDocsToRead.set(ingredientRef.path, ingredientRef);
                                ingredientDeductions.set(ingredientRef.path, (ingredientDeductions.get(ingredientRef.path) || 0) + amountToDeduct);
                            }
                        }

                        // ✅ NEW: Deduct customization ingredients (sugar, ice, toppings)
                        if (item.customizations) {
                            // Deduct sugar syrup
                            if (item.customizations.sugarLevel) {
                                const sugarLevelData = mockCustomizationOptions.sugarLevels.find(
                                    level => level.value === item.customizations!.sugarLevel
                                );
                                if (sugarLevelData && sugarLevelData.sugarAmount > 0) {
                                    const sugarRef = db.collection("ingredients").doc(sugarLevelData.sugarIngredientId);
                                    const sugarAmount = sugarLevelData.sugarAmount * item.quantity;

                                    ingredientDocsToRead.set(sugarRef.path, sugarRef);
                                    ingredientDeductions.set(sugarRef.path, (ingredientDeductions.get(sugarRef.path) || 0) + sugarAmount);
                                }
                            }

                            // Deduct ice
                            if (item.customizations.iceLevel) {
                                const iceLevelData = mockCustomizationOptions.iceLevels.find(
                                    level => level.value === item.customizations!.iceLevel
                                );
                                if (iceLevelData && iceLevelData.iceAmount > 0) {
                                    const iceRef = db.collection("ingredients").doc(iceLevelData.iceIngredientId);
                                    const iceAmount = iceLevelData.iceAmount * item.quantity;

                                    ingredientDocsToRead.set(iceRef.path, iceRef);
                                    ingredientDeductions.set(iceRef.path, (ingredientDeductions.get(iceRef.path) || 0) + iceAmount);
                                }
                            }

                            // Deduct toppings
                            if (item.customizations.toppings && item.customizations.toppings.length > 0) {
                                for (const toppingName of item.customizations.toppings) {
                                    // Query to find topping by name
                                    const toppingSnapshot = await db.collection("ingredients")
                                        .where('name', '==', toppingName)
                                        .where('isTopping', '==', true)
                                        .limit(1)
                                        .get();

                                    if (!toppingSnapshot.empty) {
                                        const toppingDoc = toppingSnapshot.docs[0];
                                        const toppingData = toppingDoc.data();
                                        const portionSize = toppingData.portionSize || 30;
                                        const toppingAmount = portionSize * item.quantity;

                                        ingredientDocsToRead.set(toppingDoc.ref.path, toppingDoc.ref);
                                        ingredientDeductions.set(toppingDoc.ref.path, (ingredientDeductions.get(toppingDoc.ref.path) || 0) + toppingAmount);
                                    }
                                }
                            }
                        }
                    }
                }

                // 3. Read all unique ingredient documents needed for stock deduction.
                const ingredientDocs = await Promise.all(
                    Array.from(ingredientDocsToRead.values()).map(ref => transaction.get(ref))
                );

                // 4. If completing order, PREPARE data for user update (but don't write yet).
                // We need to read the user doc to calculate points/tier correctly.
                if (newStatus === 'completed' && currentStatus !== 'completed') {
                    const userRef = db.collection("users").doc(orderData.userId);
                    const userDoc = await transaction.get(userRef);

                    if (userDoc.exists) {
                        const userData = userDoc.data() as UserProfile;

                        let basePoints = 0;
                        for (const item of orderData.orderItems) {
                            if (item.productName.includes('(Grande)')) basePoints += 4 * item.quantity;
                            else if (item.productName.includes('(Venti)')) basePoints += 5 * item.quantity;
                        }

                        let pointsMultiplier = 1;
                        const currentTier = userData.tier || 'bronze';
                        if (currentTier === 'silver') pointsMultiplier = 1.5;
                        if (currentTier === 'gold') pointsMultiplier = 2;

                        const pointsEarned = Math.floor(basePoints * pointsMultiplier);
                        const currentLifetimePoints = userData.lifetimePoints || 0;
                        const newLifetimePoints = currentLifetimePoints + pointsEarned;

                        let newTier: 'bronze' | 'silver' | 'gold' = currentTier;
                        if (newTier === 'bronze' && newLifetimePoints >= tierThresholds.silver.min) newTier = 'silver';
                        if (newTier === 'silver' && newLifetimePoints >= tierThresholds.gold.min) newTier = 'gold';

                        // Save this data to use AFTER the transaction
                        pointsData = {
                            userId: orderData.userId,
                            pointsEarned,
                            newTier,
                            totalAmount: orderData.totalAmount,
                            orderNumber: orderData.orderNumber
                        };
                    }
                }

                // === ALL READS ARE NOW COMPLETE ===
                // === PHASE 2: VALIDATION & LOGIC ===

                // 1. Validate ingredient stock.
                if (currentStatus === 'waiting' && newStatus === 'preparing') {
                    const ingredientDocMap = new Map(ingredientDocs.map(doc => [doc.ref.path, doc]));

                    for (const [path, amountToDeduct] of ingredientDeductions.entries()) {
                        const ingredientDoc = ingredientDocMap.get(path);
                        if (!ingredientDoc || !ingredientDoc.exists) {
                            const ingredientId = path.split('/').pop();
                            throw new Error(`Ingredient '${ingredientId}' not found.`);
                        }
                        if (ingredientDoc.data()!.stock < amountToDeduct) {
                            throw new Error(`Insufficient stock for '${ingredientDoc.data()!.name}'.`);
                        }
                    }
                }

                // === PHASE 3: WRITES (Order & Stock ONLY) ===

                // 1. Update ingredient stock.
                if (currentStatus === 'waiting' && newStatus === 'preparing') {
                    for (const [path, amountToDeduct] of ingredientDeductions.entries()) {
                        const ingredientRef = db.doc(path);
                        transaction.update(ingredientRef, { stock: firebase.firestore.FieldValue.increment(-amountToDeduct) });
                    }
                }

                // 2. Update the order status.
                transaction.update(orderRef, { status: newStatus });
            });

            // === PHASE 4: USER REWARDS (Separate Operation) ===
            // We do this OUTSIDE the transaction so that if it fails (due to permissions),
            // it doesn't roll back the Order Completion.
            if (pointsData) {
                try {
                    const rewardHistoryEntry = {
                        id: `rh-${Date.now()}`,
                        type: 'earned' as const,
                        points: pointsData.pointsEarned,
                        description: `Order #${pointsData.orderNumber}`,
                        date: new Date(),
                    };

                    await db.collection("users").doc(pointsData.userId).update({
                        totalOrders: firebase.firestore.FieldValue.increment(1),
                        totalSpent: firebase.firestore.FieldValue.increment(pointsData.totalAmount),
                        currentPoints: firebase.firestore.FieldValue.increment(pointsData.pointsEarned),
                        lifetimePoints: firebase.firestore.FieldValue.increment(pointsData.pointsEarned),
                        tier: pointsData.newTier,
                        rewardsHistory: firebase.firestore.FieldValue.arrayUnion(rewardHistoryEntry)
                    });
                } catch (userError) {
                    console.error("Failed to update user rewards:", userError);
                    showToast("Order completed, but failed to update user points (Permission Error).");
                    return; // Exit early, but order is already saved
                }
            }

        } catch (error: any) {
            console.error("Error updating order status and stock: ", error);
            showToast(error.message || 'Failed to update order. Please check inventory.');
        }
    };

    const waitingOrders = useMemo(() => orders.filter(o => o.status === 'waiting'), [orders]);
    const preparingOrders = useMemo(() => orders.filter(o => o.status === 'preparing'), [orders]);
    const readyOrders = useMemo(() => orders.filter(o => o.status === 'ready'), [orders]);

    if (isLoading) {
        return (
            <div className="flex h-full items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary-600" />
            </div>
        );
    }

    return (
        <div>
            <h1 className="mb-6 font-display text-3xl font-bold text-gray-800">Live Order Queue</h1>
            {orders.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed bg-gray-50 p-12 text-center">
                    <Coffee className="h-16 w-16 text-gray-400" />
                    <h2 className="mt-4 text-xl font-semibold text-gray-700">No Active Orders</h2>
                    <p className="mt-1 text-gray-500">New orders will appear here in real-time.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <QueueColumn
                        title="Waiting"
                        orders={waitingOrders}
                        onUpdateStatus={handleUpdateStatus}
                        onCancelOrder={handleCancelOrder}
                        color="yellow"
                    />
                    <QueueColumn
                        title="Preparing"
                        orders={preparingOrders}
                        onUpdateStatus={handleUpdateStatus}
                        onCancelOrder={handleCancelOrder}
                        color="blue"
                    />
                    <QueueColumn
                        title="Ready for Pickup"
                        orders={readyOrders}
                        onUpdateStatus={handleUpdateStatus}
                        onCancelOrder={handleCancelOrder}
                        color="green"
                    />
                </div>
            )}
        </div>
    );
};

export default AdminQueuePage;
