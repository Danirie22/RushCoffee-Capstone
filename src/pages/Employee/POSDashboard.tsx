import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../../firebaseConfig';
import {
    Coffee, DollarSign, ShoppingCart, Clock, TrendingUp,
    Package, Users, Zap, ArrowRight, Activity
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface TodayStats {
    revenue: number;
    orders: number;
    avgOrderValue: number;
}

const POSDashboard: React.FC = () => {
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const [stats, setStats] = useState<TodayStats>({
        revenue: 0,
        orders: 0,
        avgOrderValue: 0
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const today = new Date();
        const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const endOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

        // Fetch today's orders
        const unsubscribe = db.collection('orders')
            .where('timestamp', '>=', startOfToday)
            .where('timestamp', '<', endOfToday)
            .onSnapshot(snapshot => {
                let revenue = 0;
                const orderCount = snapshot.size;

                snapshot.forEach(doc => {
                    const order = doc.data();
                    if (order.status === 'completed') {
                        revenue += (Number(order.totalAmount) || 0);
                    }
                });

                const avgOrderVal = orderCount > 0 ? revenue / orderCount : 0;

                setStats({
                    revenue,
                    orders: orderCount,
                    avgOrderValue: avgOrderVal
                });
                setIsLoading(false);
            }, err => {
                console.error("Error fetching today's stats:", err);
                setIsLoading(false);
            });

        return () => unsubscribe();
    }, []);

    const quickActions = [
        {
            title: 'New Order',
            description: 'Start processing a walk-in order',
            icon: ShoppingCart,
            gradient: 'from-primary-600 to-primary-700',
            hoverGradient: 'hover:from-primary-700 hover:to-primary-800',
            route: '/employee/pos',
            primary: true
        },
        {
            title: 'View Queue',
            description: 'Check active orders and queue',
            icon: Activity,
            gradient: 'from-blue-600 to-blue-700',
            hoverGradient: 'hover:from-blue-700 hover:to-blue-800',
            route: '/employee/queue'
        },
        {
            title: 'Check Inventory',
            description: 'View stock levels and alerts',
            icon: Package,
            gradient: 'from-orange-600 to-orange-700',
            hoverGradient: 'hover:from-orange-700 hover:to-orange-800',
            route: '/employee/inventory'
        },
        {
            title: 'Order History',
            description: 'View past transactions',
            icon: Clock,
            gradient: 'from-purple-600 to-purple-700',
            hoverGradient: 'hover:from-purple-700 hover:to-purple-800',
            route: '/employee/history'
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 via-gray-50 to-primary-50">
            {/* Hero Header */}
            <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white px-6 py-12 mb-8 shadow-xl">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-4xl font-display font-bold mb-2 flex items-center gap-3">
                                <Zap className="h-10 w-10" />
                                Admin Portal
                            </h1>
                            <p className="text-primary-100 text-lg">
                                Welcome back, <span className="font-semibold">{currentUser?.firstName || 'Employee'}</span>!
                                Ready to serve some great coffee?
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-primary-100 text-sm mb-1">Current Time</p>
                            <p className="text-3xl font-bold">{new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 pb-12">
                {/* Today's Stats */}
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <TrendingUp className="h-6 w-6 text-primary-600" />
                        Today's Performance
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Revenue */}
                        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
                            <div className="flex items-center justify-between mb-4">
                                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center">
                                    <span className="h-6 w-6 text-green-600 flex items-center justify-center font-bold text-xl">₱</span>
                                </div>
                            </div>
                            {isLoading ? (
                                <div className="h-8 w-32 bg-gray-200 rounded animate-pulse"></div>
                            ) : (
                                <p className="text-3xl font-bold text-gray-900">
                                    ₱{(stats.revenue || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </p>
                            )}
                            <p className="text-sm text-gray-600 mt-2 font-medium">Total Revenue</p>
                        </div>

                        {/* Orders */}
                        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
                            <div className="flex items-center justify-between mb-4">
                                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                                    <Coffee className="h-6 w-6 text-blue-600" />
                                </div>
                            </div>
                            {isLoading ? (
                                <div className="h-8 w-20 bg-gray-200 rounded animate-pulse"></div>
                            ) : (
                                <p className="text-3xl font-bold text-gray-900">{stats.orders}</p>
                            )}
                            <p className="text-sm text-gray-600 mt-2 font-medium">Orders Processed</p>
                        </div>

                        {/* Avg Order Value */}
                        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
                            <div className="flex items-center justify-between mb-4">
                                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center">
                                    <ShoppingCart className="h-6 w-6 text-purple-600" />
                                </div>
                            </div>
                            {isLoading ? (
                                <div className="h-8 w-24 bg-gray-200 rounded animate-pulse"></div>
                            ) : (
                                <p className="text-3xl font-bold text-gray-900">₱{(stats.avgOrderValue || 0).toFixed(2)}</p>
                            )}
                            <p className="text-sm text-gray-600 mt-2 font-medium">Avg Order Value</p>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <Zap className="h-6 w-6 text-primary-600" />
                        Quick Actions
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {quickActions.map((action) => {
                            const Icon = action.icon;
                            return (
                                <button
                                    key={action.title}
                                    onClick={() => navigate(action.route)}
                                    className={`
                                        bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-100
                                        hover:shadow-2xl hover:scale-105 transition-all duration-300
                                        text-left group relative overflow-hidden
                                        ${action.primary ? 'ring-2 ring-primary-600 ring-offset-2' : ''}
                                    `}
                                >
                                    {/* Background gradient on hover */}
                                    <div className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-0 group-hover:opacity-5 transition-opacity`}></div>

                                    <div className="relative z-10">
                                        <div className={`h-14 w-14 rounded-xl bg-gradient-to-br ${action.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                                            <Icon className="h-7 w-7 text-white" />
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center justify-between">
                                            {action.title}
                                            <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-primary-600 group-hover:translate-x-1 transition-all" />
                                        </h3>
                                        <p className="text-sm text-gray-600">{action.description}</p>
                                    </div>

                                    {action.primary && (
                                        <div className="absolute top-3 right-3">
                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-primary-600 text-white shadow-lg animate-pulse">
                                                START HERE
                                            </span>
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default POSDashboard;
