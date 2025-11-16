
import React from 'react';
import { Settings } from 'lucide-react';
import Card from '../../../components/ui/Card';

const AdminSettingsPage: React.FC = () => {
    return (
        <div>
            <h1 className="mb-6 font-display text-3xl font-bold text-gray-800">Shop Settings</h1>

            <div className="mt-6 flex flex-col items-center justify-center rounded-lg border-2 border-dashed bg-gray-50 p-12 text-center">
                <Settings className="h-16 w-16 text-gray-400" />
                <h2 className="mt-4 text-xl font-semibold text-gray-700">More Settings Coming Soon</h2>
                <p className="mt-1 text-gray-500">
                    This is where you'll manage your shop's information, hours, and other system settings.
                </p>
            </div>
        </div>
    );
};

export default AdminSettingsPage;
