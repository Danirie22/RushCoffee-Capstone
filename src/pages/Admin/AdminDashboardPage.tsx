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
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const today = new Date();
        const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const endOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

        // Listener for today's orders (for revenue and order count)
        const ordersQuery = db.collection('orders').where('timestamp', '>=', startOfToday).where('timestamp', '<', endOfToday);
        const unsubscribeOrders = ordersQuery.onSnapshot(snapshot => {
            let revenue = 0;
            const orderCount = snapshot.size;
            snapshot.forEach(doc => {
                const order = doc.data();
                // Only count revenue for completed orders today
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

        // Use Promise.all to manage initial loading state, making sure all initial fetches complete
        const initialFetches = [
            ordersQuery.get(),
            usersQuery.get(),
            pendingOrdersQuery.get()
        ];

        Promise.all(initialFetches).finally(() => {
            setIsLoading(false);
        });

        // Cleanup function
        return () => {
            unsubscribeOrders();
            unsubscribeUsers();
            unsubscribePending();
        };
    }, []);

    return (
        <div>
            <h1 className="mb-6 font-display text-3xl font-bold text-gray-800">Admin Dashboard</h1>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Total Revenue Today"
                    value={`₱${stats.revenueToday.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                    Icon={DollarSign}
                    isLoading={isLoading}
                    color="blue"
                />
                <StatCard
                    title="Orders Today"
                    value={stats.ordersToday}
                    Icon={Coffee}
                    isLoading={isLoading}
                    color="green"
                />
                <StatCard
                    title="New Customers Today"
                    value={stats.newCustomersToday}
                    Icon={Users}
                    isLoading={isLoading}
                    color="yellow"
                />
                <StatCard
                    title="Pending Orders"
                    value={stats.pendingOrders}
                    Icon={BarChart3}
                    isLoading={isLoading}
                    color="purple"
                />
            </div>
            <div className="mt-8">
                <SalesOverview />
            </div>
        </div>
    );
};

export default AdminDashboardPage;
