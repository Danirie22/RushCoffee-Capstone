

import React, { useState, useEffect, useMemo } from 'react';
import { collection, query, where, onSnapshot, orderBy, doc, updateDoc, runTransaction, getDoc, increment } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { QueueItem } from '../../context/OrderContext';
import QueueColumn from '../../components/admin/QueueColumn';
import { Loader2, Coffee } from 'lucide-react';
import { useCart } from '../../context/CartContext';

type OrderStatus = 'waiting' | 'preparing' | 'ready' | 'completed';

const AdminQueuePage: React.FC = () => {
    const [orders, setOrders] = useState<QueueItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { showToast } = useCart();

    useEffect(() => {
        // The original query with `where("status", "in", ...)` and `orderBy("timestamp", ...)` requires a composite index.
        // To avoid this, we fetch the documents matching the status and sort them on the client side.
        const q = query(
            collection(db, "orders"),
            where("status", "in", ["waiting", "preparing", "ready"])
        );

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const activeOrders: QueueItem[] = [];
            querySnapshot.forEach((doc) => {
                activeOrders.push({
                    id: doc.id,
                    ...doc.data(),
                    timestamp: doc.data().timestamp.toDate(),
                } as QueueItem);
            });
            
            // Sort client-side by timestamp in ascending order
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
            await runTransaction(db, async (transaction) => {
                const orderRef = doc(db, "orders", orderId);
                const orderDoc = await transaction.get(orderRef);

                if (!orderDoc.exists()) {
                    throw new Error("Order does not exist!");
                }
                
                const orderData = orderDoc.data();

                // Deduct stock only when moving from 'waiting' to 'preparing'
                if (orderData.status === 'waiting' && newStatus === 'preparing') {
                    for (const item of orderData.orderItems) {
                        const productRef = doc(db, "products", item.productId);
                        const productDoc = await transaction.get(productRef);

                        if (productDoc.exists() && productDoc.data().recipe) {
                            const product = productDoc.data();
                            for (const recipeItem of product.recipe) {
                                const ingredientRef = doc(db, "ingredients", recipeItem.ingredientId);
                                const amountToDeduct = recipeItem.quantity * item.quantity;
                                
                                const ingredientDoc = await transaction.get(ingredientRef);
                                if (!ingredientDoc.exists()) {
                                    throw new Error(`Ingredient '${recipeItem.ingredientId}' not found in inventory.`);
                                }

                                const currentStock = ingredientDoc.data().stock;
                                if (currentStock < amountToDeduct) {
                                    throw new Error(`Insufficient stock for '${ingredientDoc.data().name}'. Required: ${amountToDeduct}, Available: ${currentStock}.`);
                                }
                                
                                transaction.update(ingredientRef, { stock: increment(-amountToDeduct) });
                            }
                        }
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