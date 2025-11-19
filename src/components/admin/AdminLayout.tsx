

import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Coffee, Settings, BarChart3, ClipboardList, Package, MessageSquare, LogOut } from 'lucide-react';

import RushCoffeeLogo from '../layout/RushCoffeeLogo';
import { useAuth } from '../../context/AuthContext';
import ConfirmLogoutModal from './ConfirmLogoutModal';

const sidebarNavLinks = [
    { to: '/admin', text: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/queue', text: 'Queue Management', icon: ClipboardList },
    { to: '/admin/inventory', text: 'Inventory', icon: Package },
    { to: '/admin/products', text: 'Products', icon: Coffee },
    { to: '/admin/feedback', text: 'Feedback', icon: MessageSquare },
    { to: '/admin/analytics', text: 'Analytics', icon: BarChart3 },
    { to: '/admin/settings', text: 'Settings', icon: Settings },
];


const AdminLayout: React.FC = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

    const handleLogoutClick = () => {
        setIsLogoutModalOpen(true);
    };

    const handleConfirmLogout = async () => {
        try {
            await logout();
            navigate('/auth/login');
        } catch (error) {
            console.error("Failed to log out:", error);
        } finally {
            setIsLogoutModalOpen(false);
        }
    };
    
    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <aside className="hidden w-64 flex-shrink-0 bg-gray-800 p-4 text-white md:flex md:flex-col">
                <div className="mb-8 flex items-center gap-2 px-2">
                    <RushCoffeeLogo className="h-8 w-8 text-primary-400" />
                    <span className="text-xl font-bold text-white">Admin Panel</span>
                </div>
                <nav className="flex-grow">
                    <ul>
                        {sidebarNavLinks.map(({ to, text, icon: Icon }) => (
                            <li key={to} className="mb-1">
                                <NavLink
                                    to={to}
                                    end={to === '/admin'}
                                    className={({ isActive }) =>
                                        `flex items-center gap-3 rounded-md px-3 py-2 transition-colors ${
                                            isActive
                                                ? 'bg-primary-600 text-white'
                                                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                                        }`
                                    }
                                >
                                    <Icon className="h-5 w-5" />
                                    <span>{text}</span>
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                </nav>
                 <div className="mt-4 border-t border-gray-700 pt-4">
                     <button
                        onClick={handleLogoutClick}
                        className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-gray-300 transition-colors hover:bg-red-500/80 hover:text-white"
                    >
                        <LogOut className="h-5 w-5" />
                        <span>Logout</span>
                    </button>
                </div>
                 <div className="mt-4 text-center text-xs text-gray-400">
                    <p>&copy; {new Date().getFullYear()} Rush Coffee</p>
                </div>
            </aside>
            
            {/* Main Content */}
            <div className="flex flex-1 flex-col overflow-hidden">
                <header className="border-b bg-white shadow-sm">
                    <div className="flex h-16 items-center justify-between px-6">
                        <h1 className="text-xl font-semibold text-gray-800">Dashboard</h1>
                        <div>{/* User menu or other header items can go here */}</div>
                    </div>
                </header>
                <main className="flex-1 overflow-y-auto p-6">
                    <Outlet />
                </main>
            </div>
            
            <ConfirmLogoutModal 
                isOpen={isLogoutModalOpen}
                onClose={() => setIsLogoutModalOpen(false)}
                onConfirm={handleConfirmLogout}
            />
        </div>
    );
};

export default AdminLayout;
