
import React from 'react';
import { Coffee } from 'lucide-react';

const AdminProductsPage: React.FC = () => {
    return (
        <div>
            <h1 className="mb-6 font-display text-3xl font-bold text-gray-800">Product Management</h1>
            <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed bg-gray-50 p-12 text-center">
                <Coffee className="h-16 w-16 text-gray-400" />
                <h2 className="mt-4 text-xl font-semibold text-gray-700">Coming Soon</h2>
                <p className="mt-1 text-gray-500">
                    This is where you'll be able to add, edit, and manage your products and their recipes.
                </p>
            </div>
        </div>
    );
};

export default AdminProductsPage;
