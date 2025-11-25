import React, { useState, useEffect } from 'react';
import { db } from '../../firebaseConfig';
import { QueueItem } from '../../context/OrderContext';
import { Clock, Coffee, CheckCircle, AlertCircle, XCircle, Play, Trash2 } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { useCart } from '../../context/CartContext';

type OrderStatus = 'waiting' | 'preparing' | 'ready' | 'completed' | 'cancelled';

const AdminQueuePage: React.FC = () => {
    const [orders, setOrders] = useState<QueueItem[]>([]);
    const [loading, setLoading] = useState(true);
    const { showToast } = useCart();

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

            await db.collection('orders').doc(orderId).update(updateData);
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
                    {columnOrders.map(order => (
                        <Card key={order.id} className="p-3 shadow-sm hover:shadow-md transition-shadow bg-white">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <span className="font-bold text-lg">#{order.orderNumber}</span>
                                    <p className="text-xs text-gray-500">{order.customerName}</p>
                                </div>
                                <span className="text-xs text-gray-400">
                                    {order.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>

                            <div className="space-y-1 mb-3">
                                {(order.orderItems || []).map((item, idx) => (
                                    <div key={idx} className="text-sm flex justify-between">
                                        <span className="text-gray-700">{item.quantity}x {item.productName}</span>
                                    </div>
                                ))}
                            </div>

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
                                        className="w-full flex items-center justify-center gap-1"
                                        onClick={() => updateOrderStatus(order.id, nextStatus)}
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
        </div>
    );
};

export default AdminQueuePage;
