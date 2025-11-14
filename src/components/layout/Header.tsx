
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, ShoppingCart, ChevronDown, User, Gift, Info, Phone } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import RushCoffeeLogo from './RushCoffeeLogo';

const loggedOutNavLinks = [
    { href: '/', label: 'Home' },
    { href: '/about', label: 'About' },
    { href: '/menu', label: 'Menu' },
    { href: '/contact', label: 'Contact' },
];

const loggedInNavLinks = [
    { href: '/menu', label: 'Menu' },
    { href: '/queue', label: 'Queue' },
    { href: '/rewards', label: 'Rewards' },
]

const userDropdownLinks = [
    { href: '/profile', label: 'My Profile', Icon: User },
    { href: '/rewards', label: 'My Rewards', Icon: Gift },
    { href: '/about', label: 'About', Icon: Info },
    { href: '/contact', label: 'Contact', Icon: Phone },
]

const Header: React.FC = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = React.useState(false);
    const userMenuRef = React.useRef<HTMLDivElement>(null);

    const { currentUser, logout } = useAuth();
    const { totalCartItems, openCart } = useCart();
    const navigate = useNavigate();
    
    const navLinks = currentUser ? loggedInNavLinks : loggedOutNavLinks;

    const closeMobileMenu = () => setIsMobileMenuOpen(false);

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
        const clickHandler = isMobile ? closeMobileMenu : undefined;

        if (currentUser) {
            return (
                 <div className={`relative ${isMobile ? 'w-full' : ''}`} ref={userMenuRef}>
                    <button 
                        onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                        className={`flex w-full items-center justify-center gap-2 rounded-full border border-primary-600 px-4 py-2 text-sm font-semibold text-primary-600 transition-colors hover:bg-primary-50 ${isMobile ? 'text-base' : ''}`}
                    >
                        <span>Welcome, {currentUser.firstName}!</span>
                        <ChevronDown className={`h-4 w-4 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {isUserMenuOpen && !isMobile && (
                        <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                            <div className="py-1">
                                {userDropdownLinks.map(link => (
                                     <NavLink 
                                        key={link.label}
                                        to={link.href} 
                                        onClick={() => setIsUserMenuOpen(false)}
                                        className={({ isActive }) => `flex items-center gap-3 px-4 py-2 text-sm transition-colors hover:bg-gray-100 ${isActive ? 'text-primary-600 font-semibold' : 'text-gray-700'}`}>
                                        <link.Icon className="h-4 w-4" />
                                        {link.label}
                                    </NavLink>
                                ))}
                                <hr className="my-1"/>
                                <button 
                                    onClick={handleLogout}
                                    className="flex w-full items-center gap-3 px-4 py-2 text-left text-sm text-red-600 transition-colors hover:bg-red-50"
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
                 <NavLink 
                    to="/auth/login" 
                    onClick={clickHandler}
                    className={`${baseButtonClass} border border-primary-600 text-primary-600 hover:bg-primary-50 ${isMobile ? mobileButtonClass : desktopButtonClass}`}>
                    Login
                </NavLink>
                <NavLink 
                    to="/auth/register" 
                    onClick={clickHandler}
                    className={`${baseButtonClass} bg-primary-600 text-white shadow-sm hover:bg-primary-700 ${isMobile ? mobileButtonClass : desktopButtonClass}`}>
                    Sign Up
                </NavLink>
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
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                    {totalCartItems}
                </span>
            )}
        </button>
    );

    return (
        <>
            <header className="sticky top-0 z-50 w-full border-b border-gray-200/80 bg-white/95 shadow-md backdrop-blur-sm">
                <div className="container mx-auto flex h-20 items-center justify-between px-4 sm:px-6 lg:px-8">
                    <NavLink to="/" className="flex items-center gap-2">
                        <RushCoffeeLogo className="h-8 w-8 text-primary-600" />
                        <span className="text-2xl font-bold text-primary-600">
                            Rush Coffee
                        </span>
                    </NavLink>

                    <nav className="hidden items-center space-x-8 md:flex">
                        {navLinks.map((link) => (
                            <NavLink
                                key={link.label}
                                to={link.href}
                                className={({ isActive }) =>
                                    `text-base font-medium transition-colors hover:text-primary-600 ${
                                        isActive ? 'text-primary-600' : 'text-gray-700'
                                    }`
                                }
                            >
                                {link.label}
                            </NavLink>
                        ))}
                    </nav>

                    <div className="hidden items-center gap-2 md:flex">
                        {renderAuthControls()}
                        {currentUser && <CartButton />}
                    </div>

                    <div className="flex items-center gap-2 md:hidden">
                        {currentUser && <CartButton />}
                        <button
                            onClick={toggleMobileMenu}
                            className="rounded-md p-2 text-gray-700 transition hover:bg-gray-100"
                            aria-label="Toggle menu"
                        >
                            <Menu className="h-6 w-6" />
                        </button>
                    </div>
                </div>
            </header>

            {/* Mobile Menu */}
            <div
                className={`fixed inset-0 z-40 transform transition-opacity duration-300 md:hidden ${
                    isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
            >
                <div
                    className="absolute inset-0 bg-black/50"
                    onClick={closeMobileMenu}
                ></div>

                <div
                    className={`fixed top-0 right-0 flex h-full w-4/5 max-w-sm flex-col bg-white shadow-2xl transition-transform duration-300 ease-in-out ${
                        isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
                    }`}
                >
                    <div className="flex items-center justify-between border-b p-4">
                         <NavLink to="/" className="flex items-center gap-2" onClick={closeMobileMenu}>
                            <RushCoffeeLogo className="h-7 w-7 text-primary-600" />
                            <span className="text-xl font-bold text-primary-600">
                                Rush Coffee
                            </span>
                        </NavLink>
                        <button
                            onClick={closeMobileMenu}
                            className="rounded-md p-2 text-gray-700 transition hover:bg-gray-100"
                            aria-label="Close menu"
                        >
                            <X className="h-6 w-6" />
                        </button>
                    </div>
                    <nav className="flex flex-col gap-4 p-4">
                        {navLinks.map((link) => (
                            <NavLink
                                key={link.label}
                                to={link.href}
                                onClick={closeMobileMenu}
                                className={({ isActive }) =>
                                    `rounded-md px-3 py-2 text-lg font-medium transition-colors hover:bg-gray-100 ${
                                        isActive ? 'bg-primary-50 text-primary-600' : 'text-gray-800'
                                    }`
                                }
                            >
                                {link.label}
                            </NavLink>
                        ))}
                         {currentUser && (
                            <div className="border-t pt-4 mt-2">
                                {userDropdownLinks.map(link => (
                                    <NavLink
                                        key={link.label}
                                        to={link.href}
                                        onClick={closeMobileMenu}
                                        className={({ isActive }) =>
                                            `flex items-center gap-3 rounded-md px-3 py-2 text-lg font-medium transition-colors hover:bg-gray-100 ${
                                                isActive ? 'bg-primary-50 text-primary-600' : 'text-gray-800'
                                            }`
                                        }
                                    >
                                        <link.Icon className="h-5 w-5"/>
                                        {link.label}
                                    </NavLink>
                                ))}
                            </div>
                        )}
                    </nav>
                    <div className="mt-auto border-t p-4 space-y-3">
                       {currentUser ? (
                           <button 
                                onClick={handleLogout}
                                className="flex w-full items-center justify-center gap-2 rounded-full bg-red-500 px-6 py-3 text-base font-semibold text-white shadow-sm transition-colors hover:bg-red-600"
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
        </>
    );
};

export default Header;
