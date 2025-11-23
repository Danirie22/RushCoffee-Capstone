import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ClipboardList, Coffee, LogOut, User, LayoutDashboard, Package, Users, BookOpen, History } from 'lucide-react';
import RushCoffeeLogo from '../layout/RushCoffeeLogo';

const EmployeeLayout: React.FC = () => {
    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    const navItems = [
        { path: '/employee', label: 'Dashboard', icon: LayoutDashboard, end: true },
        { path: '/employee/orders', label: 'Orders', icon: ClipboardList },
        { path: '/employee/queue', label: 'Queue', icon: Coffee },
        { path: '/employee/inventory', label: 'Inventory', icon: Package },
        { path: '/employee/customers', label: 'Customers', icon: Users },
        { path: '/employee/menu', label: 'Menu', icon: BookOpen },
        { path: '/employee/history', label: 'Order History', icon: History },
    ];

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <aside className="w-64 bg-white shadow-lg">
                <div className="flex h-full flex-col">
                    {/* Logo */}
                    <div className="flex items-center gap-3 border-b border-gray-200 p-6">
                        <RushCoffeeLogo className="h-10 w-10 text-primary-600" />
                        <div>
                            <h1 className="font-display text-xl font-bold text-gray-900">Rush Coffee</h1>
                            <p className="text-xs text-gray-500">Employee Portal</p>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 space-y-1 p-4">
                        {navItems.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                end={item.end}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${isActive
                                        ? 'bg-primary-50 text-primary-700'
                                        : 'text-gray-700 hover:bg-gray-50'
                                    }`
                                }
                            >
                                <item.icon className="h-5 w-5" />
                                {item.label}
                            </NavLink>
                        ))}
                    </nav>

                    {/* User Info & Logout */}
                    <div className="border-t border-gray-200 p-4">
                        <div className="mb-3 flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 text-primary-700">
                                <User className="h-5 w-5" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-semibold text-gray-900">
                                    {currentUser?.firstName} {currentUser?.lastName}
                                </p>
                                <p className="text-xs text-gray-500 capitalize">{currentUser?.role}</p>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="flex w-full items-center gap-2 rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200"
                        >
                            <LogOut className="h-4 w-4" />
                            Logout
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto">
                <div className="p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default EmployeeLayout;
