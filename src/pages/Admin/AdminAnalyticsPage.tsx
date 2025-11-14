
import React from 'react';
import { BarChart3 } from 'lucide-react';

const AdminAnalyticsPage: React.FC = () => {
    return (
        <div>
            <h1 className="mb-6 font-display text-3xl font-bold text-gray-800">Analytics & Reports</h1>
            <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed bg-gray-50 p-12 text-center">
                <BarChart3 className="h-16 w-16 text-gray-400" />
                <h2 className="mt-4 text-xl font-semibold text-gray-700">Coming Soon</h2>
                <p className="mt-1 text-gray-500">
                    This is where you'll find detailed charts and reports on sales, customers, and product performance.
                </p>
            </div>
        </div>
    );
};

export default AdminAnalyticsPage;