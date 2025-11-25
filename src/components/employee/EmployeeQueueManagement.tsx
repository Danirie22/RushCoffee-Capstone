import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { Clock, CheckCircle, XCircle, Package } from 'lucide-react';
import { updateOrderStatus, OrderData, OrderItem } from '../../services/orderService';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import OrderDetailsModal from './OrderDetailsModal';

const EmployeeQueueManagement: React.FC = () => {
    const [orders, setOrders] = useState<(OrderData & { id: string })[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'preparing' | 'ready'>('all');
    const [selectedOrder, setSelectedOrder] = useState<(OrderData & { id: string }) | null>(null);

    // Real-time listener for orders
    useEffect(() => {
        const ordersCollection = collection(db, 'orders');

        // Query for active orders (not completed or cancelled)
        const q = query(
            ordersCollection,
            where('status', 'in', ['preparing', 'ready']),
            orderBy('createdAt', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const ordersData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data() as OrderData
            }));

            setOrders(ordersData);
            setLoading(false);
        }, (error) => {
            console.error('Error fetching orders:', error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // Filter orders
    const filteredOrders = orders.filter(order => {
        if (filter === 'all') return true;
        return order.status === filter;
    });

    // Handle status update
    const handleStatusUpdate = async (orderId: string, newStatus: 'preparing' | 'ready' | 'completed') => {
        try {
            await updateOrderStatus(orderId, newStatus);
        } catch (error) {
            console.error('Failed to update status:', error);
            alert('Failed to update order status. Please try again.');
        }
    };

    // Get status badge
    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'preparing':
                return <Badge className="bg-yellow-100 text-yellow-800">🟡 Preparing</Badge>;
            case 'ready':
                return <Badge className="bg-green-100 text-green-800">🟢 Ready for Pickup</Badge>;
            case 'completed':
                return <Badge className="bg-gray-100 text-gray-800">⚫ Completed</Badge>;
            default:
                return <Badge>{status}</Badge>;
        }
    };

    // Format timestamp
    const formatTime = (timestamp: any) => {
        if (!timestamp) return '';
        const date = timestamp.toDate();
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin h-12 w-12 border-4 border-coffee-600 border-t-transparent rounded-full"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Queue Management</h1>
                    <p className="text-gray-500">Manage active orders and update their status</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border">
                    <Package className="h-5 w-5 text-coffee-600" />
                    <span className="font-semibold text-gray-900">{filteredOrders.length}</span>
                    <span className="text-gray-500 text-sm">Active Orders</span>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2">
                <button
                    onClick={() => setFilter('all')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'all'
                        ? 'bg-coffee-600 text-white shadow-sm'
                        : 'bg-white text-gray-600 hover:bg-gray-50'
                        }`}
                >
                    All ({orders.length})
                </button>
                <button
                    onClick={() => setFilter('preparing')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'preparing'
                        ? 'bg-yellow-500 text-white shadow-sm'
                        : 'bg-white text-gray-600 hover:bg-gray-50'
                        }`}
                >
                    Preparing ({orders.filter(o => o.status === 'preparing').length})
                </button>
                <button
                    onClick={() => setFilter('ready')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'ready'
                        ? 'bg-green-500 text-white shadow-sm'
                        : 'bg-white text-gray-600 hover:bg-gray-50'
                        }`}
                >
                    Ready ({orders.filter(o => o.status === 'ready').length})
                </button>
            </div>

            {/* Orders Grid */}
            {filteredOrders.length === 0 ? (
                <Card className="p-12 text-center">
                    <div className="inline-flex h-16 w-16 rounded-full bg-gray-100 items-center justify-center mb-4">
                        <Package className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Active Orders</h3>
                    <p className="text-gray-500">All caught up! New orders will appear here.</p>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredOrders.map(order => (
                        <Card
                            key={order.id}
                            className="p-5 hover:shadow-lg transition-shadow cursor-pointer"
                            onClick={() => setSelectedOrder(order)}
                        >
                            {/* Order Header */}
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h3 className="font-bold text-lg text-gray-900">{order.orderNumber}</h3>
                                    <div className="flex items-center gap-1.5 text-sm text-gray-500 mt-1">
                                        <Clock className="h-4 w-4" />
                                        <span>{formatTime(order.createdAt)}</span>
                                    </div>
                                </div>
                                {getStatusBadge(order.status)}
                            </div>

                            {/* Order Items */}
                            <div className="mb-4 p-3 bg-gray-50 rounded-lg max-h-40 overflow-y-auto">
                                {order.items.map((item: OrderItem, idx: number) => (
                                    <div key={idx} className="flex justify-between text-sm py-1">
                                        <span className="text-gray-700">
                                            {item.quantity}x {item.productName}{' '}
                                            <span className="text-gray-500">({item.sizeLabel})</span>
                                        </span>
                                        <span className="font-medium text-gray-900">₱{item.price * item.quantity}</span>
                                    </div>
                                ))}
                                <div className="border-t border-gray-200 mt-2 pt-2 flex justify-between font-bold">
                                    <span>Total</span>
                                    <span className="text-coffee-600">₱{order.subtotal.toFixed(2)}</span>
                                </div>
                            </div>

                            {/* Payment Info */}
                            <div className="mb-4 text-xs text-gray-500">
                                <span className="capitalize">{order.paymentMethod}</span> • {order.employeeName}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-2">
                                {order.status === 'preparing' && (
                                    <button
                                        onClick={() => handleStatusUpdate(order.id, 'ready')}
                                        className="flex-1 py-2 px-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-1.5"
                                    >
                                        <CheckCircle className="h-4 w-4" />
                                        Mark Ready
                                    </button>
                                )}
                                {order.status === 'ready' && (
                                    <button
                                        onClick={() => handleStatusUpdate(order.id, 'completed')}
                                        className="flex-1 py-2 px-3 bg-gray-800 hover:bg-gray-900 text-white rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-1.5"
                                    >
                                        <CheckCircle className="h-4 w-4" />
                                        Complete
                                    </button>
                                )}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (window.confirm('Are you sure you want to cancel this order?')) {
                                            handleStatusUpdate(order.id, 'cancelled');
                                        }
                                    }}
                                    className="py-2 px-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-1.5"
                                    title="Cancel Order"
                                >
                                    <XCircle className="h-4 w-4" />
                                </button>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {/* Order Details Modal */}
            {selectedOrder && (
                <OrderDetailsModal
                    order={selectedOrder}
                    isOpen={!!selectedOrder}
                    onClose={() => setSelectedOrder(null)}
                    onStatusUpdate={handleStatusUpdate}
                />
            )}
        </div>
    );
};

export default EmployeeQueueManagement;
