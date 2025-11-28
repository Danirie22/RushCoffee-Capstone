import React, { useState, useEffect } from 'react';
import { db } from '../../firebaseConfig';
import { QueueItem } from '../../context/OrderContext';
import { Search, Filter, Calendar, ChevronDown, Eye, CreditCard, Banknote, AlertCircle, ChevronLeft, ChevronRight, Package, Clock, User, Store } from 'lucide-react';
import OrderDetailsModal from '../../components/employee/OrderDetailsModal';

const AdminOrdersHistoryPage: React.FC = () => {
    const [orders, setOrders] = useState<QueueItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [filterDate, setFilterDate] = useState<string>('all');
    const [searchTerm, setSearchTerm] = useState('');

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Modal State
    const [selectedOrder, setSelectedOrder] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

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

    // Pagination Logic
    const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
    const paginatedOrders = filteredOrders.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    // Reset page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [filterStatus, filterDate, searchTerm]);

    const handleViewDetails = (order: any) => {
        // Debug: Log the raw order data to see what fields exist
        console.log('📦 Raw order data from Firestore:', {
            id: order.id,
            employeeId: order.employeeId,
            employeeName: order.employeeName,
            hasEmployeeId: 'employeeId' in order,
            hasEmployeeName: 'employeeName' in order,
            allKeys: Object.keys(order)
        });

        // Map QueueItem to the structure expected by OrderDetailsModal
        const mappedOrder = {
            ...order,
            // Map orderItems to items for the modal
            items: (order.orderItems || []).map((item: any) => ({
                ...item,
                sizeLabel: item.sizeLabel || item.size || 'Standard' // Map size to sizeLabel
            })),
            orderItems: order.orderItems || [], // Keep for backward compatibility
            subtotal: order.totalAmount,
            createdAt: {
                toDate: () => new Date(order.timestamp)
            },
            // Safely access paymentDetails (exists in Firestore but not in QueueItem type)
            paymentDetails: order.paymentDetails || {
                amountReceived: order.totalAmount || 0,
                change: 0
            },
            // Safely access employeeId and employeeName (exist in Firestore but not in QueueItem type)
            employeeId: order.employeeId || '',
            employeeName: order.employeeName || 'Unknown Employee'
        };

        console.log('📤 Mapped order data being sent to modal:', {
            employeeId: mappedOrder.employeeId,
            employeeName: mappedOrder.employeeName
        });

        setSelectedOrder(mappedOrder);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedOrder(null);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'cancelled': return 'bg-rose-100 text-rose-700 border-rose-200';
            case 'preparing': return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'ready': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'waiting': return 'bg-gray-100 text-gray-700 border-gray-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const getPaymentBadge = (method: string) => {
        if (method === 'gcash') {
            return (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                    <CreditCard className="w-3.5 h-3.5" /> GCash
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                <Banknote className="w-3.5 h-3.5" /> Cash
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

    const getCustomerBadge = (name: string | undefined) => {
        if (name) {
            return (
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-blue-50 text-blue-600 ring-1 ring-blue-100">
                        <User className="w-4 h-4" />
                    </div>
                    <div>
                        <div className="font-medium text-gray-900">{name}</div>
                        <div className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Online</div>
                    </div>
                </div>
            );
        }
        return (
            <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-orange-50 text-orange-600 ring-1 ring-orange-100">
                    <Store className="w-4 h-4" />
                </div>
                <div>
                    <div className="font-medium text-gray-900">Walk-in</div>
                    <div className="text-[10px] font-bold text-orange-600 uppercase tracking-wider">In-Store</div>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Order History</h1>
                    <p className="text-gray-500 mt-1">View and manage all past orders</p>
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
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                    />
                </div>
                <div className="flex flex-wrap gap-3">
                    {/* Status Filter */}
                    <div className="relative min-w-[140px]">
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="w-full appearance-none bg-white border border-gray-200 text-gray-700 py-2.5 px-4 pr-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer hover:border-gray-300 transition-colors"
                        >
                            <option value="all">All Status</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                            <option value="ready">Ready</option>
                            <option value="preparing">Preparing</option>
                            <option value="waiting">Waiting</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                    </div>

                    {/* Date Filter */}
                    <div className="relative min-w-[140px]">
                        <select
                            value={filterDate}
                            onChange={(e) => setFilterDate(e.target.value)}
                            className="w-full appearance-none bg-white border border-gray-200 text-gray-700 py-2.5 px-4 pr-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer hover:border-gray-300 transition-colors"
                        >
                            <option value="all">All Dates</option>
                            <option value="today">Today</option>
                            <option value="week">Last 7 Days</option>
                            <option value="month">Last 30 Days</option>
                        </select>
                        <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600 mx-auto mb-4"></div>
                        <p className="text-gray-500">Loading orders...</p>
                    </div>
                ) : filteredOrders.length === 0 ? (
                    <div className="p-12 text-center flex flex-col items-center">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                            <Package className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-1">No orders found</h3>
                        <p className="text-gray-500">Try adjusting your search or filters</p>
                    </div>
                ) : (
                    <>
                        {/* Desktop Table View */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-gray-50/50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                                        <th className="px-6 py-4 text-left">Order Details</th>
                                        <th className="px-6 py-4 text-center">Customer</th>
                                        <th className="px-6 py-4 text-center">Ordered Items</th>
                                        <th className="px-6 py-4 text-center">Payment</th>
                                        <th className="px-6 py-4 text-center">Total</th>
                                        <th className="px-6 py-4 text-center">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {paginatedOrders.map((order) => (
                                        <tr
                                            key={order.id}
                                            onClick={() => handleViewDetails(order)}
                                            className="hover:bg-gray-50/80 transition-colors group cursor-pointer"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="font-semibold text-gray-900">{order.orderNumber}</div>
                                                <div className="text-xs text-gray-500 mt-1 flex items-center gap-1.5">
                                                    <Clock className="w-3 h-3" />
                                                    {formatDate(order.timestamp)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex justify-center">
                                                    {getCustomerBadge(order.customerName)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="space-y-1 inline-block text-left">
                                                    {(order.orderItems || []).slice(0, 2).map((item: any, idx: number) => (
                                                        <div key={idx} className="text-sm text-gray-600 flex items-center gap-2">
                                                            <span className="font-medium text-gray-900 w-4 text-right">{item.quantity || item.qty || 1}x</span>
                                                            <span className="truncate max-w-[150px]" title={item.productName}>{item.productName}</span>
                                                        </div>
                                                    ))}
                                                    {(order.orderItems || []).length > 2 && (
                                                        <div className="text-xs text-primary-600 font-medium pl-6">
                                                            +{(order.orderItems || []).length - 2} more items
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="flex justify-center">
                                                    {getPaymentBadge(order.paymentMethod || 'cash')}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 font-bold text-gray-900 text-center">
                                                ₱{order.totalAmount.toFixed(2)}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="flex justify-center">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(order.status)} capitalize`}>
                                                        {order.status}
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Card View */}
                        <div className="md:hidden divide-y divide-gray-100">
                            {paginatedOrders.map((order) => (
                                <div
                                    key={order.id}
                                    onClick={() => handleViewDetails(order)}
                                    className="p-4 space-y-3 hover:bg-gray-50 transition-colors cursor-pointer active:bg-gray-100"
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="font-bold text-gray-900">{order.orderNumber}</div>
                                            <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {formatDate(order.timestamp)}
                                            </div>
                                        </div>
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(order.status)} capitalize`}>
                                            {order.status}
                                        </span>
                                    </div>

                                    <div className="flex justify-between items-center text-sm">
                                        <div>
                                            {getCustomerBadge(order.customerName)}
                                        </div>
                                        <div className="font-bold text-gray-900">₱{order.totalAmount.toFixed(2)}</div>
                                    </div>

                                    <div className="bg-gray-50 rounded-lg p-3 space-y-1.5">
                                        {(order.orderItems || []).map((item: any, idx: number) => (
                                            <div key={idx} className="text-sm text-gray-600 flex justify-between items-center">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium text-gray-900">{item.quantity || item.qty || 1}x</span>
                                                    <span>{item.productName}</span>
                                                </div>
                                                {item.price && <span className="text-gray-400 text-xs">₱{item.price}</span>}
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex justify-between items-center pt-2">
                                        <div className="text-sm text-gray-500">
                                            {order.paymentMethod === 'gcash' ? 'GCash' : 'Cash'}
                                        </div>
                                        <div className="text-primary-600 font-medium text-sm flex items-center gap-1 bg-primary-50 px-3 py-1.5 rounded-lg">
                                            View Details
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        <div className="px-6 py-4 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-50/30">
                            <span className="text-sm text-gray-500">
                                Showing <span className="font-medium text-gray-900">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-medium text-gray-900">{Math.min(currentPage * itemsPerPage, filteredOrders.length)}</span> of <span className="font-medium text-gray-900">{filteredOrders.length}</span> results
                            </span>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="p-2 border border-gray-200 rounded-lg hover:bg-white hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all text-gray-600"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <div className="flex items-center gap-1">
                                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                        // Simple pagination logic to show window around current page
                                        let pageNum = i + 1;
                                        if (totalPages > 5) {
                                            if (currentPage > 3) {
                                                pageNum = currentPage - 2 + i;
                                            }
                                            if (pageNum > totalPages) {
                                                pageNum = totalPages - 4 + i;
                                            }
                                        }
                                        return (
                                            <button
                                                key={pageNum}
                                                onClick={() => handlePageChange(pageNum)}
                                                className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${currentPage === pageNum
                                                    ? 'bg-primary-600 text-white shadow-sm'
                                                    : 'text-gray-600 hover:bg-gray-100'
                                                    }`}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    })}
                                </div>
                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className="p-2 border border-gray-200 rounded-lg hover:bg-white hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all text-gray-600"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Order Details Modal */}
            {selectedOrder && (
                <OrderDetailsModal
                    order={selectedOrder}
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                />
            )}
        </div>
    );
};

export default AdminOrdersHistoryPage;
