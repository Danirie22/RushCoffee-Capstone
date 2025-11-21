import React, { useState, useEffect, useMemo } from 'react';
import { db } from '../../firebaseConfig';
import { subDays, startOfDay, endOfDay, format, eachDayOfInterval } from 'date-fns';
import { Users, Coffee, DollarSign, BarChart3, TrendingUp, ShoppingBag, Loader2, Star } from 'lucide-react';

import StatCard from '../../components/admin/StatCard';
import Card from '../../components/ui/Card';
import { QueueItem } from '../../context/OrderContext';
import Badge from '../../components/ui/Badge';

type DateRange = '7d' | '30d' | 'all';

interface ChartData {
    label: string;
    value: number;
}

interface TopProduct {
    name: string;
    quantity: number;
    revenue: number;
}

const SalesChart: React.FC<{ data: ChartData[], isLoading: boolean }> = ({ data, isLoading }) => {
    if (isLoading) {
        return (
            <div className="flex h-64 items-center justify-center bg-gray-100 rounded-lg animate-pulse">
                <BarChart3 className="h-10 w-10 text-gray-400" />
            </div>
        );
    }

    if (data.length === 0) {
        return (
            <div className="flex h-64 items-center justify-center bg-gray-50 rounded-lg">
                <p className="text-gray-500">No sales data for this period.</p>
            </div>
        )
    }

    const maxValue = Math.max(...data.map(d => d.value), 1); // Avoid division by zero

    return (
        <div className="h-64 flex items-end justify-around gap-2 pt-4">
            {data.map((item, index) => (
                <div key={index} className="flex h-full flex-col items-center justify-end flex-1 group">
                    <div
                        className="w-full bg-primary-200 rounded-t-md hover:bg-primary-400 transition-all duration-300"
                        style={{ height: `${(item.value / maxValue) * 100}%` }}
                    >
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gray-800 text-white text-xs rounded-md py-1 px-2 absolute -top-8 left-1/2 -translate-x-1/2">
                            ₱{item.value.toFixed(2)}
                        </div>
                    </div>
                    <div className="mt-2 text-xs text-gray-500 text-center">{item.label}</div>
                </div>
            ))}
        </div>
    );
};

const AdminAnalyticsPage: React.FC = () => {
    const [stats, setStats] = useState({ totalRevenue: 0, totalOrders: 0, avgOrderValue: 0, newCustomers: 0 });
    const [trends, setTrends] = useState<{
        totalRevenue: number | null;
        totalOrders: number | null;
        avgOrderValue: number | null;
        newCustomers: number | null;
    }>({ totalRevenue: null, totalOrders: null, avgOrderValue: null, newCustomers: null });
    const [chartData, setChartData] = useState<ChartData[]>([]);
    const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
    const [dateRange, setDateRange] = useState<DateRange>('7d');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);

            const now = new Date();
            let startDate: Date;
            let previousStartDate: Date;
            let previousEndDate: Date;

            // Determine Current and Previous Periods
            switch (dateRange) {
                case '7d':
                    startDate = startOfDay(subDays(now, 6));
                    previousEndDate = startOfDay(subDays(now, 7)); // End of previous period is start of current
                    previousStartDate = startOfDay(subDays(now, 13));
                    break;
                case '30d':
                    startDate = startOfDay(subDays(now, 29));
                    previousEndDate = startOfDay(subDays(now, 30));
                    previousStartDate = startOfDay(subDays(now, 59));
                    break;
                case 'all':
                default:
                    startDate = new Date(2020, 0, 1);
                    // For 'all time', trends are less meaningful or could be compared to previous year, 
                    // but for simplicity, let's just disable trends or compare to 0.
                    previousStartDate = new Date(2019, 0, 1);
                    previousEndDate = new Date(2020, 0, 1);
                    break;
            }

            // --- Fetch Current Period Data ---
            const ordersQuery = db.collection('orders').where('timestamp', '>=', startDate);
            const usersQuery = db.collection('users').where('createdAt', '>=', startDate);

            // --- Fetch Previous Period Data ---
            const prevOrdersQuery = db.collection('orders')
                .where('timestamp', '>=', previousStartDate)
                .where('timestamp', '<', previousEndDate);

            const prevUsersQuery = db.collection('users')
                .where('createdAt', '>=', previousStartDate)
                .where('createdAt', '<', previousEndDate);

            const [orderSnapshot, usersSnapshot, prevOrderSnapshot, prevUsersSnapshot] = await Promise.all([
                ordersQuery.get(),
                usersQuery.get(),
                prevOrdersQuery.get(),
                prevUsersQuery.get()
            ]);

            // --- Process Current Data ---
            const allOrdersInRange = orderSnapshot.docs.map(doc => ({ ...doc.data(), timestamp: doc.data().timestamp.toDate() })) as Omit<QueueItem, 'id'>[];
            const orders = allOrdersInRange.filter(order => order.status === 'completed');

            const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
            const totalOrders = orders.length;
            const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
            const newCustomers = usersSnapshot.size;

            setStats({ totalRevenue, totalOrders, avgOrderValue, newCustomers });

            // --- Process Previous Data & Calculate Trends ---
            const prevOrders = prevOrderSnapshot.docs
                .map(doc => doc.data() as Omit<QueueItem, 'id'>)
                .filter(order => order.status === 'completed');

            const prevTotalRevenue = prevOrders.reduce((sum, order) => sum + order.totalAmount, 0);
            const prevTotalOrders = prevOrders.length;
            const prevAvgOrderValue = prevTotalOrders > 0 ? prevTotalRevenue / prevTotalOrders : 0;
            const prevNewCustomers = prevUsersSnapshot.size;

            const calculateTrend = (current: number, previous: number) => {
                if (previous === 0) return null;
                return Number((((current - previous) / previous) * 100).toFixed(1));
            };

            setTrends({
                totalRevenue: calculateTrend(totalRevenue, prevTotalRevenue),
                totalOrders: calculateTrend(totalOrders, prevTotalOrders),
                avgOrderValue: calculateTrend(avgOrderValue, prevAvgOrderValue),
                newCustomers: calculateTrend(newCustomers, prevNewCustomers)
            });

            // --- Process Chart Data ---
            if (dateRange !== 'all') {
                const interval = eachDayOfInterval({ start: startDate, end: endOfDay(now) });
                const salesByDay = interval.reduce((acc, day) => {
                    acc[format(day, 'yyyy-MM-dd')] = 0;
                    return acc;
                }, {} as { [key: string]: number });

                orders.forEach(order => {
                    const day = format(order.timestamp, 'yyyy-MM-dd');
                    if (salesByDay[day] !== undefined) {
                        salesByDay[day] += order.totalAmount;
                    }
                });

                const formattedChartData = Object.entries(salesByDay).map(([day, value]) => ({
                    label: format(new Date(day), 'd MMM'),
                    value: value as number
                }));
                setChartData(formattedChartData);
            } else {
                setChartData([]);
            }

            // --- Process Top Products ---
            const productSales = new Map<string, { quantity: number; revenue: number }>();
            orders.forEach(order => {
                order.orderItems.forEach(item => {
                    const current = productSales.get(item.productName) || { quantity: 0, revenue: 0 };
                    productSales.set(item.productName, {
                        quantity: current.quantity + item.quantity,
                        revenue: current.revenue + (item.price * item.quantity),
                    });
                });
            });

            const sortedProducts = Array.from(productSales.entries())
                .map(([name, data]) => ({ name, ...data }))
                .sort((a, b) => b.quantity - a.quantity)
                .slice(0, 5);
            setTopProducts(sortedProducts);

            setIsLoading(false);
        };

        fetchData().catch(console.error);
    }, [dateRange]);

    return (
        <div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
                <h1 className="font-display text-2xl font-bold text-gray-800 sm:text-3xl">Analytics & Reports</h1>
                <div className="flex w-fit mx-auto gap-2 rounded-full bg-gray-200 p-1 sm:mx-0">
                    {(['7d', '30d', 'all'] as DateRange[]).map(dr => (
                        <button
                            key={dr}
                            onClick={() => setDateRange(dr)}
                            className={`flex-shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold capitalize transition-colors sm:px-4 sm:text-sm ${dateRange === dr ? 'bg-primary-600 text-white shadow' : 'text-gray-600 hover:bg-primary-50'}`}
                        >
                            <span className="whitespace-nowrap">{dr === '7d' ? 'Last 7 Days' : dr === '30d' ? 'Last 30 Days' : 'All Time'}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Total Revenue"
                    value={`₱${stats.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                    Icon={DollarSign}
                    isLoading={isLoading}
                    color="blue"
                    trend={dateRange !== 'all' && trends.totalRevenue !== null ? { value: trends.totalRevenue, label: "vs last period" } : undefined}
                />
                <StatCard
                    title="Total Orders"
                    value={stats.totalOrders.toLocaleString()}
                    Icon={ShoppingBag}
                    isLoading={isLoading}
                    color="green"
                    trend={dateRange !== 'all' && trends.totalOrders !== null ? { value: trends.totalOrders, label: "vs last period" } : undefined}
                />
                <StatCard
                    title="Avg. Order Value"
                    value={`₱${stats.avgOrderValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                    Icon={TrendingUp}
                    isLoading={isLoading}
                    color="purple"
                    trend={dateRange !== 'all' && trends.avgOrderValue !== null ? { value: trends.avgOrderValue, label: "vs last period" } : undefined}
                />
                <StatCard
                    title="New Customers"
                    value={stats.newCustomers.toLocaleString()}
                    Icon={Users}
                    isLoading={isLoading}
                    color="yellow"
                    trend={dateRange !== 'all' && trends.newCustomers !== null ? { value: trends.newCustomers, label: "vs last period" } : undefined}
                />
            </div>

            {/* Charts */}
            <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-5">
                <Card className="lg:col-span-3">
                    <h2 className="text-xl font-bold text-gray-800">Sales Overview</h2>
                    <p className="text-sm text-gray-500">Revenue from completed orders per day.</p>
                    <SalesChart data={chartData} isLoading={isLoading} />
                </Card>
                <Card className="lg:col-span-2">
                    <h2 className="text-xl font-bold text-gray-800">Top Selling Products</h2>
                    <p className="text-sm text-gray-500">By units sold in the selected period.</p>
                    <div className="mt-4 space-y-3">
                        {isLoading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <div key={i} className="flex items-center justify-between animate-pulse">
                                    <div className="h-5 w-3/5 rounded-md bg-gray-200"></div>
                                    <div className="h-5 w-1/5 rounded-md bg-gray-200"></div>
                                </div>
                            ))
                        ) : topProducts.length > 0 ? (
                            topProducts.map((product, index) => (
                                <div key={product.name} className="flex items-center justify-between text-sm gap-4">
                                    <div className="flex items-center gap-2 flex-1 min-w-0">
                                        <span className={`font-bold ${index < 3 ? 'text-primary-700' : 'text-gray-500'}`}>{index + 1}.</span>
                                        <p className="font-medium text-gray-800 truncate">{product.name}</p>
                                    </div>
                                    <Badge className="bg-primary-100 text-primary-800 flex-shrink-0">{product.quantity} sold</Badge>
                                </div>
                            ))
                        ) : (
                            <div className="flex h-48 items-center justify-center">
                                <p className="text-gray-500">No product data for this period.</p>
                            </div>
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default AdminAnalyticsPage;