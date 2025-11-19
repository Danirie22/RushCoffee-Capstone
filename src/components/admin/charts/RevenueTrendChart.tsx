import React from 'react';
import {
    LineChart,
    Line,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';
import { SalesDataPoint } from '../../../hooks/useSalesData';

interface RevenueTrendChartProps {
    data: SalesDataPoint[];
    showOrders?: boolean;
    type?: 'line' | 'area';
}

const RevenueTrendChart: React.FC<RevenueTrendChartProps> = ({
    data,
    showOrders = true,
    type = 'area'
}) => {
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
                    <p className="font-semibold text-gray-800 mb-2">{label}</p>
                    <p className="text-sm text-blue-600">
                        Revenue: ₱{payload[0].value.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </p>
                    {showOrders && payload[1] && (
                        <p className="text-sm text-green-600">
                            Orders: {payload[1].value}
                        </p>
                    )}
                    {payload[2] && (
                        <p className="text-sm text-purple-600">
                            Avg Order: ₱{payload[2].value.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </p>
                    )}
                </div>
            );
        }
        return null;
    };

    if (type === 'area') {
        return (
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                    <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                        </linearGradient>
                        {showOrders && (
                            <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                            </linearGradient>
                        )}
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis
                        dataKey="date"
                        stroke="#6B7280"
                        style={{ fontSize: '12px' }}
                    />
                    <YAxis
                        stroke="#6B7280"
                        style={{ fontSize: '12px' }}
                        tickFormatter={(value) => `₱${value.toLocaleString()}`}
                    />
                    <Tooltip
                        content={<CustomTooltip />}
                        cursor={false}
                        wrapperStyle={{ outline: 'none' }}
                    />
                    <Legend
                        wrapperStyle={{ paddingTop: '20px' }}
                        iconType="circle"
                    />
                    <Area
                        type="monotone"
                        dataKey="revenue"
                        stroke="#3B82F6"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorRevenue)"
                        name="Revenue"
                    />
                    {showOrders && (
                        <Area
                            type="monotone"
                            dataKey="orders"
                            stroke="#10B981"
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorOrders)"
                            name="Orders"
                        />
                    )}
                </AreaChart>
            </ResponsiveContainer>
        );
    }

    return (
        <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis
                    dataKey="date"
                    stroke="#6B7280"
                    style={{ fontSize: '12px' }}
                />
                <YAxis
                    stroke="#6B7280"
                    style={{ fontSize: '12px' }}
                    tickFormatter={(value) => `₱${value.toLocaleString()}`}
                />
                <Tooltip
                    content={<CustomTooltip />}
                    cursor={false}
                    wrapperStyle={{ outline: 'none' }}
                />
                <Legend
                    wrapperStyle={{ paddingTop: '20px' }}
                    iconType="circle"
                />
                <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#3B82F6"
                    strokeWidth={3}
                    dot={{ fill: '#3B82F6', r: 4 }}
                    activeDot={{ r: 6 }}
                    name="Revenue"
                />
                {showOrders && (
                    <Line
                        type="monotone"
                        dataKey="orders"
                        stroke="#10B981"
                        strokeWidth={3}
                        dot={{ fill: '#10B981', r: 4 }}
                        activeDot={{ r: 6 }}
                        name="Orders"
                    />
                )}
                <Line
                    type="monotone"
                    dataKey="averageOrderValue"
                    stroke="#8B5CF6"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={{ fill: '#8B5CF6', r: 3 }}
                    name="Avg Order Value"
                />
            </LineChart>
        </ResponsiveContainer>
    );
};

export default RevenueTrendChart;
