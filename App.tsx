



import React from 'react';
import { HashRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import Header from './src/components/layout/Header';
import Footer from './src/components/layout/Footer';
import LoginPage from './src/pages/Auth/LoginPage';
import RegisterPage from './src/pages/Auth/RegisterPage';
import MenuPage from './src/pages/Menu/MenuPage';
import CheckoutPage from './src/pages/Checkout/CheckoutPage';
import QueuePage from './src/pages/Queue/QueuePage';
import { AuthProvider } from './src/context/AuthContext';
import { CartProvider, useCart } from './src/context/CartContext';
import { OrderProvider } from './src/context/OrderContext';
import CartSidebar from './src/components/menu/CartSidebar';
import ScrollToTop from './src/components/utils/ScrollToTop';

// Placeholder for pages that are not yet created
const ComingSoon: React.FC<{ title: string }> = ({ title }) => {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex flex-1 items-center justify-center bg-gradient-to-br from-primary-50 to-coffee-50">
        <div className="p-4 text-center">
          <div className="mb-4 text-6xl" role="img" aria-label="coffee cup">☕</div>
          <h1 className="mb-4 font-display text-4xl font-bold text-gray-900">
            {title}
          </h1>
          <p className="mb-8 text-gray-600">We're brewing something special. Check back soon!</p>
          <Link to="/" className="font-medium text-primary-600 transition-colors hover:text-primary-700">
            ← Back to Home
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
};

// 404 Not Found page
const NotFound: React.FC = () => {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex flex-1 items-center justify-center bg-gradient-to-br from-primary-50 to-coffee-50">
        <div className="p-4 text-center">
          <div className="mb-4 text-6xl" role="img" aria-label="crying face emoji">😢</div>
          <h1 className="mb-4 font-display text-4xl font-bold text-gray-900">
            404 - Page Not Found
          </h1>
          <p className="mb-8 text-gray-600">This coffee blend doesn't exist on our menu!</p>
          <Link to="/" className="font-medium text-primary-600 transition-colors hover:text-primary-700">
            ← Back to Home
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
};

const AppContent: React.FC = () => {
    const { 
        isCartOpen, 
        closeCart, 
        cartItems, 
        updateQuantity, 
        removeFromCart,
        toastMessage
    } = useCart();
    const navigate = useNavigate();

    const handleCheckout = () => {
        closeCart();
        navigate('/checkout');
    };

    return (
        <>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/about" element={<ComingSoon title="About Rush Coffee" />} />
                <Route path="/menu" element={<MenuPage />} />
                <Route path="/contact" element={<ComingSoon title="Contact Us" />} />
                
                {/* Auth Routes */}
                <Route path="/auth/login" element={<LoginPage />} />
                <Route path="/auth/register" element={<RegisterPage />} />
                <Route path="/queue" element={<QueuePage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                
                {/* Legal Routes */}
                <Route path="/terms" element={<ComingSoon title="Terms of Service" />} />
                <Route path="/privacy" element={<ComingSoon title="Privacy Policy" />} />

                <Route path="*" element={<NotFound />} />
            </Routes>
            <CartSidebar
                isOpen={isCartOpen}
                onClose={closeCart}
                cartItems={cartItems}
                onUpdateQuantity={updateQuantity}
                onRemoveItem={removeFromCart}
                onCheckout={handleCheckout}
            />
            {toastMessage && (
                <div className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2 transform rounded-full bg-coffee-900 px-4 py-2 text-sm font-medium text-white shadow-lg transition-all animate-fade-in-up md:bottom-6">
                    {toastMessage}
                </div>
            )}
        </>
    );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <CartProvider>
        <OrderProvider>
            <HashRouter>
                <ScrollToTop />
                <AppContent />
            </HashRouter>
        </OrderProvider>
      </CartProvider>
    </AuthProvider>
  );
};

export default App;