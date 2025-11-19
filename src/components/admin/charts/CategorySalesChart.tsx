import React from 'react';
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Legend,
    Tooltip
} from 'recharts';
import { CategorySales } from '../../../hooks/useSalesData';
import { Package } from 'lucide-react';

interface CategorySalesChartProps {
    data: CategorySales[];
}

const CATEGORY_COLORS: Record<string, string> = {
    'Coffee Based': '#8B4513',
    'Non-Coffee Based': '#D2691E',
    'Matcha Series': '#90EE90',
    'Refreshments': '#87CEEB',
    'Meals': '#FFD700',
    'Other': '#9CA3AF'
};

const CategorySalesChart: React.FC<CategorySalesChartProps> = ({ data }) => {
    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            const percentage = ((data.revenue / data.total) * 100).toFixed(1);
            return (
                <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
                    <p className="font-semibold text-gray-800 mb-2">{data.category}</p>
                    <p className="text-sm text-blue-600">
                        Revenue: ₱{data.revenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-sm text-green-600">
                        Orders: {data.orders}
                    </p>
                    <p className="text-sm text-purple-600">
                        Share: {percentage}%
                    </p>
                </div>
            );
        }
        return null;
    };

    const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
        const RADIAN = Math.PI / 180;
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        if (percent < 0.05) return null; // Don't show label for small slices

        return (
            <text
                x={x}
                y={y}
                fill="white"
                textAnchor={x > cx ? 'start' : 'end'}
                dominantBaseline="central"
                className="font-semibold text-sm"
            >
                {`${(percent * 100).toFixed(0)}%`}
            </text>
        );
    };

    if (data.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <Package className="w-12 h-12 mb-3 opacity-50" />
                <p>No category data available</p>
            </div>
        );
    }

    // Calculate total for percentage
    const total = data.reduce((sum, item) => sum + item.revenue, 0);
    const chartData = data.map(item => ({
        ...item,
        total
    }));

    return (
        <ResponsiveContainer width="100%" height="100%">
            <PieChart>
                <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomLabel}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="revenue"
                    animationBegin={0}
                    animationDuration={800}
                >
                    {chartData.map((entry, index) => (
                        <Cell
                            key={`cell-${index}`}
                            fill={CATEGORY_COLORS[entry.category] || CATEGORY_COLORS['Other']}
                        />
                    ))}
                </Pie>
                <Tooltip
                    content={<CustomTooltip />}
                    wrapperStyle={{ outline: 'none' }}
                />
                <Legend
                    verticalAlign="bottom"
                    height={36}
                    iconType="circle"
                    formatter={(value, entry: any) => {
                        const percentage = ((entry.payload.revenue / total) * 100).toFixed(1);
                        return `${value} (${percentage}%)`;
                    }}
                />
            </PieChart>
        </ResponsiveContainer>
    );
};

export default CategorySalesChart;
