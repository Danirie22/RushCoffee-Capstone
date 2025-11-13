





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
import RewardsPage from './src/pages/Rewards/RewardsPage';
import ProfilePage from './src/pages/Profile/ProfilePage';
import AboutPage from './src/pages/Home/AboutPage';
import ContactPage from './src/pages/Home/ContactPage';
import FAQPage from './src/pages/Home/FAQPage';
import { AuthProvider } from './src/context/AuthContext';
import { CartProvider, useCart } from './src/context/CartContext';
import { OrderProvider } from './src/context/OrderContext';
import CartSidebar from './src/components/menu/CartSidebar';
import ScrollToTop from './src/components/utils/ScrollToTop';
import RushCoffeeLogo from './src/components/layout/RushCoffeeLogo';

// Placeholder for pages that are not yet created
const ComingSoon: React.FC<{ title: string }> = ({ title }) => {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex flex-1 items-center justify-center bg-gradient-to-br from-primary-50 to-coffee-50">
        <div className="p-4 text-center">
          <RushCoffeeLogo className="mx-auto mb-4 h-16 w-16 text-gray-400 opacity-50" />
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
          <RushCoffeeLogo className="mx-auto mb-4 h-16 w-16 text-gray-400 opacity-50" />
          <h1 className="mb-4 font-display text-4xl font-bold text-gray-900">
            404 - Page Not Found
          </h1>
          <p className="mb-8 text-gray-600">This coffee blend doesn't exist on our menu. Maybe it got lost in the daily grind?</p>
          <Link to="/" className="font-medium text-primary-600 transition-colors hover:text-primary-700">
            ← Back to Home
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
};

// Wrapper component to use hooks from contexts
const AppContent: React.FC = () => {
  const { isCartOpen, closeCart, cartItems, updateQuantity, removeFromCart, showToast } = useCart();
  const navigate = useNavigate();

  const handleCheckout = () => {
    closeCart();
    navigate('/checkout');
  };

  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/menu" element={<MenuPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/auth/login" element={<LoginPage />} />
        <Route path="/auth/register" element={<RegisterPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/queue" element={<QueuePage />} />
        <Route path="/rewards" element={<RewardsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/faq" element={<FAQPage />} />
        <Route path="/terms" element={<ComingSoon title="Terms of Service" />} />
        <Route path="/privacy" element={<ComingSoon title="Privacy Policy" />} />
        <Route path="/cookies" element={<ComingSoon title="Cookie Policy" />} />
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
      {showToast && (
        <div className="fixed bottom-4 right-4 z-[100] animate-fade-in-up rounded-lg bg-gray-900 px-4 py-3 text-white shadow-lg">
            {showToast}
        </div>
      )}
    </>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <OrderProvider>
        <CartProvider>
          <HashRouter>
            <AppContent />
          </HashRouter>
        </CartProvider>
      </OrderProvider>
    </AuthProvider>
  );
};

export default App;