import * as React from 'react';
import { NavLink, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { Menu, X, LogOut, ShoppingCart, ChevronDown, User, Gift, Info, Phone, Shield, TrendingUp, Zap } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import RushCoffeeLogo from './RushCoffeeLogo';
import AuthModal from '../auth/AuthModal';
import VerificationModal from '../auth/VerificationModal';
import SpinWheelModal from '../gamification/SpinWheelModal';

const loggedOutNavLinks = [
    { href: '/', label: 'Home' },
    { href: '/about', label: 'About' },
    { href: '/menu', label: 'Menu' },
    { href: '/drink-lab', label: 'Drink Lab' },
    { href: '/contact', label: 'Contact' },
];

const loggedInNavLinks = [
    { href: '/menu', label: 'Menu' },
    { href: '/drink-lab', label: 'Drink Lab' },
    { href: '/queue', label: 'Queue' },
    { href: '/rewards', label: 'Rewards' },
]

const userDropdownLinks = [
    { href: '/profile', label: 'My Profile', Icon: User },
    { href: '/flavor-profile', label: 'My Flavor Profile', Icon: TrendingUp },
    { href: '/rewards', label: 'My Rewards', Icon: Gift },
    { href: '/about', label: 'About', Icon: Info },
    { href: '/contact', label: 'Contact', Icon: Phone },
]

const Header: React.FC = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = React.useState(false);
    const userMenuRef = React.useRef<HTMLDivElement>(null);

    // Auth Modal State
    const [isAuthModalOpen, setIsAuthModalOpen] = React.useState(false);
    const [authModalView, setAuthModalView] = React.useState<'login' | 'register'>('login');

    // Verification Modal State
    const [isVerifyModalOpen, setIsVerifyModalOpen] = React.useState(false);
    const [verifyEmail, setVerifyEmail] = React.useState('');
    const [verifyUserId, setVerifyUserId] = React.useState('');

    // Spin Wheel Modal State
    const [isSpinWheelOpen, setIsSpinWheelOpen] = React.useState(false);

    const { currentUser, logout } = useAuth();
    const { totalCartItems, openCart } = useCart();
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams, setSearchParams] = useSearchParams();

    // If we are on the verification page OR if 2FA is pending OR if the auth modal is open, pretend we are logged out
    const isVerifying = location.pathname === '/auth/verify-email';
    const isPending2FA = sessionStorage.getItem('requires2FA') === 'true';
    const showLoggedInState = currentUser && !isVerifying && !isPending2FA && !isAuthModalOpen && location.pathname !== '/';

    const navLinks = showLoggedInState ? loggedInNavLinks : loggedOutNavLinks;

    const closeMobileMenu = () => setIsMobileMenuOpen(false);

    const openAuthModal = (view: 'login' | 'register') => {
        setAuthModalView(view);
        setIsAuthModalOpen(true);
        closeMobileMenu();
    };

    // Handle URL-based modal opening
    React.useEffect(() => {
        const authParam = searchParams.get('auth');
        if (authParam === 'login') {
            setAuthModalView('login');
            setIsAuthModalOpen(true);
        } else if (authParam === 'register') {
            setAuthModalView('register');
            setIsAuthModalOpen(true);
        }
    }, [searchParams]);

    const handleVerificationNeeded = (email: string, userId: string, role?: string) => {
        setIsAuthModalOpen(false); // Close the login/register modal first
        setVerifyEmail(email);
        setVerifyUserId(userId);
        setIsVerifyModalOpen(true);
    };

    const handleVerificationSuccess = (role?: string) => {
        setIsAuthModalOpen(false); // Ensure AuthModal is closed
        setIsVerifyModalOpen(false);
        sessionStorage.removeItem('requires2FA');

        // Role-based redirect after login
        // Use passed role if available (avoids race condition), otherwise fall back to currentUser
        const userRole = role || currentUser?.role;

        if (userRole === 'admin') {
            navigate('/admin');
        } else if (userRole === 'employee') {
            navigate('/employee');
        } else {
            navigate('/menu'); // customers
        }
    };

    const handleVerificationClose = () => {
        setIsVerifyModalOpen(false);
        sessionStorage.removeItem('requires2FA');
        logout();
    };

    const handleBackToLogin = () => {
        setIsVerifyModalOpen(false);
        sessionStorage.removeItem('requires2FA');
        logout();
        setAuthModalView('login');
        setIsAuthModalOpen(true);
    };

    // Close user dropdown when clicking outside
    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
                setIsUserMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    React.useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768) {
                setIsMobileMenuOpen(false);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    React.useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [isMobileMenuOpen]);

    const handleLogout = async () => {
        await logout();
        closeMobileMenu();
        setIsUserMenuOpen(false);
        navigate('/');
    };

    const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

    const renderAuthControls = (isMobile = false) => {
        const baseButtonClass = "rounded-full text-sm font-semibold transition-colors";
        const mobileButtonClass = "block w-full text-center py-3 text-base";
        const desktopButtonClass = "px-6 py-2";

        if (showLoggedInState && currentUser) {
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
                                {(currentUser.role === 'employee' || currentUser.role === 'admin') && (
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
                                {currentUser.role === 'admin' && (
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
                                    onClick={handleLogout}
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
                    onClick={() => openAuthModal('login')}
                    className={`${baseButtonClass} border border-primary-600 text-primary-600 hover:bg-primary-50 ${isMobile ? mobileButtonClass : desktopButtonClass}`}>
                    Login
                </button>
                <button
                    onClick={() => openAuthModal('register')}
                    className={`${baseButtonClass} bg-primary-600 text-white shadow-sm hover:bg-primary-700 ${isMobile ? mobileButtonClass : desktopButtonClass}`}>
                    Sign Up
                </button>
            </div>
        );
    }

    const CartButton = () => (
        <button
            onClick={openCart}
            className="relative rounded-full p-2 text-gray-700 transition hover:bg-gray-100"
            aria-label={`Open cart with ${totalCartItems} items`}
        >
            <ShoppingCart className="h-6 w-6" />
            {totalCartItems > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white" aria-hidden="true">
                    {totalCartItems}
                </span>
            )}
        </button>
    );

    return (
        <>
            <header className="sticky top-0 z-50 w-full border-b border-gray-200/80 bg-white/95 shadow-md backdrop-blur-sm">
                <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:h-20 sm:px-6 lg:px-8 md:grid md:grid-cols-3">
                    {/* Logo - Left side */}
                    <NavLink to={currentUser ? "/menu" : "/"} className="flex items-center gap-2 flex-shrink-0 md:justify-self-start">
                        <RushCoffeeLogo className="h-7 w-7 text-primary-600 sm:h-8 sm:w-8" />
                        <span className="text-lg font-bold text-primary-600 whitespace-nowrap sm:text-2xl">
                            Rush Coffee
                        </span>
                    </NavLink>

                    {/* Desktop Navigation - Center */}
                    <nav className="hidden items-center justify-center space-x-8 md:flex md:justify-self-center">
                        {navLinks.map((link) => (
                            <NavLink
                                key={link.label}
                                to={link.href}
                                className={({ isActive }) =>
                                    `relative text-sm font-normal uppercase transition-colors hover:text-primary-600 ${isActive ? 'text-primary-600' : 'text-gray-700'
                                    } after:absolute after:bottom-0 after:left-0 after:h-[1px] after:w-full after:origin-center after:transform after:bg-primary-600 after:transition-transform after:duration-300 ${isActive ? 'after:scale-x-100' : 'after:scale-x-0'
                                    } hover:after:scale-x-100`
                                }
                            >
                                {link.label}
                            </NavLink>
                        ))}
                    </nav>

                    {/* Desktop Auth Controls - Right side */}
                    <div className="hidden items-center justify-end gap-4 md:flex md:justify-self-end">
                        {renderAuthControls()}
                        {showLoggedInState && (
                            <>
                                <button
                                    onClick={() => setIsSpinWheelOpen(true)}
                                    className="relative flex items-center justify-center h-10 w-10 rounded-full bg-gradient-to-r from-yellow-500 to-red-600 text-white hover:from-yellow-600 hover:to-red-700 transition-all hover:scale-110 shadow-lg"
                                    aria-label="Spin Wheel"
                                    title="Spin to win!"
                                >
                                    <Zap className="h-5 w-5" />
                                    <span className="absolute -top-1 -right-1 h-3 w-3 bg-blue-500 rounded-full animate-pulse"></span>
                                </button>
                                <CartButton />
                            </>
                        )}
                    </div>

                    {/* Mobile Cart & Menu - Right side */}
                    <div className="flex items-center justify-end gap-2 md:hidden">
                        {showLoggedInState && (
                            <>
                                <button
                                    onClick={() => setIsSpinWheelOpen(true)}
                                    className="relative flex items-center justify-center h-10 w-10 rounded-full bg-gradient-to-r from-yellow-500 to-red-600 text-white hover:from-yellow-600 hover:to-red-700 transition-all hover:scale-110 shadow-lg"
                                    aria-label="Spin Wheel"
                                >
                                    <Zap className="h-5 w-5" />
                                    <span className="absolute -top-1 -right-1 h-3 w-3 bg-blue-500 rounded-full animate-pulse"></span>
                                </button>
                                <CartButton />
                            </>
                        )}
                        <button
                            onClick={toggleMobileMenu}
                            className="rounded-md p-2 text-gray-700 transition hover:bg-gray-100"
                            aria-label="Toggle menu"
                            aria-expanded={isMobileMenuOpen}
                        >
                            <Menu className="h-6 w-6" />
                        </button>
                    </div>
                </div>
            </header>

            {/* Mobile Menu */}
            <div className={`fixed inset-0 z-[60] md:hidden ${isMobileMenuOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}>
                {/* Backdrop */}
                <div
                    className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0'}`}
                    onClick={closeMobileMenu}
                    aria-hidden="true"
                />

                {/* Menu Panel */}
                <div
                    className={`absolute top-0 right-0 h-full w-4/5 max-w-sm transform bg-white shadow-2xl transition-transform duration-300 ease-out ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="mobile-menu-title"
                >
                    <div className="flex items-center justify-between border-b p-4">
                        <NavLink to={currentUser ? "/menu" : "/"} className="flex items-center gap-2" onClick={closeMobileMenu}>
                            <RushCoffeeLogo className="h-7 w-7 text-primary-600" />
                            <span id="mobile-menu-title" className="text-xl font-bold text-primary-600">
                                Rush Coffee
                            </span>
                        </NavLink>
                        <button
                            onClick={closeMobileMenu}
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
                                onClick={closeMobileMenu}
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

                        {showLoggedInState && (
                            <div className="mt-4 border-t pt-4">
                                <p className="mb-2 px-4 text-xs font-semibold uppercase tracking-wider text-gray-400">
                                    Account
                                </p>
                                {userDropdownLinks.map(link => (
                                    <NavLink
                                        key={link.label}
                                        to={link.href}
                                        onClick={closeMobileMenu}
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
                                {(currentUser.role === 'employee' || currentUser.role === 'admin') && (
                                    <NavLink
                                        to="/employee"
                                        onClick={closeMobileMenu}
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
                                {currentUser.role === 'admin' && (
                                    <NavLink
                                        to="/admin"
                                        onClick={closeMobileMenu}
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
                        {showLoggedInState ? (
                            <button
                                onClick={handleLogout}
                                className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-50 px-6 py-3 text-base font-semibold text-red-600 transition-colors hover:bg-red-100"
                            >
                                <LogOut className="h-5 w-5" />
                                Logout
                            </button>
                        ) : (
                            renderAuthControls(true)
                        )}
                    </div>
                </div>
            </div>

            {/* Auth Modal */}
            <AuthModal
                isOpen={isAuthModalOpen}
                onClose={() => setIsAuthModalOpen(false)}
                initialView={authModalView}
                onVerificationNeeded={handleVerificationNeeded}
                onAuthSuccess={handleVerificationSuccess}
            />

            {/* Verification Modal */}
            <VerificationModal
                isOpen={isVerifyModalOpen}
                onClose={handleVerificationClose}
                email={verifyEmail}
                userId={verifyUserId}
                onSuccess={() => handleVerificationSuccess()}
                onBackToLogin={handleBackToLogin}
            />

            {/* Spin Wheel Modal */}
            <SpinWheelModal
                isOpen={isSpinWheelOpen}
                onClose={() => setIsSpinWheelOpen(false)}
            />
        </>
    );
};

export default Header;
