import React, { useState, useEffect } from 'react';
import firebase from 'firebase/compat/app';
import { db } from '../../firebaseConfig';
import { QueueItem } from '../../context/OrderContext';
import { Clock, Coffee, CheckCircle, AlertCircle, XCircle, Play, Trash2, FileText } from 'lucide-react';
import DigitalReceipt from '../../components/checkout/DigitalReceipt';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { useCart } from '../../context/CartContext';
import { deductInventoryForOrder } from '../../utils/inventoryDeduction';
import { useProduct } from '../../context/ProductContext';

type OrderStatus = 'waiting' | 'preparing' | 'ready' | 'completed' | 'cancelled';

const AdminQueuePage: React.FC = () => {
    const [orders, setOrders] = useState<QueueItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedReceiptOrder, setSelectedReceiptOrder] = useState<QueueItem | null>(null);
    const { showToast } = useCart();
    const { products } = useProduct();
    const previousOrderCount = React.useRef(0);

    // Unlock Audio Context on first user interaction
    useEffect(() => {
        const unlockAudio = () => {
            const audio = new Audio('data:audio/mp3;base64,//NExAAAAANIAAAAAExBTUUzLjEwMKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq//NExAAAAANIAAAAAExBTUUzLjEwMKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq');
            audio.play().catch(() => { });
            document.removeEventListener('click', unlockAudio);
            document.removeEventListener('touchstart', unlockAudio);
        };
        document.addEventListener('click', unlockAudio);
        document.addEventListener('touchstart', unlockAudio);
        return () => {
            document.removeEventListener('click', unlockAudio);
            document.removeEventListener('touchstart', unlockAudio);
        };
    }, []);

    useEffect(() => {
        const unsubscribe = db
            .collection('orders')
            .orderBy('timestamp', 'desc')
            .limit(100)
            .onSnapshot((snapshot) => {
                const fetchedOrders = snapshot.docs.map((doc) => {
                    const data = doc.data();
                    return {
                        id: doc.id,
                        ...data,
                        orderItems: data.orderItems || data.items || [], // Handle legacy data
                        timestamp: data.timestamp?.toDate ? data.timestamp.toDate() : (data.timestamp ? new Date(data.timestamp) : new Date()),
                    };
                }) as QueueItem[];

                // Audio Alert for New Orders
                if (fetchedOrders.length > previousOrderCount.current && previousOrderCount.current !== 0) {
                    const audio = new Audio('data:audio/mp3;base64,//NExAAAAANIAAAAAExBTUUzLjEwMKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq//NExAAAAANIAAAAAExBTUUzLjEwMKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq'); // Short beep
                    audio.play().catch(e => console.log('Audio play failed:', e));
                }
                previousOrderCount.current = fetchedOrders.length;

                setOrders(fetchedOrders);
                setLoading(false);
            });
        return () => unsubscribe();
    }, []);

    const updateOrderStatus = async (orderId: string, newStatus: OrderStatus, reason?: string) => {
        try {
            const updateData: any = {
                status: newStatus,
                updatedAt: new Date(),
            };

            if (reason) {
                updateData.cancellationReason = reason;
            }

            // Deduct inventory when marking as ready
            if (newStatus === 'ready') {
                const orderDoc = await db.collection('orders').doc(orderId).get();
                if (orderDoc.exists) {
                    const orderData = orderDoc.data();

                    if (orderData?.inventoryDeducted) {
                        console.log(`ℹ️ Inventory already deducted for order ${orderId}. Skipping.`);
                    } else if (orderData && orderData.orderItems) {
                        console.log(`📉 Deducting inventory for order ${orderId} (Status: Ready)`);
                        try {
                            // Cast to any because QueueItem might have slightly different structure but runtime data is compatible
                            await deductInventoryForOrder(orderData.orderItems as any);
                            updateData.inventoryDeducted = true;
                        } catch (inventoryError) {
                            console.error('⚠️ Failed to deduct inventory:', inventoryError);
                            // We continue to update status even if deduction fails
                        }
                    }
                }
            }

            await db.collection('orders').doc(orderId).update(updateData);

            // Award points if order is completed
            if (newStatus === 'completed') {
                const orderDoc = await db.collection('orders').doc(orderId).get();
                if (orderDoc.exists) {
                    const orderData = orderDoc.data();
                    if (orderData && orderData.userId) {
                        let loyaltyPoints = 0;
                        const items = orderData.orderItems || orderData.items || [];
                        const productNames: string[] = [];

                        items.forEach((item: any) => {
                            productNames.push(item.productName);
                            const productName = item.productName.toLowerCase();
                            if (productName.includes('grande')) {
                                loyaltyPoints += 4 * item.quantity;
                            } else if (productName.includes('venti')) {
                                loyaltyPoints += 5 * item.quantity;
                            } else if (productName.includes('ala carte')) {
                                loyaltyPoints += 4 * item.quantity;
                            } else if (productName.includes('combo')) {
                                loyaltyPoints += 5 * item.quantity;
                            }
                        });

                        if (loyaltyPoints > 0) {
                            const historyEntry = {
                                id: `rh-${Date.now()}`,
                                type: 'earned',
                                points: loyaltyPoints,
                                description: `Earned from ${productNames.join(', ')}`,
                                date: new Date(),
                            };

                            await db.collection('users').doc(orderData.userId).update({
                                totalOrders: firebase.firestore.FieldValue.increment(1),
                                currentPoints: firebase.firestore.FieldValue.increment(loyaltyPoints),
                                loyaltyPoints: firebase.firestore.FieldValue.increment(loyaltyPoints),
                                rewardsHistory: firebase.firestore.FieldValue.arrayUnion(historyEntry)
                            });

                            console.log(`🌟 Awarded ${loyaltyPoints} points to user ${orderData.userId}`);
                        }
                    }
                }
            }

            showToast(`Order updated to ${newStatus}`);
        } catch (error) {
            console.error('Error updating order status:', error);
            showToast('Failed to update order status');
        }
    };

    const handleCancelOrder = (orderId: string) => {
        if (window.confirm('Are you sure you want to cancel this order?')) {
            const reason = window.prompt('Please enter a reason for cancellation (optional):', 'Out of Stock');
            updateOrderStatus(orderId, 'cancelled', reason || 'No reason provided');
        }
    };

    const getOrdersByStatus = (status: OrderStatus) => {
        return orders.filter(o => o.status === status).sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    };

    const StatusColumn = ({ title, status, icon: Icon, color, nextStatus, actionLabel }: {
        title: string,
        status: OrderStatus,
        icon: any,
        color: string,
        nextStatus?: OrderStatus,
        actionLabel?: string
    }) => {
        const columnOrders = getOrdersByStatus(status);

        return (
            <div className="flex flex-col h-full bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className={`flex items-center gap-2 mb-4 pb-2 border-b-2 ${color}`}>
                    <Icon className="h-5 w-5 text-gray-700" />
                    <h2 className="font-bold text-gray-700">{title}</h2>
                    <span className="ml-auto bg-white px-2 py-0.5 rounded-full text-xs font-bold shadow-sm border">
                        {columnOrders.length}
                    </span>
                </div>

                <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                    {columnOrders.map((order, index) => (
                        <Card key={order.id} className="p-3 shadow-sm hover:shadow-md transition-shadow bg-white">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <span className="font-bold text-lg">{order.orderNumber}</span>
                                    <p className="text-xs text-gray-500">{order.customerName}</p>
                                </div>
                                <span className="text-xs text-gray-400">
                                    {order.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>

                            <div className="mb-2">
                                {order.orderType === 'online' ? (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                        🌐 Online
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                                        🏪 Walk-in
                                    </span>
                                )}
                            </div>

                            <div className="space-y-2 mb-3">
                                {(order.orderItems || []).map((item, idx) => {
                                    const product = products.find(p => p.id === item.productId);
                                    return (
                                        <div key={idx} className="text-sm flex items-center gap-3 bg-gray-50 p-2 rounded-lg">
                                            {product?.imageUrl && (
                                                <img
                                                    src={product.imageUrl}
                                                    alt={item.productName}
                                                    className="h-10 w-10 rounded-md object-cover flex-shrink-0"
                                                />
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start">
                                                    <span className="font-medium text-gray-900 truncate">{item.productName}</span>
                                                    <span className="text-xs font-bold bg-white px-1.5 py-0.5 rounded border ml-2">x{item.quantity}</span>
                                                </div>
                                                {item.size && <p className="text-xs text-gray-500">{item.size}</p>}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* GCash Details */}
                            {order.paymentMethod === 'gcash' && (
                                <div className="mt-2 mb-2 rounded bg-blue-50 p-2 text-xs text-blue-800 border border-blue-100">
                                    <div className="flex items-center justify-between">
                                        <span className="font-bold flex items-center gap-1">
                                            <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                                            GCash
                                        </span>
                                        {order.receiptUrl && (
                                            <button
                                                onClick={() => setSelectedReceiptOrder(order)}
                                                className="flex items-center gap-1 text-blue-600 hover:text-blue-800 hover:underline font-medium"
                                            >
                                                <FileText className="h-3 w-3" />
                                                View Receipt
                                            </button>
                                        )}
                                    </div>
                                    {order.paymentAccountName && (
                                        <div className="mt-1 font-medium truncate" title={order.paymentAccountName}>
                                            Acct: {order.paymentAccountName}
                                        </div>
                                    )}
                                    {order.paymentReference && (
                                        <div className="mt-1 font-mono truncate" title={order.paymentReference}>
                                            Ref: {order.paymentReference}
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="flex gap-2 mt-2">
                                {status === 'waiting' && (
                                    <button
                                        onClick={() => handleCancelOrder(order.id)}
                                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-md transition-colors"
                                        title="Cancel Order"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                )}
                                {nextStatus && (
                                    <Button
                                        size="sm"
                                        className={`w-full flex items-center justify-center gap-1 ${status === 'waiting' && index !== 0 ? 'bg-gray-600 hover:bg-gray-700' : ''}`}
                                        onClick={() => {
                                            if (status === 'waiting' && index !== 0) {
                                                if (window.confirm(`⚠️ Are you sure you want to skip the previous ${index} order(s)?\n\nIt is recommended to serve orders in sequence.`)) {
                                                    updateOrderStatus(order.id, nextStatus);
                                                }
                                            } else {
                                                updateOrderStatus(order.id, nextStatus);
                                            }
                                        }}
                                        title={status === 'waiting' && index !== 0 ? "Click to skip previous orders" : ""}
                                    >
                                        {actionLabel || 'Next'}
                                    </Button>
                                )}
                            </div>
                        </Card>
                    ))}
                    {columnOrders.length === 0 && (
                        <div className="text-center py-8 text-gray-400 text-sm italic">
                            No orders
                        </div>
                    )}
                </div>
            </div>
        );
    };

    if (loading) {
        return <div className="flex h-full items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>;
    }

    return (
        <div className="h-[calc(100vh-100px)] flex flex-col">
            <div className="mb-6 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Queue Management</h1>
                    <p className="text-gray-500">Real-time kitchen display system</p>
                </div>
                <div className="flex gap-4 text-sm">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        <span>Connected</span>
                    </div>
                </div>
            </div>

            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 overflow-hidden">
                <StatusColumn
                    title="Waiting"
                    status="waiting"
                    icon={Clock}
                    color="border-gray-400"
                    nextStatus="preparing"
                    actionLabel="Start Preparing"
                />
                <StatusColumn
                    title="Preparing"
                    status="preparing"
                    icon={Coffee}
                    color="border-yellow-400"
                    nextStatus="ready"
                    actionLabel="Mark Ready"
                />
                <StatusColumn
                    title="Ready to Serve"
                    status="ready"
                    icon={CheckCircle}
                    color="border-green-400"
                    nextStatus="completed"
                    actionLabel="Complete Order"
                />
            </div>

            {selectedReceiptOrder && (
                <DigitalReceipt
                    order={selectedReceiptOrder}
                    isOpen={!!selectedReceiptOrder}
                    onClose={() => setSelectedReceiptOrder(null)}
                />
            )}
        </div>
    );
};

export default AdminQueuePage;
