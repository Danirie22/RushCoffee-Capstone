import * as React from 'react';
import { HashRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';
import ForgotPasswordPage from './pages/Auth/ForgotPasswordPage';
import MenuPage from './pages/Menu/MenuPage';
import CheckoutPage from './pages/Checkout/CheckoutPage';
import QueuePage from './pages/Queue/QueuePage';
import RewardsPage from './pages/Rewards/RewardsPage';
import ProfilePage from './pages/Profile/ProfilePage';
import AboutPage from './pages/Home/AboutPage';
import ContactPage from './pages/ContactPage';
import FAQPage from './pages/Home/FAQPage';
import { NotificationProvider } from './context/NotificationContext';
import OrderNotification from './components/ui/OrderNotification';
import { AuthProvider } from './context/AuthContext';
import { CartProvider, useCart } from './context/CartContext';
import { OrderProvider } from './context/OrderContext';
import { ProductProvider } from './context/ProductContext';
import CartSidebar from './components/menu/CartSidebar';
import ScrollToTop from './components/utils/ScrollToTop';
import RushCoffeeLogo from './components/layout/RushCoffeeLogo';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminDashboardPage from './pages/Admin/AdminDashboardPage';
import AdminQueuePage from './pages/Admin/AdminQueuePage';
import AdminLayout from './components/admin/AdminLayout';
import AdminInventoryPage from './pages/Admin/AdminInventoryPage';
import AdminProductsPage from './pages/Admin/AdminProductsPage';
import AdminAnalyticsPage from './pages/Admin/AdminAnalyticsPage';
import AdminFeedbackPage from './pages/Admin/AdminFeedbackPage';
import AdminSettingsPage from './pages/Admin/AdminSettingsPage';
import AdminOrdersHistoryPage from './pages/Admin/AdminOrdersHistoryPage';
import AdminUsersPage from './pages/Admin/AdminUsersPage';
import TermsPage from './pages/Home/TermsPage';
import PrivacyPolicyPage from './pages/Home/PrivacyPolicyPage';
import CookiePolicyPage from './pages/Home/CookiePolicyPage';
import EmployeeLayout from './components/employee/EmployeeLayout';
import EmployeeOrdersPage from './pages/Employee/EmployeeOrdersPage';
import EmployeeDashboardPage from './pages/Employee/EmployeeDashboardPage';
import EmployeeCustomersPage from './pages/Employee/EmployeeCustomersPage';
import EmployeeOrdersHistoryPage from './pages/Employee/EmployeeOrdersHistoryPage';

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
    const {
        isCartOpen,
        closeCart,
        cartItems,
        updateQuantity,
        removeFromCart,
        toastMessage,
        selectedItemIds,
        toggleItemSelection,
        selectAllItems,
        deselectAllItems
    } = useCart();
    const navigate = useNavigate();

    const handleCheckout = () => {
        closeCart();
        navigate('/checkout');
    };

    return (
        <>
            <ScrollToTop />
            <OrderNotification />
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/menu" element={<MenuPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/auth/login" element={<LoginPage />} />
                <Route path="/auth/register" element={<RegisterPage />} />
                <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/queue" element={<QueuePage />} />
                <Route path="/rewards" element={<RewardsPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/faq" element={<FAQPage />} />
                <Route path="/terms" element={<TermsPage />} />
                <Route path="/privacy" element={<PrivacyPolicyPage />} />
                <Route path="/cookies" element={<CookiePolicyPage />} />

                {/* Employee Routes - Accessible by employee and admin roles */}
                <Route element={<ProtectedRoute allowedRoles={['employee', 'admin']} />}>
                    <Route path="/employee" element={<EmployeeLayout />}>
                        <Route index element={<EmployeeDashboardPage />} />
                        <Route path="orders" element={<EmployeeOrdersPage />} />
                        <Route path="queue" element={<AdminQueuePage />} />
                        <Route path="inventory" element={<AdminInventoryPage />} />
                        <Route path="customers" element={<EmployeeCustomersPage />} />
                        <Route path="menu" element={<AdminProductsPage />} />
                        <Route path="history" element={<EmployeeOrdersHistoryPage />} />
                    </Route>
                </Route>

                {/* Admin Routes - Only accessible by admin role */}
                <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                    <Route path="/admin" element={<AdminLayout />}>
                        <Route index element={<AdminDashboardPage />} />
                        <Route path="queue" element={<AdminQueuePage />} />
                        <Route path="inventory" element={<AdminInventoryPage />} />
                        <Route path="products" element={<AdminProductsPage />} />
                        <Route path="analytics" element={<AdminAnalyticsPage />} />
                        <Route path="feedback" element={<AdminFeedbackPage />} />
                        <Route path="settings" element={<AdminSettingsPage />} />
                        <Route path="history" element={<AdminOrdersHistoryPage />} />
                        <Route path="users" element={<AdminUsersPage />} />
                    </Route>
                </Route>

                <Route path="*" element={<NotFound />} />
            </Routes>
            <CartSidebar
                isOpen={isCartOpen}
                onClose={closeCart}
                cartItems={cartItems}
                onUpdateQuantity={updateQuantity}
                onRemoveItem={removeFromCart}
                onCheckout={handleCheckout}
                selectedItemIds={selectedItemIds}
                onToggleItemSelection={toggleItemSelection}
                onSelectAll={selectAllItems}
                onDeselectAll={deselectAllItems}
            />
            {toastMessage && (
                <div className="fixed bottom-4 right-4 z-[100] animate-fade-in-up rounded-lg bg-gray-900 px-4 py-3 text-white shadow-lg">
                    {toastMessage}
                </div>
            )}
        </>
    );
};

const App: React.FC = () => {
    return (
        <AuthProvider>
            <NotificationProvider>
                <ProductProvider>
                    <OrderProvider>
                        <CartProvider>
                            <HashRouter>
                                <AppContent />
                            </HashRouter>
                        </CartProvider>
                    </OrderProvider>
                </ProductProvider>
            </NotificationProvider>
        </AuthProvider>
    );
};

export default App;