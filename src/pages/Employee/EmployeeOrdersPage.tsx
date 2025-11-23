import React, { useState, useEffect } from 'react';
import { useOrder } from '../../context/OrderContext';
import { db } from '../../firebaseConfig';
import { QueueItem } from '../../context/OrderContext';
import { Clock, Coffee, CheckCircle, XCircle, Trash2, Play } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { useCart } from '../../context/CartContext';

type OrderStatus = 'waiting' | 'preparing' | 'ready' | 'completed' | 'cancelled';

const EmployeeOrdersPage: React.FC = () => {
    const { orderHistory } = useOrder();
    const [orders, setOrders] = useState<QueueItem[]>([]);
    const [loading, setLoading] = useState(true);
    const { showToast } = useCart();

    useEffect(() => {
        // Fetch all orders from Firestore
        const unsubscribe = db
            .collection('orders')
            .orderBy('timestamp', 'desc')
            .limit(50)
            .onSnapshot((snapshot) => {
                const fetchedOrders = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                    timestamp: doc.data().timestamp?.toDate() || new Date(),
                })) as QueueItem[];

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

            if (newStatus === 'cancelled') {
                showToast('Order cancelled successfully.');
            }
        } catch (error) {
            console.error('Error updating order status:', error);
            showToast('Failed to update order status.');
        }
    };

    const handleCancelOrder = (orderId: string) => {
        if (window.confirm('Are you sure you want to cancel this order? This action cannot be undone.')) {
            const reason = window.prompt('Please enter a reason for cancellation (optional):', 'Out of Stock');
            updateOrderStatus(orderId, 'cancelled', reason || 'No reason provided');
        }
    };

    const getStatusColor = (status: OrderStatus) => {
        switch (status) {
            case 'waiting':
                return 'bg-gray-100 text-gray-700';
            case 'preparing':
                return 'bg-yellow-100 text-yellow-700';
            case 'ready':
                return 'bg-green-100 text-green-700';
            case 'completed':
                return 'bg-blue-100 text-blue-700';
            case 'cancelled':
                return 'bg-red-100 text-red-700';
            default:
                return 'bg-gray-100 text-gray-700';
        }
    };

    const getStatusIcon = (status: OrderStatus) => {
        switch (status) {
            case 'waiting':
                return <Clock className="h-4 w-4" />;
            case 'preparing':
                return <Coffee className="h-4 w-4" />;
            case 'ready':
                return <CheckCircle className="h-4 w-4" />;
            case 'completed':
                return <CheckCircle className="h-4 w-4" />;
            case 'cancelled':
                return <XCircle className="h-4 w-4" />;
            default:
                return <Clock className="h-4 w-4" />;
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    // Include 'waiting' in active orders so staff can see them and start preparing
    const activeOrders = orders.filter(
        (order) => order.status === 'waiting' || order.status === 'preparing' || order.status === 'ready'
    );

    // Sort active orders: Ready first, then Preparing, then Waiting (FIFO for waiting)
    activeOrders.sort((a, b) => {
        const statusPriority = { ready: 0, preparing: 1, waiting: 2 };
        const statusDiff = (statusPriority[a.status as keyof typeof statusPriority] || 99) - (statusPriority[b.status as keyof typeof statusPriority] || 99);
        if (statusDiff !== 0) return statusDiff;
        return a.timestamp.getTime() - b.timestamp.getTime(); // Oldest first
    });

    const otherOrders = orders.filter(
        (order) => order.status === 'completed' || order.status === 'cancelled'
    );

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Order Management</h1>
                <p className="text-gray-500 mt-2">Manage and update customer orders</p>
            </div>

            {/* Active Orders */}
            <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Active Orders ({activeOrders.length})
                </h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {activeOrders.map((order) => (
                        <Card key={order.id} className={`p-4 border-l-4 ${order.status === 'ready' ? 'border-l-green-500' :
                                order.status === 'preparing' ? 'border-l-yellow-500' :
                                    'border-l-gray-300'
                            }`}>
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <h3 className="font-semibold text-lg">Order #{order.orderNumber}</h3>
                                    <p className="text-sm text-gray-500">
                                        {order.timestamp.toLocaleTimeString([], {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </p>
                                </div>
                                <span
                                    className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${getStatusColor(
                                        order.status as OrderStatus
                                    )}`}
                                >
                                    {getStatusIcon(order.status as OrderStatus)}
                                    <span className="capitalize">{order.status}</span>
                                </span>
                            </div>

                            <div className="mb-4 space-y-1">
                                {order.orderItems.map((item, idx) => (
                                    <p key={idx} className="text-sm text-gray-700">
                                        {item.quantity}x {item.productName}
                                        {item.customizations && Object.keys(item.customizations).length > 0 && (
                                            <span className="text-gray-500">
                                                {' '}
                                                ({Object.values(item.customizations).join(', ')})
                                            </span>
                                        )}
                                    </p>
                                ))}
                            </div>

                            <div className="flex gap-2 mt-auto pt-2 border-t border-gray-100">
                                {order.status === 'waiting' && (
                                    <>
                                        <Button
                                            size="sm"
                                            variant="secondary"
                                            onClick={() => handleCancelOrder(order.id)}
                                            className="text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200"
                                        >
                                            <Trash2 className="h-4 w-4 mr-1" /> Cancel
                                        </Button>
                                        <Button
                                            size="sm"
                                            onClick={() => updateOrderStatus(order.id, 'preparing')}
                                            className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white"
                                        >
                                            <Play className="h-4 w-4 mr-1" /> Start
                                        </Button>
                                    </>
                                )}
                                {order.status === 'preparing' && (
                                    <Button
                                        size="sm"
                                        onClick={() => updateOrderStatus(order.id, 'ready')}
                                        className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                                    >
                                        <CheckCircle className="h-4 w-4 mr-1" /> Mark Ready
                                    </Button>
                                )}
                                {order.status === 'ready' && (
                                    <Button
                                        size="sm"
                                        onClick={() => updateOrderStatus(order.id, 'completed')}
                                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                                    >
                                        <CheckCircle className="h-4 w-4 mr-1" /> Complete
                                    </Button>
                                )}
                            </div>
                        </Card>
                    ))}
                </div>
                {activeOrders.length === 0 && (
                    <div className="text-center py-12 bg-gray-50 rounded-lg">
                        <Coffee className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">No active orders at the moment</p>
                    </div>
                )}
            </div>

            {/* Recent Orders */}
            <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent History</h2>
                <Card>
                    <div className="divide-y">
                        {otherOrders.slice(0, 10).map((order) => (
                            <div key={order.id} className="p-4 flex items-center justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3">
                                        <span className="font-semibold">#{order.orderNumber}</span>
                                        <span
                                            className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${getStatusColor(
                                                order.status as OrderStatus
                                            )}`}
                                        >
                                            {getStatusIcon(order.status as OrderStatus)}
                                            <span className="capitalize">{order.status}</span>
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-500 mt-1">
                                        {order.timestamp.toLocaleString()}
                                    </p>
                                    {order.status === 'cancelled' && order.cancellationReason && (
                                        <p className="text-xs text-red-500 mt-1">
                                            Reason: {order.cancellationReason}
                                        </p>
                                    )}
                                </div>
                                <div className="text-right">
                                    <p className="font-semibold text-gray-900">
                                        ₱{order.totalAmount.toFixed(2)}
                                    </p>
                                    <p className="text-sm text-gray-500">{order.orderItems.length} items</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default EmployeeOrdersPage;
