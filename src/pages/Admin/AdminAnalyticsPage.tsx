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
    const [chartData, setChartData] = useState<ChartData[]>([]);
    const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
    const [dateRange, setDateRange] = useState<DateRange>('7d');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);

            const now = new Date();
            let startDate: Date;
            
            switch(dateRange) {
                case '7d':
                    startDate = startOfDay(subDays(now, 6));
                    break;
                case '30d':
                    startDate = startOfDay(subDays(now, 29));
                    break;
                case 'all':
                default:
                    // A reasonable "all time" start date to avoid fetching everything
                    startDate = new Date(2020, 0, 1); 
                    break;
            }

            // --- Fetch Data ---
            const ordersQuery = db.collection('orders')
                .where('timestamp', '>=', startDate);
            
            const usersQuery = db.collection('users')
                .where('createdAt', '>=', startDate);

            const [orderSnapshot, usersSnapshot] = await Promise.all([
                ordersQuery.get(),
                usersQuery.get()
            ]);
            
            const allOrdersInRange = orderSnapshot.docs.map(doc => ({ ...doc.data(), timestamp: doc.data().timestamp.toDate() })) as Omit<QueueItem, 'id'>[];
            const orders = allOrdersInRange.filter(order => order.status === 'completed');


            // --- Calculate KPIs ---
            const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
            const totalOrders = orders.length;
            const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
            const newCustomers = usersSnapshot.size;
            setStats({ totalRevenue, totalOrders, avgOrderValue, newCustomers });

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
                    // FIX: Explicitly cast value to number to satisfy ChartData interface.
                    value: value as number
                }));
                setChartData(formattedChartData);
            } else {
                setChartData([]); // Don't show chart for "all time" to avoid clutter
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
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                <h1 className="font-display text-3xl font-bold text-gray-800">Analytics & Reports</h1>
                <div className="flex mt-4 md:mt-0 gap-2 rounded-full bg-gray-200 p-1">
                    {(['7d', '30d', 'all'] as DateRange[]).map(dr => (
                        <button
                            key={dr}
                            onClick={() => setDateRange(dr)}
                            className={`rounded-full px-4 py-1.5 text-sm font-semibold capitalize transition-colors ${dateRange === dr ? 'bg-primary-600 text-white shadow' : 'text-gray-600 hover:bg-primary-50'}`}
                        >
                            {dr === '7d' ? 'Last 7 Days' : dr === '30d' ? 'Last 30 Days' : 'All Time'}
                        </button>
                    ))}
                </div>
            </div>
            
            {/* KPI Cards */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                 <StatCard title="Total Revenue" value={`₱${stats.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} Icon={DollarSign} isLoading={isLoading} color="blue" />
                <StatCard title="Total Orders" value={stats.totalOrders.toLocaleString()} Icon={ShoppingBag} isLoading={isLoading} color="green" />
                <StatCard title="Avg. Order Value" value={`₱${stats.avgOrderValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} Icon={TrendingUp} isLoading={isLoading} color="purple" />
                <StatCard title="New Customers" value={stats.newCustomers.toLocaleString()} Icon={Users} isLoading={isLoading} color="yellow" />
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
                            Array.from({length: 5}).map((_, i) => (
                                <div key={i} className="flex items-center justify-between animate-pulse">
                                    <div className="h-5 w-3/5 rounded-md bg-gray-200"></div>
                                    <div className="h-5 w-1/5 rounded-md bg-gray-200"></div>
                                </div>
                            ))
                        ) : topProducts.length > 0 ? (
                            topProducts.map((product, index) => (
                                <div key={product.name} className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2">
                                        <span className={`font-bold ${index < 3 ? 'text-primary-700' : 'text-gray-500'}`}>{index + 1}.</span>
                                        <p className="font-medium text-gray-800 truncate">{product.name}</p>
                                    </div>
                                    <Badge className="bg-primary-100 text-primary-800">{product.quantity} sold</Badge>
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