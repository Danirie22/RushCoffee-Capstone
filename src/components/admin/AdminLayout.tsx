

import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Coffee, Settings, BarChart3, ClipboardList, Package, MessageSquare, LogOut, Menu, X, History } from 'lucide-react';

import RushCoffeeLogo from '../layout/RushCoffeeLogo';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../firebaseConfig';
import ConfirmLogoutModal from './ConfirmLogoutModal';

const sidebarNavLinks = [
    { to: '/admin', text: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/queue', text: 'Queue Management', icon: ClipboardList },
    { to: '/admin/inventory', text: 'Inventory', icon: Package },
    { to: '/admin/products', text: 'Products', icon: Coffee },
    { to: '/admin/feedback', text: 'Feedback', icon: MessageSquare },
    { to: '/admin/history', text: 'Order History', icon: History },
    { to: '/admin/users', text: 'User Management', icon: Users },
    { to: '/admin/analytics', text: 'Analytics', icon: BarChart3 },
    { to: '/admin/settings', text: 'Settings', icon: Settings },
];


const AdminLayout: React.FC = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    const [waitingCount, setWaitingCount] = useState(0);

    // Listen for waiting orders count
    useEffect(() => {
        const unsubscribe = db.collection('orders')
            .where('status', '==', 'waiting')
            .onSnapshot(snapshot => {
                setWaitingCount(snapshot.size);
            });
        return () => unsubscribe();
    }, []);

    // Determine current page title
    const currentPath = location.pathname;
    // Find exact match or default to Dashboard. 
    // Note: This simple logic assumes flat routes. For nested routes, you might need startsWith logic.
    const activeLink = sidebarNavLinks.find(link => link.to === currentPath) || sidebarNavLinks[0];
    const pageTitle = activeLink.text;

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

    const closeMobileSidebar = () => {
        setIsMobileSidebarOpen(false);
    };

    // Close mobile sidebar on navigation
    useEffect(() => {
        closeMobileSidebar();
    }, [navigate]);

    // Prevent body scroll when mobile sidebar is open
    useEffect(() => {
        if (isMobileSidebarOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [isMobileSidebarOpen]);

    const SidebarContent = ({ isMobile = false }) => (
        <>
            <div className="mb-8 flex items-center justify-between gap-2 px-2">
                <div className="flex items-center gap-2">
                    <RushCoffeeLogo className="h-8 w-8 text-primary-600" />
                    <span className="text-xl font-bold text-white">Owner Panel</span>
                </div>
                {isMobile && (
                    <button
                        onClick={closeMobileSidebar}
                        className="rounded-md p-2 text-gray-300 transition hover:bg-gray-700 hover:text-white xl:hidden"
                        aria-label="Close menu"
                    >
                        <X className="h-6 w-6" />
                    </button>
                )}
            </div>
            <nav className="flex-grow">
                <ul>
                    {sidebarNavLinks.map(({ to, text, icon: Icon }) => (
                        <li key={to} className="mb-1">
                            <NavLink
                                to={to}
                                end={to === '/admin'}
                                onClick={isMobile ? closeMobileSidebar : undefined}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 rounded-md px-3 py-2 transition-colors ${isActive
                                        ? 'bg-primary-600 text-white'
                                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                                    }`
                                }
                            >
                                <Icon className="h-5 w-5 flex-shrink-0" />
                                <span className="flex-1 whitespace-nowrap">{text}</span>
                                {to === '/admin/queue' && waitingCount > 0 && (
                                    <span className="ml-auto grid h-5 w-5 flex-shrink-0 place-items-center rounded-full bg-rose-500 pr-[1px] text-xs font-bold leading-none text-white shadow-sm">
                                        {waitingCount}
                                    </span>
                                )}
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
        </>
    );

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Desktop Sidebar */}
            <aside className="hidden w-64 flex-shrink-0 bg-gray-800 p-4 text-white xl:flex xl:flex-col">
                <SidebarContent />
            </aside>

            {/* Mobile Sidebar Overlay */}
            <div
                className={`fixed inset-0 z-50 transform transition-opacity duration-300 xl:hidden ${isMobileSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                    }`}
            >
                {/* Backdrop */}
                <div
                    className="absolute inset-0 bg-black/50"
                    onClick={closeMobileSidebar}
                    aria-hidden="true"
                />

                {/* Sidebar */}
                <aside
                    className={`fixed top-0 left-0 flex h-full w-64 flex-col bg-gray-800 p-4 text-white shadow-2xl transition-transform duration-300 ease-in-out ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                        }`}
                    role="dialog"
                    aria-modal="true"
                    aria-label="Mobile navigation menu"
                >
                    <SidebarContent isMobile />
                </aside>
            </div>

            {/* Main Content */}
            <div className="flex flex-1 flex-col overflow-hidden">
                <header className="border-b bg-white shadow-sm">
                    <div className="flex h-16 items-center justify-between px-4 sm:px-6">
                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setIsMobileSidebarOpen(true)}
                            className="relative rounded-md p-1.5 text-gray-700 transition hover:bg-gray-100 xl:hidden"
                            aria-label="Open menu"
                            aria-expanded={isMobileSidebarOpen}
                        >
                            <Menu className="h-5 w-5" />
                            {waitingCount > 0 && (
                                <span className="absolute top-1 right-1 block h-2.5 w-2.5 rounded-full bg-rose-500 ring-2 ring-white" />
                            )}
                        </button>

                        <h1 className="text-lg font-semibold text-gray-800 sm:text-xl">{pageTitle}</h1>
                        <div className="w-10 xl:w-0">{/* Spacer for mobile to center title */}</div>
                    </div>
                </header>
                <main id="admin-main-content" className="flex-1 overflow-y-auto p-4 sm:p-6">
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
