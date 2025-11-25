import React, { useState, useEffect } from 'react';
import { db } from '../../firebaseConfig';
import { QueueItem } from '../../context/OrderContext';
import { Search, Filter, Calendar, ChevronDown, Eye, CreditCard, Banknote, AlertCircle } from 'lucide-react';

const AdminOrdersHistoryPage: React.FC = () => {
    const [orders, setOrders] = useState<QueueItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [filterDate, setFilterDate] = useState<string>('all');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const unsubscribe = db.collection('orders')
            .orderBy('timestamp', 'desc')
            .onSnapshot((snapshot) => {
                const fetchedOrders = snapshot.docs.map(doc => {
                    const data = doc.data();
                    return {
                        id: doc.id,
                        ...data,
                        orderItems: data.orderItems || data.items || [], // Handle both new and old field names
                        timestamp: data.timestamp?.toDate ? data.timestamp.toDate() : (data.timestamp ? new Date(data.timestamp) : new Date()),
                        totalAmount: data.totalAmount || data.subtotal || 0, // Handle missing totalAmount
                    };
                }) as QueueItem[];
                setOrders(fetchedOrders);
                setLoading(false);
            }, (error) => {
                console.error("Error fetching orders:", error);
                setLoading(false);
            });

        return () => unsubscribe();
    }, []);

    const filteredOrders = orders.filter(order => {
        // Status Filter
        const matchesStatus = filterStatus === 'all' || order.status === filterStatus;

        // Search Filter
        const matchesSearch =
            order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (order.customerName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (order.orderNumber || '').toLowerCase().includes(searchTerm.toLowerCase());

        // Date Filter
        let matchesDate = true;
        if (filterDate !== 'all') {
            const orderDate = new Date(order.timestamp);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (filterDate === 'today') {
                matchesDate = orderDate >= today;
            } else if (filterDate === 'week') {
                const lastWeek = new Date(today);
                lastWeek.setDate(today.getDate() - 7);
                matchesDate = orderDate >= lastWeek;
            } else if (filterDate === 'month') {
                const lastMonth = new Date(today);
                lastMonth.setMonth(today.getMonth() - 1);
                matchesDate = orderDate >= lastMonth;
            }
        }

        return matchesStatus && matchesSearch && matchesDate;
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return 'bg-green-100 text-green-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            case 'preparing': return 'bg-yellow-100 text-yellow-800';
            case 'ready': return 'bg-blue-100 text-blue-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getPaymentBadge = (method: string) => {
        if (method === 'gcash') {
            return (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                    <CreditCard className="w-3 h-3" /> GCash
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-green-50 text-green-700 border border-green-100">
                <Banknote className="w-3 h-3" /> Cash
            </span>
        );
    };

    const formatDate = (date: any) => {
        try {
            if (!date) return 'N/A';
            const d = new Date(date);
            if (isNaN(d.getTime())) return 'Invalid Date';
            return new Intl.DateTimeFormat('en-US', {
                month: 'short',
                day: 'numeric',
                hour: 'numeric',
                minute: 'numeric',
                hour12: true
            }).format(d);
        } catch (e) {
            return 'Error';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Order History</h1>
                    <p className="text-gray-500">View and manage all past orders</p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col lg:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search by Order ID, Name, or Order #"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-coffee-500 focus:border-transparent outline-none"
                    />
                </div>
                <div className="flex flex-wrap gap-2">
                    {/* Status Filter */}
                    <div className="relative">
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="appearance-none bg-white border border-gray-200 text-gray-700 py-2 px-4 pr-8 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500 cursor-pointer"
                        >
                            <option value="all">All Status</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                            <option value="ready">Ready</option>
                            <option value="preparing">Preparing</option>
                            <option value="waiting">Waiting</option>
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                    </div>

                    {/* Date Filter */}
                    <div className="relative">
                        <select
                            value={filterDate}
                            onChange={(e) => setFilterDate(e.target.value)}
                            className="appearance-none bg-white border border-gray-200 text-gray-700 py-2 px-4 pr-8 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500 cursor-pointer"
                        >
                            <option value="all">All Dates</option>
                            <option value="today">Today</option>
                            <option value="week">Last 7 Days</option>
                            <option value="month">Last 30 Days</option>
                        </select>
                        <Calendar className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                    </div>
                </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                                <th className="px-6 py-4">Order Details</th>
                                <th className="px-6 py-4">Customer</th>
                                <th className="px-6 py-4">Items</th>
                                <th className="px-6 py-4">Payment</th>
                                <th className="px-6 py-4">Total</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                                        Loading orders...
                                    </td>
                                </tr>
                            ) : filteredOrders.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                                        No orders found matching your criteria.
                                    </td>
                                </tr>
                            ) : (
                                filteredOrders.map((order) => (
                                    <tr key={order.id} className="hover:bg-gray-50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900">#{order.orderNumber}</div>
                                            <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                {formatDate(order.timestamp)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 font-medium">
                                            {order.customerName}
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">
                                            <span title={(order.orderItems || []).map(i => `${i.quantity}x ${i.productName}`).join(', ')} className="text-sm">
                                                {(order.orderItems || []).length} items
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {getPaymentBadge(order.paymentMethod || 'cash')}
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-900">
                                            ₱{order.totalAmount.toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                <span className={`inline-flex w-fit px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusColor(order.status)}`}>
                                                    {order.status}
                                                </span>
                                                {order.status === 'cancelled' && (
                                                    <span className="text-xs text-red-500 flex items-center gap-1">
                                                        <AlertCircle className="w-3 h-3" />
                                                        Cancelled
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button className="text-coffee-600 hover:text-coffee-700 font-medium text-sm flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Eye className="w-4 h-4" />
                                                View
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination (Placeholder) */}
                {!loading && filteredOrders.length > 0 && (
                    <div className="px-6 py-4 border-t border-gray-100 flex justify-between items-center text-sm text-gray-600 bg-gray-50/50">
                        <span>Showing {filteredOrders.length} orders</span>
                        <div className="flex gap-2">
                            <button className="px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-white hover:shadow-sm disabled:opacity-50 transition-all text-xs font-medium" disabled>Previous</button>
                            <button className="px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-white hover:shadow-sm disabled:opacity-50 transition-all text-xs font-medium" disabled>Next</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminOrdersHistoryPage;
