import * as React from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { UserRole } from '../types';
import { loggedInNavLinks, loggedOutNavLinks } from '../components/layout/header/navigationData';

export const useHeader = () => {
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
    const [searchParams] = useSearchParams();

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

        if (userRole === UserRole.ADMIN) {
            navigate('/admin');
        } else if (userRole === UserRole.EMPLOYEE) {
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

    return {
        isMobileMenuOpen,
        isUserMenuOpen,
        setIsUserMenuOpen,
        userMenuRef,
        isAuthModalOpen,
        setIsAuthModalOpen,
        authModalView,
        isVerifyModalOpen,
        setIsVerifyModalOpen,
        verifyEmail,
        verifyUserId,
        isSpinWheelOpen,
        setIsSpinWheelOpen,
        currentUser,
        totalCartItems,
        openCart,
        showLoggedInState,
        navLinks,
        closeMobileMenu,
        toggleMobileMenu,
        openAuthModal,
        handleVerificationNeeded,
        handleVerificationSuccess,
        handleVerificationClose,
        handleBackToLogin,
        handleLogout
    };
};
