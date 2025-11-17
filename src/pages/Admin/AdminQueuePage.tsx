


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
    
    const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
        try {
            // FIX: Use v8 db.runTransaction syntax.
            await db.runTransaction(async (transaction) => {
                // FIX: Use v8 doc reference syntax.
                const orderRef = db.collection("orders").doc(orderId);
                const orderDoc = await transaction.get(orderRef);

                if (!orderDoc.exists) {
                    throw new Error("Order does not exist!");
                }
                
                const orderData = orderDoc.data() as QueueItem;
                const currentStatus = orderData.status;

                // --- INVENTORY DEDUCTION LOGIC ---
                // Deduct stock only when moving from 'waiting' to 'preparing'
                if (currentStatus === 'waiting' && newStatus === 'preparing') {
                    for (const item of orderData.orderItems) {
                        const productRef = db.collection("products").doc(item.productId);
                        const productDoc = await transaction.get(productRef);

                        if (productDoc.exists && productDoc.data()!.recipe) {
                            for (const recipeItem of productDoc.data()!.recipe) {
                                const ingredientRef = db.collection("ingredients").doc(recipeItem.ingredientId);
                                const amountToDeduct = recipeItem.quantity * item.quantity;
                                
                                const ingredientDoc = await transaction.get(ingredientRef);
                                if (!ingredientDoc.exists) throw new Error(`Ingredient '${recipeItem.ingredientId}' not found.`);
                                if (ingredientDoc.data()!.stock < amountToDeduct) throw new Error(`Insufficient stock for '${ingredientDoc.data()!.name}'.`);
                                
                                // FIX: Use firebase.firestore.FieldValue.increment for v8.
                                transaction.update(ingredientRef, { stock: firebase.firestore.FieldValue.increment(-amountToDeduct) });
                            }
                        }
                    }
                }
                
                // --- REWARDS & STATS LOGIC ---
                // Award points only when moving to 'completed'
                if (newStatus === 'completed' && currentStatus !== 'completed') {
                    const userRef = db.collection("users").doc(orderData.userId);
                    const userDoc = await transaction.get(userRef);

                    if (userDoc.exists) {
                        const userData = userDoc.data() as UserProfile;
                        
                        // Calculate points based on items
                        let basePoints = 0;
                        for (const item of orderData.orderItems) {
                            if (item.productName.includes('(Grande)')) {
                                basePoints += 4 * item.quantity;
                            } else if (item.productName.includes('(Venti)')) {
                                basePoints += 5 * item.quantity;
                            }
                        }

                        // Calculate final points based on tier multiplier
                        let pointsMultiplier = 1;
                        if (userData.tier === 'silver') pointsMultiplier = 1.5;
                        if (userData.tier === 'gold') pointsMultiplier = 2;
                        
                        const pointsEarned = Math.floor(basePoints * pointsMultiplier);


                        // Check for tier upgrade
                        const newLifetimePoints = userData.lifetimePoints + pointsEarned;
                        let newTier = userData.tier;
                        if (newTier === 'bronze' && newLifetimePoints >= tierThresholds.silver.min) newTier = 'silver';
                        if (newTier === 'silver' && newLifetimePoints >= tierThresholds.gold.min) newTier = 'gold';

                        const rewardHistoryEntry = {
                            id: `rh-${Date.now()}`,
                            type: 'earned' as const,
                            points: pointsEarned,
                            description: `Order #${orderData.orderNumber}`,
                            date: new Date(),
                        };

                        // FIX: Use firebase.firestore.FieldValue for increment and arrayUnion in v8.
                        transaction.update(userRef, {
                            totalOrders: firebase.firestore.FieldValue.increment(1),
                            totalSpent: firebase.firestore.FieldValue.increment(orderData.totalAmount),
                            currentPoints: firebase.firestore.FieldValue.increment(pointsEarned),
                            lifetimePoints: firebase.firestore.FieldValue.increment(pointsEarned),
                            tier: newTier,
                            rewardsHistory: firebase.firestore.FieldValue.arrayUnion(rewardHistoryEntry)
                        });
                    }
                }

                // Finally, update the order status
                transaction.update(orderRef, { status: newStatus });
            });
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
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <QueueColumn
                        title="Waiting"
                        orders={waitingOrders}
                        onUpdateStatus={handleUpdateStatus}
                        color="yellow"
                    />
                    <QueueColumn
                        title="Preparing"
                        orders={preparingOrders}
                        onUpdateStatus={handleUpdateStatus}
                        color="blue"
                    />
                    <QueueColumn
                        title="Ready for Pickup"
                        orders={readyOrders}
                        onUpdateStatus={handleUpdateStatus}
                        color="green"
                    />
                </div>
            )}
        </div>
    );
};

export default AdminQueuePage;