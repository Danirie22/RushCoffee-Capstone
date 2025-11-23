import React, { useState, useEffect } from 'react';
import { db } from '../../firebaseConfig';
import { QueueItem } from '../../context/OrderContext';
import { TrendingUp, ShoppingBag, Clock, DollarSign } from 'lucide-react';
import Card from '../../components/ui/Card';

const EmployeeDashboardPage: React.FC = () => {
    const [stats, setStats] = useState({
        totalOrders: 0,
        totalRevenue: 0,
        pendingOrders: 0,
        completedOrders: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Get start of today
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const unsubscribe = db
            .collection('orders')
            .where('timestamp', '>=', today)
            .onSnapshot((snapshot) => {
                const orders = snapshot.docs.map((doc) => doc.data()) as QueueItem[];

                const newStats = orders.reduce(
                    (acc, order) => {
                        acc.totalOrders++;
                        acc.totalRevenue += order.totalAmount || 0;

                        if (order.status === 'waiting' || order.status === 'preparing') {
                            acc.pendingOrders++;
                        } else if (order.status === 'completed') {
                            acc.completedOrders++;
                        }

                        return acc;
                    },
                    { totalOrders: 0, totalRevenue: 0, pendingOrders: 0, completedOrders: 0 }
                );

                setStats(newStats);
                setLoading(false);
            });

        return () => unsubscribe();
    }, []);

    const statCards = [
        {
            label: "Today's Revenue",
            value: `₱${stats.totalRevenue.toLocaleString()}`,
            icon: DollarSign,
            color: 'bg-green-100 text-green-600',
        },
        {
            label: "Total Orders",
            value: stats.totalOrders,
            icon: ShoppingBag,
            color: 'bg-blue-100 text-blue-600',
        },
        {
            label: "Pending Orders",
            value: stats.pendingOrders,
            icon: Clock,
            color: 'bg-orange-100 text-orange-600',
        },
        {
            label: "Completed",
            value: stats.completedOrders,
            icon: TrendingUp,
            color: 'bg-purple-100 text-purple-600',
        },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-500 mt-2">Overview of today's performance</p>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {statCards.map((stat, index) => (
                    <Card key={index} className="p-6 transition-transform hover:scale-105">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                                <p className="mt-2 text-3xl font-bold text-gray-900">{stat.value}</p>
                            </div>
                            <div className={`rounded-full p-3 ${stat.color}`}>
                                <stat.icon className="h-6 w-6" />
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Quick Actions or Recent Activity could go here */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <Card className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
                    <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-lg">
                        <div className="h-2.5 w-2.5 rounded-full bg-green-600 animate-pulse" />
                        <span className="font-medium">System Operational</span>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default EmployeeDashboardPage;
