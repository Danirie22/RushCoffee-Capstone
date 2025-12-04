import * as React from 'react';
import { NavLink } from 'react-router-dom';
import { ChevronDown, LogOut, Shield } from 'lucide-react';
import { UserRole, UserProfile } from '../../../types';
import { userDropdownLinks } from './navigationData';

interface HeaderAuthProps {
    isAuthenticated: boolean;
    currentUser: UserProfile | null;
    isMobile?: boolean;
    isUserMenuOpen: boolean;
    setIsUserMenuOpen: (isOpen: boolean) => void;
    onLoginClick: () => void;
    onRegisterClick: () => void;
    onLogoutClick: () => void;
    userMenuRef?: React.RefObject<HTMLDivElement>;
}

const HeaderAuth: React.FC<HeaderAuthProps> = ({
    isAuthenticated,
    currentUser,
    isMobile = false,
    isUserMenuOpen,
    setIsUserMenuOpen,
    onLoginClick,
    onRegisterClick,
    onLogoutClick,
    userMenuRef
}) => {
    const baseButtonClass = "rounded-full text-sm font-semibold transition-colors";
    const mobileButtonClass = "block w-full text-center py-3 text-base";
    const desktopButtonClass = "px-6 py-2";

    if (isAuthenticated && currentUser) {
        const initials = `${currentUser.firstName?.charAt(0) || ''}${currentUser.lastName?.charAt(0) || ''}`.toUpperCase();

        return (
            <div className={`relative ${isMobile ? 'w-full' : ''}`} ref={userMenuRef}>
                <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className={`flex items-center justify-center transition-colors focus:outline-none ${isMobile
                        ? 'w-full gap-3 rounded-xl border border-gray-200 p-3 hover:bg-gray-50'
                        : `h-10 w-10 rounded-full ${!currentUser.photoURL ? 'bg-primary-600 text-white hover:bg-primary-700' : 'ring-2 ring-primary-100'} shadow-sm overflow-hidden`
                        }`}
                    aria-label="User menu"
                    aria-haspopup="true"
                    aria-expanded={isUserMenuOpen}
                >
                    {isMobile ? (
                        <>
                            <div className={`flex h-10 w-10 items-center justify-center rounded-full ${!currentUser.photoURL ? 'bg-primary-600 text-white' : ''} overflow-hidden`}>
                                {currentUser.photoURL ? (
                                    <img src={currentUser.photoURL} alt="Profile" className="h-full w-full object-cover" />
                                ) : (
                                    <span className="text-sm font-bold">{initials}</span>
                                )}
                            </div>
                            <div className="flex flex-col items-start">
                                <span className="text-sm font-bold text-gray-900">{currentUser.firstName} {currentUser.lastName}</span>
                                <span className="text-xs text-gray-500">{currentUser.email}</span>
                            </div>
                            <ChevronDown className={`ml-auto h-4 w-4 text-gray-400 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                        </>
                    ) : (
                        currentUser.photoURL ? (
                            <img src={currentUser.photoURL} alt="Profile" className="h-full w-full object-cover" />
                        ) : (
                            <span className="text-sm font-bold">{initials}</span>
                        )
                    )}
                </button>
                {isUserMenuOpen && !isMobile && (
                    <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none animate-fade-in-up">
                        <div className="py-1" role="menu" aria-orientation="vertical">
                            <div className="px-4 py-3 border-b border-gray-100">
                                <p className="text-sm font-medium text-gray-900">{currentUser.firstName} {currentUser.lastName}</p>
                                <p className="text-xs text-gray-500 truncate">{currentUser.email}</p>
                            </div>
                            {userDropdownLinks.map(link => (
                                <NavLink
                                    key={link.label}
                                    to={link.href}
                                    onClick={() => setIsUserMenuOpen(false)}
                                    className={({ isActive }) => `flex items-center gap-3 px-4 py-2 text-sm transition-colors hover:bg-gray-100 ${isActive ? 'text-primary-600 font-semibold' : 'text-gray-700'}`}
                                    role="menuitem"
                                >
                                    <link.Icon className="h-4 w-4" />
                                    {link.label}
                                </NavLink>
                            ))}
                            {(currentUser.role === UserRole.EMPLOYEE || currentUser.role === UserRole.ADMIN) && (
                                <>
                                    <hr className="my-1" />
                                    <NavLink
                                        to="/employee"
                                        onClick={() => setIsUserMenuOpen(false)}
                                        className="flex items-center gap-3 px-4 py-2 text-sm font-semibold text-blue-700 transition-colors hover:bg-blue-50"
                                        role="menuitem"
                                    >
                                        <Shield className="h-4 w-4" />
                                        Employee Portal
                                    </NavLink>
                                </>
                            )}
                            {currentUser.role === UserRole.ADMIN && (
                                <NavLink
                                    to="/admin"
                                    onClick={() => setIsUserMenuOpen(false)}
                                    className="flex items-center gap-3 px-4 py-2 text-sm font-semibold text-yellow-700 transition-colors hover:bg-yellow-50"
                                    role="menuitem"
                                >
                                    <Shield className="h-4 w-4" />
                                    Admin Dashboard
                                </NavLink>
                            )}
                            <hr className="my-1" />
                            <button
                                onClick={onLogoutClick}
                                className="flex w-full items-center gap-3 px-4 py-2 text-left text-sm text-red-600 transition-colors hover:bg-red-50"
                                role="menuitem"
                            >
                                <LogOut className="h-4 w-4" />
                                Logout
                            </button>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className={`flex items-center ${isMobile ? 'flex-col space-y-3' : 'gap-4'}`}>
            <button
                onClick={onLoginClick}
                className={`${baseButtonClass} border border-primary-600 text-primary-600 hover:bg-primary-50 ${isMobile ? mobileButtonClass : desktopButtonClass}`}>
                Login
            </button>
            <button
                onClick={onRegisterClick}
                className={`${baseButtonClass} bg-primary-600 text-white shadow-sm hover:bg-primary-700 ${isMobile ? mobileButtonClass : desktopButtonClass}`}>
                Sign Up
            </button>
        </div>
    );
};

export default HeaderAuth;
