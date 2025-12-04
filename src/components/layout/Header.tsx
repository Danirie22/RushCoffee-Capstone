import * as React from 'react';
import { NavLink } from 'react-router-dom';
import { Menu, Zap } from 'lucide-react';

import RushCoffeeLogo from './RushCoffeeLogo';
import AuthModal from '../auth/AuthModal';
import VerificationModal from '../auth/VerificationModal';
import SpinWheelModal from '../gamification/SpinWheelModal';

import { useHeader } from '../../hooks/useHeader';
import HeaderNav from './header/HeaderNav';
import HeaderAuth from './header/HeaderAuth';
import CartButton from './header/CartButton';
import MobileMenu from './header/MobileMenu';

const Header: React.FC = () => {
    const {
        isMobileMenuOpen,
        isUserMenuOpen,
        setIsUserMenuOpen,
        userMenuRef,
        isAuthModalOpen,
        setIsAuthModalOpen,
        authModalView,
        isVerifyModalOpen,
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
    } = useHeader();

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
                    <HeaderNav links={navLinks} />

                    {/* Desktop Auth Controls - Right side */}
                    <div className="hidden items-center justify-end gap-4 md:flex md:justify-self-end">
                        <HeaderAuth
                            isAuthenticated={!!(showLoggedInState && currentUser)}
                            currentUser={currentUser}
                            isUserMenuOpen={isUserMenuOpen}
                            setIsUserMenuOpen={setIsUserMenuOpen}
                            onLoginClick={() => openAuthModal('login')}
                            onRegisterClick={() => openAuthModal('register')}
                            onLogoutClick={handleLogout}
                            userMenuRef={userMenuRef}
                        />

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
                                <CartButton totalItems={totalCartItems} onClick={openCart} />
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
                                <CartButton totalItems={totalCartItems} onClick={openCart} />
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
            <MobileMenu
                isOpen={isMobileMenuOpen}
                onClose={closeMobileMenu}
                currentUser={currentUser}
                isAuthenticated={!!(showLoggedInState && currentUser)}
                navLinks={navLinks}
                onLoginClick={() => openAuthModal('login')}
                onRegisterClick={() => openAuthModal('register')}
                onLogoutClick={handleLogout}
            />

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
