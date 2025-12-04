import * as React from 'react';
import { NavLink } from 'react-router-dom';
import { X, LogOut, Shield } from 'lucide-react';
import RushCoffeeLogo from '../RushCoffeeLogo';
import { UserRole, UserProfile } from '../../../types';
import { userDropdownLinks } from './navigationData';
import HeaderAuth from './HeaderAuth';

interface MobileMenuProps {
    isOpen: boolean;
    onClose: () => void;
    currentUser: UserProfile | null;
    isAuthenticated: boolean;
    navLinks: { href: string; label: string }[];
    onLoginClick: () => void;
    onRegisterClick: () => void;
    onLogoutClick: () => void;
}

const MobileMenu: React.FC<MobileMenuProps> = ({
    isOpen,
    onClose,
    currentUser,
    isAuthenticated,
    navLinks,
    onLoginClick,
    onRegisterClick,
    onLogoutClick
}) => {
    return (
        <div className={`fixed inset-0 z-[60] md:hidden ${isOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}>
            {/* Backdrop */}
            <div
                className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Menu Panel */}
            <div
                className={`absolute top-0 right-0 h-full w-4/5 max-w-sm transform bg-white shadow-2xl transition-transform duration-300 ease-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
                role="dialog"
                aria-modal="true"
                aria-labelledby="mobile-menu-title"
            >
                <div className="flex items-center justify-between border-b p-4">
                    <NavLink to={currentUser ? "/menu" : "/"} className="flex items-center gap-2" onClick={onClose}>
                        <RushCoffeeLogo className="h-7 w-7 text-primary-600" />
                        <span id="mobile-menu-title" className="text-xl font-bold text-primary-600">
                            Rush Coffee
                        </span>
                    </NavLink>
                    <button
                        onClick={onClose}
                        className="rounded-full p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
                        aria-label="Close menu"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <nav className="flex flex-1 flex-col gap-2 overflow-y-auto p-4">
                    {navLinks.map((link) => (
                        <NavLink
                            key={link.label}
                            to={link.href}
                            onClick={onClose}
                            className={({ isActive }) =>
                                `rounded-xl px-4 py-3 text-lg font-medium transition-all ${isActive
                                    ? 'bg-primary-50 text-primary-700'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                }`
                            }
                        >
                            {link.label}
                        </NavLink>
                    ))}

                    {isAuthenticated && currentUser && (
                        <div className="mt-4 border-t pt-4">
                            <p className="mb-2 px-4 text-xs font-semibold uppercase tracking-wider text-gray-400">
                                Account
                            </p>
                            {userDropdownLinks.map(link => (
                                <NavLink
                                    key={link.label}
                                    to={link.href}
                                    onClick={onClose}
                                    className={({ isActive }) =>
                                        `flex items-center gap-3 rounded-xl px-4 py-3 text-base font-medium transition-all ${isActive
                                            ? 'bg-primary-50 text-primary-700'
                                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                        }`
                                    }
                                >
                                    <link.Icon className="h-5 w-5" />
                                    {link.label}
                                </NavLink>
                            ))}
                            {(currentUser.role === UserRole.EMPLOYEE || currentUser.role === UserRole.ADMIN) && (
                                <NavLink
                                    to="/employee"
                                    onClick={onClose}
                                    className={({ isActive }) =>
                                        `flex items-center gap-3 rounded-xl px-4 py-3 text-base font-medium transition-all ${isActive
                                            ? 'bg-blue-50 text-blue-800'
                                            : 'text-blue-700 hover:bg-blue-50'
                                        }`
                                    }
                                >
                                    <Shield className="h-5 w-5" />
                                    Employee Portal
                                </NavLink>
                            )}
                            {currentUser.role === UserRole.ADMIN && (
                                <NavLink
                                    to="/admin"
                                    onClick={onClose}
                                    className={({ isActive }) =>
                                        `flex items-center gap-3 rounded-xl px-4 py-3 text-base font-medium transition-all ${isActive
                                            ? 'bg-yellow-50 text-yellow-800'
                                            : 'text-yellow-700 hover:bg-yellow-50'
                                        }`
                                    }
                                >
                                    <Shield className="h-5 w-5" />
                                    Admin Dashboard
                                </NavLink>
                            )}
                        </div>
                    )}
                </nav>

                <div className="border-t p-4">
                    {isAuthenticated ? (
                        <button
                            onClick={onLogoutClick}
                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-50 px-6 py-3 text-base font-semibold text-red-600 transition-colors hover:bg-red-100"
                        >
                            <LogOut className="h-5 w-5" />
                            Logout
                        </button>
                    ) : (
                        <HeaderAuth
                            isAuthenticated={false}
                            currentUser={null}
                            isMobile={true}
                            isUserMenuOpen={false}
                            setIsUserMenuOpen={() => { }}
                            onLoginClick={onLoginClick}
                            onRegisterClick={onRegisterClick}
                            onLogoutClick={onLogoutClick}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default MobileMenu;
