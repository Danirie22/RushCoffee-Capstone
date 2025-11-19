import React from 'react';
import Card from '../ui/Card';

interface StatCardProps {
    title: string;
    value: string | number;
    Icon: React.ElementType;
    isLoading: boolean;
    color: 'blue' | 'green' | 'yellow' | 'purple';
}

const colorMap = {
    blue: { bg: 'bg-blue-100', text: 'text-blue-600' },
    green: { bg: 'bg-green-100', text: 'text-green-600' },
    yellow: { bg: 'bg-yellow-100', text: 'text-yellow-600' },
    purple: { bg: 'bg-purple-100', text: 'text-purple-600' },
};

const StatCard: React.FC<StatCardProps> = ({ title, value, Icon, isLoading, color }) => {
    const { bg, text } = colorMap[color];

    return (
        <Card className="flex items-start gap-4 p-6">
            <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full ${bg}`}>
                <Icon className={`h-6 w-6 ${text}`} />
            </div>
            <div className="flex flex-col">
                <p className="text-sm text-gray-500">{title}</p>
                {isLoading ? (
                    <div className="mt-1 h-8 w-24 animate-pulse rounded-md bg-gray-200"></div>
                ) : (
                    <p className="text-2xl font-bold text-gray-800">{value}</p>
                )}
            </div>
        </Card>
    );
};

export default StatCard;
