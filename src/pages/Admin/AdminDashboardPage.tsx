import React, { useState, useEffect } from 'react';
import { db } from '../../firebaseConfig';
import { Users, Coffee, DollarSign, BarChart3 } from 'lucide-react';
import StatCard from '../../components/admin/StatCard';
import SalesOverview from '../../components/admin/SalesOverview';

const AdminDashboardPage: React.FC = () => {
    const [stats, setStats] = useState({
        revenueToday: 0,
        ordersToday: 0,
        newCustomersToday: 0,
        pendingOrders: 0,
    });
    const [trends, setTrends] = useState({
        revenue: 0,
        orders: 0,
        customers: 0
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const today = new Date();
        const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const endOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

        const startOfYesterday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
        const endOfYesterday = new Date(today.getFullYear(), today.getMonth(), today.getDate());

        // --- Real-time Listeners for TODAY ---

        // Listener for today's orders (for revenue and order count)
        const ordersQuery = db.collection('orders').where('timestamp', '>=', startOfToday).where('timestamp', '<', endOfToday);
        const unsubscribeOrders = ordersQuery.onSnapshot(snapshot => {
            let revenue = 0;
            const orderCount = snapshot.size;
            snapshot.forEach(doc => {
                const order = doc.data();
                if (order.status === 'completed') {
                    revenue += order.totalAmount;
                }
            });
            setStats(prev => ({ ...prev, revenueToday: revenue, ordersToday: orderCount }));
        }, err => console.error("Error fetching today's orders:", err));

        // Listener for new customers today
        const usersQuery = db.collection('users').where('createdAt', '>=', startOfToday).where('createdAt', '<', endOfToday);
        const unsubscribeUsers = usersQuery.onSnapshot(snapshot => {
            setStats(prev => ({ ...prev, newCustomersToday: snapshot.size }));
        }, err => console.error("Error fetching new users:", err));

        // Listener for pending orders
        const pendingOrdersQuery = db.collection('orders').where('status', 'in', ['waiting', 'preparing']);
        const unsubscribePending = pendingOrdersQuery.onSnapshot(snapshot => {
            setStats(prev => ({ ...prev, pendingOrders: snapshot.size }));
        }, err => console.error("Error fetching pending orders:", err));


        // --- One-time Fetch for YESTERDAY (for trends) ---
        const fetchYesterdayData = async () => {
            try {
                // Yesterday's Orders
                const yesterdayOrdersSnapshot = await db.collection('orders')
                    .where('timestamp', '>=', startOfYesterday)
                    .where('timestamp', '<', endOfYesterday)
                    .get();

                let revenueYesterday = 0;
                let ordersYesterday = yesterdayOrdersSnapshot.size;

                yesterdayOrdersSnapshot.forEach(doc => {
                    const order = doc.data();
                    if (order.status === 'completed') {
                        revenueYesterday += order.totalAmount;
                    }
                });

                // Yesterday's Customers
                const yesterdayUsersSnapshot = await db.collection('users')
                    .where('createdAt', '>=', startOfYesterday)
                    .where('createdAt', '<', endOfYesterday)
                    .get();

                const customersYesterday = yesterdayUsersSnapshot.size;

                // Calculate Trends
                const calculateTrend = (current: number, previous: number) => {
                    if (previous === 0) return current > 0 ? 100 : 0;
                    return Number((((current - previous) / previous) * 100).toFixed(1));
                };

                // We need to wait for the first "today" snapshot to settle to calculate trends accurately, 
                // but for simplicity in this effect, we'll update trends whenever "stats" changes 
                // OR we can just store yesterday's raw values and calculate in render.
                // Better approach: Store yesterday's values in state and calculate derived trend.

                // For now, let's just set the raw yesterday values in a ref or separate state if we wanted perfect sync,
                // but calculating here with the *current* state values might be stale inside this async function.
                // So let's just save yesterday's data and calculate trends in a separate effect or render.

                // Actually, simpler: Let's just set the trends here based on the *initial* fetch of today's data 
                // (which we can get via .get() alongside the listener, or just wait for the listener to fire).

                // To avoid complexity, let's just save yesterday's stats.
                return { revenueYesterday, ordersYesterday, customersYesterday };

            } catch (error) {
                console.error("Error fetching yesterday's data:", error);
                return { revenueYesterday: 0, ordersYesterday: 0, customersYesterday: 0 };
            }
        };

        fetchYesterdayData().then(yesterday => {
            // We can't easily calculate the final trend here because 'stats' (today's data) 
            // is being updated by the listener asynchronously.
            // So let's store yesterday's data in state.
            setYesterdayStats(yesterday);
        });

        // Use Promise.all to manage initial loading state
        const initialFetches = [
            ordersQuery.get(),
            usersQuery.get(),
            pendingOrdersQuery.get(),
            fetchYesterdayData() // Add this to the loading wait
        ];

        Promise.all(initialFetches).finally(() => {
            setIsLoading(false);
        });

        return () => {
            unsubscribeOrders();
            unsubscribeUsers();
            unsubscribePending();
        };
    }, []);

    const [yesterdayStats, setYesterdayStats] = useState({
        revenueYesterday: 0,
        ordersYesterday: 0,
        customersYesterday: 0
    });

    // Helper to calculate trend
    const getTrend = (current: number, previous: number) => {
        if (previous === 0) return current > 0 ? 100 : 0;
        return Number((((current - previous) / previous) * 100).toFixed(1));
    };

    return (
        <div>
            <h1 className="mb-6 font-display text-3xl font-bold text-gray-800">Admin Dashboard</h1>
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
                // No trend for pending orders usually, or could compare to average
                />
            </div>
            <div className="mt-8">
                <SalesOverview />
            </div>
        </div>
    );
};

export default AdminDashboardPage;
