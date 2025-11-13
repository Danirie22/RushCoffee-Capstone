
import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { Coffee, Menu, X, ShoppingCart } from 'lucide-react';

const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/about', label: 'About' },
    { href: '/menu', label: 'Menu' },
    { href: '/contact', label: 'Contact' },
];

const Header: React.FC = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768) {
                setIsMenuOpen(false);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        if (isMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [isMenuOpen]);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };
    
    const closeMenu = () => {
        setIsMenuOpen(false);
    }

    return (
        <>
            <header className="sticky top-0 z-50 w-full border-b border-gray-200/80 bg-white/95 shadow-md backdrop-blur-sm">
                <div className="container mx-auto flex h-20 items-center justify-between px-4 sm:px-6 lg:px-8">
                    <NavLink to="/" className="flex items-center gap-2">
                        <Coffee className="h-8 w-8 text-primary-600" />
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

                    <div className="hidden items-center gap-4 md:flex">
                         <NavLink to="/auth/login" className="rounded-full border border-primary-600 px-6 py-2 text-sm font-semibold text-primary-600 transition-colors hover:bg-primary-50">
                            Login
                        </NavLink>
                        <NavLink to="/auth/register" className="rounded-full bg-primary-600 px-6 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-700">
                            Sign Up
                        </NavLink>
                    </div>

                    <div className="flex items-center md:hidden">
                        <button
                            onClick={toggleMenu}
                            className="rounded-md p-2 text-gray-700 transition hover:bg-gray-100"
                            aria-label="Toggle menu"
                        >
                            <Menu className="h-6 w-6" />
                        </button>
                    </div>
                </div>
            </header>

            <div
                className={`fixed inset-0 z-40 transform transition-opacity duration-300 md:hidden ${
                    isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
            >
                <div
                    className="absolute inset-0 bg-black/50"
                    onClick={closeMenu}
                ></div>

                <div
                    className={`fixed top-0 right-0 flex h-full w-4/5 max-w-sm flex-col bg-white shadow-2xl transition-transform duration-300 ease-in-out ${
                        isMenuOpen ? 'translate-x-0' : 'translate-x-full'
                    }`}
                >
                    <div className="flex items-center justify-between border-b p-4">
                         <NavLink to="/" className="flex items-center gap-2" onClick={closeMenu}>
                            <Coffee className="h-7 w-7 text-primary-600" />
                            <span className="text-xl font-bold text-primary-600">
                                Rush Coffee
                            </span>
                        </NavLink>
                        <button
                            onClick={closeMenu}
                            className="rounded-md p-2 text-gray-700 transition hover:bg-gray-100"
                            aria-label="Close menu"
                        >
                            <X className="h-6 w-6" />
                        </button>
                    </div>
                    <nav className="flex flex-1 flex-col gap-4 p-4">
                        {navLinks.map((link) => (
                            <NavLink
                                key={link.label}
                                to={link.href}
                                onClick={closeMenu}
                                className={({ isActive }) =>
                                    `rounded-md px-3 py-2 text-lg font-medium transition-colors hover:bg-gray-100 ${
                                        isActive ? 'bg-primary-50 text-primary-600' : 'text-gray-800'
                                    }`
                                }
                            >
                                {link.label}
                            </NavLink>
                        ))}
                    </nav>
                    <div className="mt-auto space-y-3 border-t p-4">
                        <NavLink to="/auth/login" className="block w-full text-center rounded-full border border-primary-600 px-6 py-3 text-base font-semibold text-primary-600 transition-colors hover:bg-primary-50">
                            Login
                        </NavLink>
                        <NavLink to="/auth/register" className="block w-full text-center rounded-full bg-primary-600 px-6 py-3 text-base font-semibold text-white shadow-sm transition-colors hover:bg-primary-700">
                            Sign Up
                        </NavLink>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Header;
