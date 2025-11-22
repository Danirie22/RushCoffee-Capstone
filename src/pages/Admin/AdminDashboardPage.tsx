// Comprehensive Admin Dashboard - Real-time Queue, Inventory & Customer Engagement
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../../firebaseConfig';
import {
    Users, Coffee, DollarSign, BarChart3, Clock, Package,
    AlertTriangle, XCircle, TrendingUp, TrendingDown, Activity,
    ShoppingCart, Star, Eye, ArrowRight, RefreshCw, Zap
} from 'lucide-react';
import StatCard from '../../components/admin/StatCard';
import SalesOverview from '../../components/admin/SalesOverview';
import { QueueItem } from '../../context/OrderContext';

interface DashboardStats {
    revenueToday: number;
    ordersToday: number;
    newCustomersToday: number;
    pendingOrders: number;
    totalCustomers: number;
    avgOrderValue: number;
}

interface InventoryAlert {
    id: string;
    name: string;
    stock: number;
    unit: string;
    lowStockThreshold: number;
    category: string;
}

interface CustomerMetrics {
    totalCustomers: number;
    activeToday: number;
    averageLifetimeValue: number;
    topTierCustomers: number;
}

const AdminDashboardPage: React.FC = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState<DashboardStats>({
        revenueToday: 0,
        ordersToday: 0,
        newCustomersToday: 0,
        pendingOrders: 0,
        totalCustomers: 0,
        avgOrderValue: 0,
    });

    const [yesterdayStats, setYesterdayStats] = useState({
        revenueYesterday: 0,
        ordersYesterday: 0,
        customersYesterday: 0
    });

    // Queue Management State
    const [queueOrders, setQueueOrders] = useState<QueueItem[]>([]);
    const [queueLoading, setQueueLoading] = useState(true);

    // Inventory State
    const [inventoryAlerts, setInventoryAlerts] = useState<InventoryAlert[]>([]);
    const [inventoryLoading, setInventoryLoading] = useState(true);

    // Customer Metrics State
    const [customerMetrics, setCustomerMetrics] = useState<CustomerMetrics>({
        totalCustomers: 0,
        activeToday: 0,
        averageLifetimeValue: 0,
        topTierCustomers: 0,
    });

    const [isLoading, setIsLoading] = useState(true);
    const [lastRefresh, setLastRefresh] = useState(new Date());

    // ======================
    // REAL-TIME DATA FETCHING
    // ======================

    useEffect(() => {
        const today = new Date();
        const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const endOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
        const startOfYesterday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);

        // ===== QUEUE MANAGEMENT LISTENER =====
        const queueQuery = db.collection('orders')
            .where('status', 'in', ['waiting', 'preparing', 'ready']);

        const unsubscribeQueue = queueQuery.onSnapshot(snapshot => {
            const orders: QueueItem[] = [];
            snapshot.forEach(doc => {
                orders.push({
                    id: doc.id,
                    ...doc.data(),
                    timestamp: doc.data().timestamp.toDate(),
                } as QueueItem);
            });
            orders.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
            setQueueOrders(orders);
            setQueueLoading(false);
        }, err => {
            console.error("Error fetching queue:", err);
            setQueueLoading(false);
        });

        // ===== INVENTORY ALERTS LISTENER =====
        const inventoryQuery = db.collection('ingredients');
        const unsubscribeInventory = inventoryQuery.onSnapshot(snapshot => {
            const alerts: InventoryAlert[] = [];
            snapshot.forEach(doc => {
                const data = doc.data();
                // Flag items that are out of stock or low stock
                if (data.stock === 0 || data.stock <= data.lowStockThreshold) {
                    alerts.push({
                        id: doc.id,
                        name: data.name,
                        stock: data.stock,
                        unit: data.unit,
                        lowStockThreshold: data.lowStockThreshold,
                        category: data.category,
                    });
                }
            });
            setInventoryAlerts(alerts);
            setInventoryLoading(false);
        }, err => {
            console.error("Error fetching inventory:", err);
            setInventoryLoading(false);
        });

        // ===== TODAY'S ORDERS LISTENER =====
        const ordersQuery = db.collection('orders')
            .where('timestamp', '>=', startOfToday)
            .where('timestamp', '<', endOfToday);

        const unsubscribeOrders = ordersQuery.onSnapshot(snapshot => {
            let revenue = 0;
            const orderCount = snapshot.size;
            snapshot.forEach(doc => {
                const order = doc.data();
                if (order.status === 'completed') {
                    revenue += order.totalAmount;
                }
            });

            const avgOrderVal = orderCount > 0 ? revenue / orderCount : 0;

            setStats(prev => ({
                ...prev,
                revenueToday: revenue,
                ordersToday: orderCount,
                avgOrderValue: avgOrderVal
            }));
        }, err => console.error("Error fetching today's orders:", err));

        // ===== NEW CUSTOMERS TODAY LISTENER =====
        const usersQuery = db.collection('users')
            .where('createdAt', '>=', startOfToday)
            .where('createdAt', '<', endOfToday);

        const unsubscribeUsers = usersQuery.onSnapshot(snapshot => {
            setStats(prev => ({ ...prev, newCustomersToday: snapshot.size }));
        }, err => console.error("Error fetching new users:", err));

        // ===== PENDING ORDERS LISTENER =====
        const pendingOrdersQuery = db.collection('orders')
            .where('status', 'in', ['waiting', 'preparing']);

        const unsubscribePending = pendingOrdersQuery.onSnapshot(snapshot => {
            setStats(prev => ({ ...prev, pendingOrders: snapshot.size }));
        }, err => console.error("Error fetching pending orders:", err));

        // ===== CUSTOMER METRICS LISTENER =====
        const allUsersQuery = db.collection('users');
        const unsubscribeAllUsers = allUsersQuery.onSnapshot(snapshot => {
            let totalValue = 0;
            let topTier = 0;
            let activeToday = 0;

            snapshot.forEach(doc => {
                const user = doc.data();
                totalValue += user.totalSpent || 0;
                if (user.tier === 'gold' || user.tier === 'silver') {
                    topTier++;
                }
                // Check if user has ordered today
                if (user.lastOrderDate && user.lastOrderDate.toDate() >= startOfToday) {
                    activeToday++;
                }
            });

            setCustomerMetrics({
                totalCustomers: snapshot.size,
                activeToday,
                averageLifetimeValue: snapshot.size > 0 ? totalValue / snapshot.size : 0,
                topTierCustomers: topTier,
            });

            setStats(prev => ({ ...prev, totalCustomers: snapshot.size }));
        }, err => console.error("Error fetching customer metrics:", err));

        // ===== YESTERDAY'S DATA (One-time fetch) =====
        const fetchYesterdayData = async () => {
            try {
                const yesterdayOrdersSnapshot = await db.collection('orders')
                    .where('timestamp', '>=', startOfYesterday)
                    .where('timestamp', '<', startOfToday)
                    .get();

                let revenueYesterday = 0;
                const ordersYesterday = yesterdayOrdersSnapshot.size;

                yesterdayOrdersSnapshot.forEach(doc => {
                    const order = doc.data();
                    if (order.status === 'completed') {
                        revenueYesterday += order.totalAmount;
                    }
                });

                const yesterdayUsersSnapshot = await db.collection('users')
                    .where('createdAt', '>=', startOfYesterday)
                    .where('createdAt', '<', startOfToday)
                    .get();

                const customersYesterday = yesterdayUsersSnapshot.size;

                return { revenueYesterday, ordersYesterday, customersYesterday };
            } catch (error) {
                console.error("Error fetching yesterday's data:", error);
                return { revenueYesterday: 0, ordersYesterday: 0, customersYesterday: 0 };
            }
        };

        fetchYesterdayData().then(yesterday => {
            setYesterdayStats(yesterday);
            setIsLoading(false);
        });

        return () => {
            unsubscribeQueue();
            unsubscribeInventory();
            unsubscribeOrders();
            unsubscribeUsers();
            unsubscribePending();
            unsubscribeAllUsers();
        };
    }, []);

    // Helper to calculate trend
    const getTrend = (current: number, previous: number) => {
        if (previous === 0) return current > 0 ? 100 : 0;
        return Number((((current - previous) / previous) * 100).toFixed(1));
    };

    // Manual refresh handler
    const handleRefresh = () => {
        setLastRefresh(new Date());
        // The real-time listeners will automatically update
    };

    // Queue breakdown
    const queueBreakdown = useMemo(() => ({
        waiting: queueOrders.filter(o => o.status === 'waiting').length,
        preparing: queueOrders.filter(o => o.status === 'preparing').length,
        ready: queueOrders.filter(o => o.status === 'ready').length,
    }), [queueOrders]);

    // Inventory breakdown
    const inventoryBreakdown = useMemo(() => ({
        outOfStock: inventoryAlerts.filter(i => i.stock === 0).length,
        lowStock: inventoryAlerts.filter(i => i.stock > 0 && i.stock <= i.lowStockThreshold).length,
    }), [inventoryAlerts]);

    return (
        <div className="space-y-6">
            {/* Header with refresh */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="font-display text-3xl font-bold text-gray-800">Admin Dashboard</h1>
                    <p className="text-sm text-gray-500 mt-1">Real-time overview of your coffee shop operations</p>
                </div>
                <button
                    onClick={handleRefresh}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700"
                >
                    <RefreshCw className="h-4 w-4" />
                    <span>Last updated: {lastRefresh.toLocaleTimeString()}</span>
                </button>
            </div>

            {/* Primary Stats Grid */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Total Revenue Today"
                    value={`₱${stats.revenueToday.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                    Icon={DollarSign}
                    isLoading={isLoading}
                    color="blue"
                    trend={{
                        value: getTrend(stats.revenueToday, yesterdayStats.revenueYesterday),
                        label: "vs yesterday"
                    }}
                />
                <StatCard
                    title="Orders Today"
                    value={stats.ordersToday}
                    Icon={Coffee}
                    isLoading={isLoading}
                    color="green"
                    trend={{
                        value: getTrend(stats.ordersToday, yesterdayStats.ordersYesterday),
                        label: "vs yesterday"
                    }}
                />
                <StatCard
                    title="New Customers Today"
                    value={stats.newCustomersToday}
                    Icon={Users}
                    isLoading={isLoading}
                    color="yellow"
                    trend={{
                        value: getTrend(stats.newCustomersToday, yesterdayStats.customersYesterday),
                        label: "vs yesterday"
                    }}
                />
                <StatCard
                    title="Pending Orders"
                    value={stats.pendingOrders}
                    Icon={BarChart3}
                    isLoading={isLoading}
                    color="purple"
                />
            </div>

            {/* Secondary Stats Row */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <StatCard
                    title="Avg Order Value"
                    value={`₱${stats.avgOrderValue.toFixed(2)}`}
                    Icon={ShoppingCart}
                    isLoading={isLoading}
                    color="indigo"
                    subtext="Lifetime average"
                />
                <StatCard
                    title="Total Customers"
                    value={customerMetrics.totalCustomers}
                    Icon={Users}
                    isLoading={isLoading}
                    color="emerald"
                    subtext="Registered users"
                />
                <StatCard
                    title="Premium Members"
                    value={customerMetrics.topTierCustomers}
                    Icon={Star}
                    isLoading={isLoading}
                    color="amber"
                    subtext="Silver & Gold tiers"
                />
            </div>

            {/* Real-time Sections Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* QUEUE MANAGEMENT PANEL */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-100">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 bg-blue-600 rounded-lg flex items-center justify-center">
                                    <Activity className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-gray-900">Live Queue</h2>
                                    <p className="text-xs text-gray-600">Real-time order management</p>
                                </div>
                            </div>
                            <button
                                onClick={() => navigate('/admin/queue')}
                                className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Manage <ArrowRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>

                    <div className="p-6">
                        {queueLoading ? (
                            <div className="flex items-center justify-center h-40">
                                <div className="animate-spin h-8 w-8 border-4 border-primary-600 border-t-transparent rounded-full"></div>
                            </div>
                        ) : queueOrders.length === 0 ? (
                            <div className="text-center py-8">
                                <Coffee className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-500 text-sm">No active orders in queue</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {/* Queue Stats */}
                                <div className="grid grid-cols-3 gap-3">
                                    <div className="bg-yellow-50 rounded-lg p-3 text-center">
                                        <p className="text-2xl font-bold text-yellow-700">{queueBreakdown.waiting}</p>
                                        <p className="text-xs text-yellow-600 font-medium mt-1">Waiting</p>
                                    </div>
                                    <div className="bg-blue-50 rounded-lg p-3 text-center">
                                        <p className="text-2xl font-bold text-blue-700">{queueBreakdown.preparing}</p>
                                        <p className="text-xs text-blue-600 font-medium mt-1">Preparing</p>
                                    </div>
                                    <div className="bg-green-50 rounded-lg p-3 text-center">
                                        <p className="text-2xl font-bold text-green-700">{queueBreakdown.ready}</p>
                                        <p className="text-xs text-green-600 font-medium mt-1">Ready</p>
                                    </div>
                                </div>

                                {/* Recent Orders */}
                                <div>
                                    <h3 className="text-sm font-bold text-gray-700 mb-2">Next in Queue</h3>
                                    <div className="space-y-2">
                                        {queueOrders.slice(0, 3).map((order, idx) => (
                                            <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 bg-primary-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                                                        {idx + 1}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-semibold text-gray-900">{order.orderNumber}</p>
                                                        <p className="text-xs text-gray-500">
                                                            {order.orderItems.length} item{order.orderItems.length > 1 ? 's' : ''}
                                                        </p>
                                                    </div>
                                                </div>
                                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${order.status === 'waiting' ? 'bg-yellow-100 text-yellow-700' :
                                                    order.status === 'preparing' ? 'bg-blue-100 text-blue-700' :
                                                        'bg-green-100 text-green-700'
                                                    }`}>
                                                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* INVENTORY ALERTS PANEL */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="bg-gradient-to-r from-orange-50 to-red-50 px-6 py-4 border-b border-gray-100">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 bg-orange-600 rounded-lg flex items-center justify-center">
                                    <Package className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-gray-900">Inventory Alerts</h2>
                                    <p className="text-xs text-gray-600">Stock warnings & alerts</p>
                                </div>
                            </div>
                            <button
                                onClick={() => navigate('/admin/inventory')}
                                className="flex items-center gap-1 px-3 py-1.5 bg-orange-600 text-white text-sm font-semibold rounded-lg hover:bg-orange-700 transition-colors"
                            >
                                Manage <ArrowRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>

                    <div className="p-6">
                        {inventoryLoading ? (
                            <div className="flex items-center justify-center h-40">
                                <div className="animate-spin h-8 w-8 border-4 border-orange-600 border-t-transparent rounded-full"></div>
                            </div>
                        ) : inventoryAlerts.length === 0 ? (
                            <div className="text-center py-8">
                                <Package className="h-12 w-12 text-green-300 mx-auto mb-3" />
                                <p className="text-green-600 text-sm font-medium">All inventory levels are healthy!</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {/* Inventory Stats */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-red-50 rounded-lg p-3 text-center border border-red-100">
                                        <div className="flex items-center justify-center gap-2 mb-1">
                                            <XCircle className="h-4 w-4 text-red-600" />
                                            <p className="text-2xl font-bold text-red-700">{inventoryBreakdown.outOfStock}</p>
                                        </div>
                                        <p className="text-xs text-red-600 font-medium">Out of Stock</p>
                                    </div>
                                    <div className="bg-yellow-50 rounded-lg p-3 text-center border border-yellow-100">
                                        <div className="flex items-center justify-center gap-2 mb-1">
                                            <AlertTriangle className="h-4 w-4 text-yellow-600" />
                                            <p className="text-2xl font-bold text-yellow-700">{inventoryBreakdown.lowStock}</p>
                                        </div>
                                        <p className="text-xs text-yellow-600 font-medium">Low Stock</p>
                                    </div>
                                </div>

                                {/* Alert List */}
                                <div>
                                    <h3 className="text-sm font-bold text-gray-700 mb-2">Recent Alerts</h3>
                                    <div className="space-y-2 max-h-48 overflow-y-auto">
                                        {inventoryAlerts.slice(0, 5).map(item => (
                                            <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                                                <div className="flex items-center gap-3">
                                                    {item.stock === 0 ? (
                                                        <XCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                                                    ) : (
                                                        <AlertTriangle className="h-5 w-5 text-yellow-500 flex-shrink-0" />
                                                    )}
                                                    <div>
                                                        <p className="text-sm font-semibold text-gray-900">{item.name}</p>
                                                        <p className="text-xs text-gray-500">{item.category}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className={`text-sm font-bold ${item.stock === 0 ? 'text-red-600' : 'text-yellow-600'}`}>
                                                        {item.stock} {item.unit}
                                                    </p>
                                                    <p className="text-xs text-gray-400">Threshold: {item.lowStockThreshold}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Customer Engagement Panel */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-4 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-purple-600 rounded-lg flex items-center justify-center">
                            <Zap className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">Customer Engagement</h2>
                            <p className="text-xs text-gray-600">Track customer behavior & loyalty</p>
                        </div>
                    </div>
                </div>

                <div className="p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
                            <div className="flex items-center gap-2 mb-2">
                                <Users className="h-5 w-5 text-purple-600" />
                                <p className="text-sm font-semibold text-purple-900">Active Today</p>
                            </div>
                            <p className="text-3xl font-bold text-purple-700">{customerMetrics.activeToday}</p>
                            <p className="text-xs text-purple-600 mt-1">customers ordered today</p>
                        </div>

                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                            <div className="flex items-center gap-2 mb-2">
                                <DollarSign className="h-5 w-5 text-blue-600" />
                                <p className="text-sm font-semibold text-blue-900">Avg LTV</p>
                            </div>
                            <p className="text-3xl font-bold text-blue-700">₱{customerMetrics.averageLifetimeValue.toFixed(0)}</p>
                            <p className="text-xs text-blue-600 mt-1">lifetime customer value</p>
                        </div>

                        <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-4 border border-amber-200">
                            <div className="flex items-center gap-2 mb-2">
                                <Star className="h-5 w-5 text-amber-600" />
                                <p className="text-sm font-semibold text-amber-900">Premium Tiers</p>
                            </div>
                            <p className="text-3xl font-bold text-amber-700">{customerMetrics.topTierCustomers}</p>
                            <p className="text-xs text-amber-600 mt-1">Silver & Gold members</p>
                        </div>

                        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
                            <div className="flex items-center gap-2 mb-2">
                                <TrendingUp className="h-5 w-5 text-green-600" />
                                <p className="text-sm font-semibold text-green-900">Growth Rate</p>
                            </div>
                            <p className="text-3xl font-bold text-green-700">
                                +{getTrend(stats.newCustomersToday, yesterdayStats.customersYesterday).toFixed(0)}%
                            </p>
                            <p className="text-xs text-green-600 mt-1">vs yesterday</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sales Overview Chart */}
            <div className="mt-8">
                <SalesOverview />
            </div>
        </div>
    );
};

export default AdminDashboardPage;
