import React from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Cell
} from 'recharts';
import { TopProduct } from '../../../hooks/useSalesData';
import { TrendingUp } from 'lucide-react';

interface TopProductsChartProps {
    data: TopProduct[];
    showRevenue?: boolean;
}

const COLORS = [
    '#3B82F6', // Blue
    '#10B981', // Green
    '#F59E0B', // Amber
    '#8B5CF6', // Purple
    '#EC4899', // Pink
    '#14B8A6', // Teal
    '#F97316', // Orange
    '#6366F1', // Indigo
    '#EF4444', // Red
    '#06B6D4', // Cyan
];

const TopProductsChart: React.FC<TopProductsChartProps> = ({
    data,
    showRevenue = true
}) => {
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
                    <p className="font-semibold text-gray-800 mb-2">{label}</p>
                    <p className="text-sm text-blue-600">
                        Quantity Sold: {payload[0].value}
                    </p>
                    {showRevenue && payload[1] && (
                        <p className="text-sm text-green-600">
                            Revenue: ₱{payload[1].value.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </p>
                    )}
                </div>
            );
        }
        return null;
    };

    if (data.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <TrendingUp className="w-12 h-12 mb-3 opacity-50" />
                <p>No sales data available</p>
            </div>
        );
    }

    return (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart
                data={data}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" horizontal />
                <XAxis
                    type="number"
                    stroke="#6B7280"
                    style={{ fontSize: '12px' }}
                />
                <YAxis
                    type="category"
                    dataKey="productName"
                    stroke="#6B7280"
                    style={{ fontSize: '11px' }}
                    width={120}
                    tickFormatter={(value) => {
                        // Truncate long product names
                        return value.length > 15 ? value.substring(0, 15) + '...' : value;
                    }}
                />
                <Tooltip
                    content={<CustomTooltip />}
                    cursor={false}
                    wrapperStyle={{ outline: 'none' }}
                />
                <Legend
                    wrapperStyle={{ paddingTop: '10px' }}
                    iconType="circle"
                />
                <Bar
                    dataKey="quantity"
                    name="Quantity Sold"
                    radius={[0, 8, 8, 0]}
                >
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Bar>
                {showRevenue && (
                    <Bar
                        dataKey="revenue"
                        name="Revenue (₱)"
                        fill="#10B981"
                        radius={[0, 8, 8, 0]}
                        opacity={0.7}
                    />
                )}
            </BarChart>
        </ResponsiveContainer>
    );
};

export default TopProductsChart;
