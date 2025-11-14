
import React from 'react';
import { BarChart, Users, Coffee, DollarSign } from 'lucide-react';
import Card from '../../../components/ui/Card';

const AdminDashboardPage: React.FC = () => {
    return (
        <div>
            <h1 className="mb-6 font-display text-3xl font-bold text-gray-800">Admin Dashboard</h1>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <Card className="flex items-center gap-4 p-6">
                    <div className="rounded-full bg-blue-100 p-3">
                        <DollarSign className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Total Revenue</p>
                        <p className="text-2xl font-bold text-gray-800">₱12,450.00</p>
                    </div>
                </Card>
                <Card className="flex items-center gap-4 p-6">
                     <div className="rounded-full bg-green-100 p-3">
                        <Coffee className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Orders Today</p>
                        <p className="text-2xl font-bold text-gray-800">78</p>
                    </div>
                </Card>
                 <Card className="flex items-center gap-4 p-6">
                     <div className="rounded-full bg-yellow-100 p-3">
                        <Users className="h-6 w-6 text-yellow-600" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">New Customers</p>
                        <p className="text-2xl font-bold text-gray-800">12</p>
                    </div>
                </Card>
                 <Card className="flex items-center gap-4 p-6">
                     <div className="rounded-full bg-purple-100 p-3">
                        <BarChart className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Pending Orders</p>
                        <p className="text-2xl font-bold text-gray-800">5</p>
                    </div>
                </Card>
            </div>
            <div className="mt-8">
                <Card>
                    <h2 className="text-xl font-bold text-gray-800">Sales Overview</h2>
                    <div className="mt-4 flex h-64 items-center justify-center bg-gray-100">
                        <p className="text-gray-500">[Chart Placeholder]</p>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default AdminDashboardPage;
