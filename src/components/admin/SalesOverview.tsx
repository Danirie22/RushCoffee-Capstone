import React, { useState } from 'react';
import Card from '../ui/Card';
import { useSalesData, TimeRange } from '../../hooks/useSalesData';
import RevenueTrendChart from './charts/RevenueTrendChart';
import TopProductsChart from './charts/TopProductsChart';
import CategorySalesChart from './charts/CategorySalesChart';
import PeakHoursChart from './charts/PeakHoursChart';
import {
    TrendingUp,
    Package,
    PieChart as PieChartIcon,
    Clock,
    Calendar,
    ArrowUpDown
} from 'lucide-react';

const SalesOverview: React.FC = () => {
    const [timeRange, setTimeRange] = useState<TimeRange>('today');
    const { salesData, topProducts, categorySales, peakHours, isLoading } = useSalesData(timeRange);

    const timeRangeOptions: { value: TimeRange; label: string; icon: React.ElementType }[] = [
        { value: 'today', label: 'Today', icon: Calendar },
        { value: 'week', label: 'This Week', icon: Calendar },
        { value: 'month', label: 'This Month', icon: Calendar },
        { value: 'year', label: 'This Year', icon: Calendar }
    ];

    // Calculate comparison metrics
    const totalRevenue = salesData.reduce((sum, item) => sum + item.revenue, 0);
    const totalOrders = salesData.reduce((sum, item) => sum + item.orders, 0);
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    return (
        <div className="space-y-6">
            {/* Time Range Selector */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-xl font-bold text-gray-800 sm:text-2xl">Sales Overview</h2>
                <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
                    {timeRangeOptions.map(option => {
                        const Icon = option.icon;
                        return (
                            <button
                                key={option.value}
                                onClick={() => setTimeRange(option.value)}
                                className={`
                  flex flex-shrink-0 items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all text-sm sm:px-4
                  ${timeRange === option.value
                                        ? 'bg-blue-600 text-white shadow-md'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }
                `}
                            >
                                <Icon className="w-4 h-4" />
                                <span className="whitespace-nowrap">{option.label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm font-medium text-blue-700 mb-1">Total Revenue</p>
                            <p className="text-2xl font-bold text-blue-900">
                                ₱{totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </p>
                        </div>
                        <div className="p-3 bg-blue-200 rounded-lg">
                            <TrendingUp className="w-6 h-6 text-blue-700" />
                        </div>
                    </div>
                </Card>

                <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm font-medium text-green-700 mb-1">Total Orders</p>
                            <p className="text-2xl font-bold text-green-900">{totalOrders}</p>
                        </div>
                        <div className="p-3 bg-green-200 rounded-lg">
                            <Package className="w-6 h-6 text-green-700" />
                        </div>
                    </div>
                </Card>

                <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm font-medium text-purple-700 mb-1">Avg Order Value</p>
                            <p className="text-2xl font-bold text-purple-900">
                                ₱{avgOrderValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </p>
                        </div>
                        <div className="p-3 bg-purple-200 rounded-lg">
                            <ArrowUpDown className="w-6 h-6 text-purple-700" />
                        </div>
                    </div>
                </Card>
            </div>

            {/* Revenue Trend Chart */}
            <Card>
                <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                    <h3 className="text-lg font-bold text-gray-800">Revenue & Orders Trend</h3>
                </div>
                <div className="h-80">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        </div>
                    ) : salesData.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-500">
                            <TrendingUp className="w-12 h-12 mb-3 opacity-50" />
                            <p>No sales data available for this period</p>
                        </div>
                    ) : (
                        <RevenueTrendChart data={salesData} showOrders={true} type="area" />
                    )}
                </div>
            </Card>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Products */}
                <Card>
                    <div className="flex items-center gap-2 mb-4">
                        <Package className="w-5 h-5 text-green-600" />
                        <h3 className="text-lg font-bold text-gray-800">Top Selling Products</h3>
                    </div>
                    <div className="h-96">
                        {isLoading ? (
                            <div className="flex items-center justify-center h-full">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                            </div>
                        ) : (
                            <TopProductsChart data={topProducts} showRevenue={true} />
                        )}
                    </div>
                </Card>

                {/* Category Sales */}
                <Card>
                    <div className="flex items-center gap-2 mb-4">
                        <PieChartIcon className="w-5 h-5 text-purple-600" />
                        <h3 className="text-lg font-bold text-gray-800">Sales by Category</h3>
                    </div>
                    <div className="h-96">
                        {isLoading ? (
                            <div className="flex items-center justify-center h-full">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                            </div>
                        ) : (
                            <CategorySalesChart data={categorySales} />
                        )}
                    </div>
                </Card>
            </div>

            {/* Peak Hours Chart (only for today and week) */}
            {(timeRange === 'today' || timeRange === 'week') && peakHours.length > 0 && (
                <Card>
                    <div className="flex items-center gap-2 mb-4">
                        <Clock className="w-5 h-5 text-orange-600" />
                        <h3 className="text-lg font-bold text-gray-800">Peak Hours Analysis</h3>
                    </div>
                    <div className="h-80">
                        {isLoading ? (
                            <div className="flex items-center justify-center h-full">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
                            </div>
                        ) : (
                            <PeakHoursChart data={peakHours} />
                        )}
                    </div>
                </Card>
            )}
        </div>
    );
};

export default SalesOverview;
