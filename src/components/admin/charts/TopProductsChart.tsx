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
                margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
            >
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" horizontal={false} vertical={true} />
                <XAxis
                    type="number"
                    stroke="#9CA3AF"
                    style={{ fontSize: '12px' }}
                    axisLine={false}
                    tickLine={false}
                />
                <YAxis
                    type="category"
                    dataKey="productName"
                    stroke="#4B5563"
                    style={{ fontSize: '12px', fontWeight: 500 }}
                    width={100}
                    tickFormatter={(value) => {
                        // Truncate long product names
                        return value.length > 12 ? value.substring(0, 12) + '...' : value;
                    }}
                    axisLine={false}
                    tickLine={false}
                />
                <Tooltip
                    content={<CustomTooltip />}
                    cursor={{ fill: '#F3F4F6', opacity: 0.5 }}
                    wrapperStyle={{ outline: 'none' }}
                />
                <Legend
                    wrapperStyle={{ paddingTop: '10px' }}
                    iconType="circle"
                />
                <Bar
                    dataKey="quantity"
                    name="Quantity Sold"
                    radius={[0, 4, 4, 0]}
                    barSize={32}
                    background={{ fill: '#F9FAFB', radius: 4 }}
                >
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    );
};

export default TopProductsChart;
