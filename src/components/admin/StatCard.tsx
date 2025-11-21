import React from 'react';
import Card from '../ui/Card';

interface StatCardProps {
    title: string;
    value: string | number;
    Icon: React.ElementType;
    isLoading: boolean;
    color: 'blue' | 'green' | 'yellow' | 'purple';
    trend?: {
        value: number;
        label: string;
    };
}

const colorMap = {
    blue: { bg: 'bg-blue-100', text: 'text-blue-600' },
    green: { bg: 'bg-green-100', text: 'text-green-600' },
    yellow: { bg: 'bg-yellow-100', text: 'text-yellow-600' },
    purple: { bg: 'bg-purple-100', text: 'text-purple-600' },
};

const StatCard: React.FC<StatCardProps> = ({ title, value, Icon, isLoading, color, trend }) => {
    const { bg, text } = colorMap[color];

    return (
        <Card className="flex items-start justify-between p-5 border border-gray-100 shadow-sm transition-all hover:shadow-md">
            <div className="flex flex-col gap-1">
                <p className="text-sm font-medium text-gray-500">{title}</p>
                {isLoading ? (
                    <div className="mt-1 h-8 w-24 animate-pulse rounded-md bg-gray-200"></div>
                ) : (
                    <div className="flex items-baseline gap-2">
                        <p className="text-2xl font-bold text-gray-900">{value}</p>
                    </div>
                )}

                {!isLoading && trend && (
                    <div className={`flex items-center gap-1 text-xs font-medium ${trend.value >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        <span>{trend.value > 0 ? '+' : ''}{trend.value}%</span>
                        <span className="text-gray-400 font-normal">{trend.label}</span>
                    </div>
                )}
            </div>
            <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl ${bg}`}>
                <Icon className={`h-6 w-6 ${text}`} />
            </div>
        </Card>
    );
};

export default StatCard;
