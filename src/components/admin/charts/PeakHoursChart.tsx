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
import { PeakHour } from '../../../hooks/useSalesData';
import { Clock } from 'lucide-react';

interface PeakHoursChartProps {
    data: PeakHour[];
}

const PeakHoursChart: React.FC<PeakHoursChartProps> = ({ data }) => {
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
                    <p className="font-semibold text-gray-800 mb-2">{formatHour(label)}</p>
                    <p className="text-sm text-blue-600">
                        Orders: {payload[0].value}
                    </p>
                    <p className="text-sm text-green-600">
                        Revenue: ₱{payload[1].value.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </p>
                </div>
            );
        }
        return null;
    };

    const formatHour = (hour: number) => {
        const period = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
        return `${displayHour}:00 ${period}`;
    };

    // Determine color based on order volume
    const getBarColor = (orders: number, maxOrders: number) => {
        const ratio = orders / maxOrders;
        if (ratio > 0.7) return '#EF4444'; // Red for peak hours
        if (ratio > 0.4) return '#F59E0B'; // Amber for busy hours
        return '#3B82F6'; // Blue for normal hours
    };

    if (data.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <Clock className="w-12 h-12 mb-3 opacity-50" />
                <p>No peak hours data available</p>
            </div>
        );
    }

    const maxOrders = Math.max(...data.map(d => d.orders));

    return (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis
                    dataKey="hour"
                    stroke="#6B7280"
                    style={{ fontSize: '11px' }}
                    tickFormatter={formatHour}
                    interval={0}
                    angle={-45}
                    textAnchor="end"
                    height={70}
                />
                <YAxis
                    stroke="#6B7280"
                    style={{ fontSize: '12px' }}
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
                    dataKey="orders"
                    name="Orders"
                    radius={[8, 8, 0, 0]}
                >
                    {data.map((entry, index) => (
                        <Cell
                            key={`cell-orders-${index}`}
                            fill={getBarColor(entry.orders, maxOrders)}
                        />
                    ))}
                </Bar>
                <Bar
                    dataKey="revenue"
                    name="Revenue (₱)"
                    fill="#10B981"
                    radius={[8, 8, 0, 0]}
                    opacity={0.7}
                />
            </BarChart>
        </ResponsiveContainer>
    );
};

export default PeakHoursChart;
