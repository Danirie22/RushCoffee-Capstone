import * as React from 'react';
import { HashRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import { NotificationProvider } from './context/NotificationContext';
import OrderNotification from './components/ui/OrderNotification';
import { AuthProvider } from './context/AuthContext';
import { CartProvider, useCart, CartItem, Customizations } from './context/CartContext';
import { OrderProvider } from './context/OrderContext';
import { ProductProvider } from './context/ProductContext';
import CartSidebar from './components/menu/CartSidebar';
import ProductCustomizeModal from './components/menu/ProductCustomizeModal';
import { Product, ProductSize } from './data/mockProducts';
import ScrollToTop from './components/utils/ScrollToTop';
import RushCoffeeLogo from './components/layout/RushCoffeeLogo';
import ProtectedRoute from './components/auth/ProtectedRoute';
import PageLoader from './components/ui/PageLoader';
import { ReCaptchaProvider } from './context/ReCaptchaContext';
import ChatBot from './components/common/ChatBot';

// Lazy load pages
const HomePage = React.lazy(() => import('./pages/HomePage'));
const LoginPage = React.lazy(() => import('./pages/Auth/LoginPage'));
const RegisterPage = React.lazy(() => import('./pages/Auth/RegisterPage'));
const ForgotPasswordPage = React.lazy(() => import('./pages/Auth/ForgotPasswordPage'));
const MenuPage = React.lazy(() => import('./pages/Menu/MenuPage'));
const CheckoutPage = React.lazy(() => import('./pages/Checkout/CheckoutPage'));
const QueuePage = React.lazy(() => import('./pages/Queue/QueuePage'));
const RewardsPage = React.lazy(() => import('./pages/Rewards/RewardsPage'));
const ProfilePage = React.lazy(() => import('./pages/Profile/ProfilePage'));
const FlavorProfilePage = React.lazy(() => import('./pages/Profile/FlavorProfilePage'));
const AboutPage = React.lazy(() => import('./pages/Home/AboutPage'));
const ContactPage = React.lazy(() => import('./pages/ContactPage'));
const FAQPage = React.lazy(() => import('./pages/Home/FAQPage'));
const TermsPage = React.lazy(() => import('./pages/Home/TermsPage'));
const PrivacyPolicyPage = React.lazy(() => import('./pages/Home/PrivacyPolicyPage'));
const CookiePolicyPage = React.lazy(() => import('./pages/Home/CookiePolicyPage'));
const DrinkLabPage = React.lazy(() => import('./pages/DrinkLab/DrinkLabPage'));

// Admin Pages
const AdminLayout = React.lazy(() => import('./components/admin/AdminLayout'));
const AdminDashboardPage = React.lazy(() => import('./pages/Admin/AdminDashboardPage'));
const AdminQueuePage = React.lazy(() => import('./pages/Admin/AdminQueuePage'));
const AdminInventoryPage = React.lazy(() => import('./pages/Admin/AdminInventoryPage'));
const AdminProductsPage = React.lazy(() => import('./pages/Admin/AdminProductsPage'));
const AdminAnalyticsPage = React.lazy(() => import('./pages/Admin/AdminAnalyticsPage'));
const AdminFeedbackPage = React.lazy(() => import('./pages/Admin/AdminFeedbackPage'));
const AdminSettingsPage = React.lazy(() => import('./pages/Admin/AdminSettingsPage'));
const AdminOrdersHistoryPage = React.lazy(() => import('./pages/Admin/AdminOrdersHistoryPage'));
const AdminUsersPage = React.lazy(() => import('./pages/Admin/AdminUsersPage'));

// Employee Pages
const EmployeeLayout = React.lazy(() => import('./components/employee/EmployeeLayout'));
const POSDashboard = React.lazy(() => import('./pages/Employee/POSDashboard'));
const POSPage = React.lazy(() => import('./pages/Employee/POSPage'));

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
        updateCartItem,
        removeFromCart,
        toastMessage,
        selectedItemIds,
        toggleItemSelection,
        selectAllItems,
        deselectAllItems
    } = useCart();
    const navigate = useNavigate();

    // State for editing cart items
    const [editingCartItem, setEditingCartItem] = React.useState<CartItem | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);

    const handleCheckout = () => {
        closeCart();
        navigate('/checkout');
    };

    const handleEditCartItem = (cartItem: CartItem) => {
        setEditingCartItem(cartItem);
        setIsEditModalOpen(true);
    };

    const handleUpdateCartItem = (customizations: Customizations, quantity: number, totalPrice?: number, selectedSize?: ProductSize) => {
        if (editingCartItem && selectedSize) {
            updateCartItem(editingCartItem.id, editingCartItem.product, selectedSize, customizations, quantity);
            setIsEditModalOpen(false);
            setEditingCartItem(null);
        }
    };

    return (
        <>
            <ScrollToTop />
            <OrderNotification />
            <React.Suspense fallback={<PageLoader />}>
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/menu" element={<MenuPage />} />
                    <Route path="/drink-lab" element={<DrinkLabPage />} />
                    <Route path="/contact" element={<ContactPage />} />
                    <Route path="/auth/login" element={<LoginPage />} />
                    <Route path="/auth/register" element={<RegisterPage />} />
                    <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
                    <Route path="/checkout" element={<CheckoutPage />} />
                    <Route path="/queue" element={<QueuePage />} />
                    <Route path="/rewards" element={<RewardsPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/flavor-profile" element={<FlavorProfilePage />} />
                    <Route path="/faq" element={<FAQPage />} />
                    <Route path="/terms" element={<TermsPage />} />
                    <Route path="/privacy" element={<PrivacyPolicyPage />} />
                    <Route path="/cookies" element={<CookiePolicyPage />} />

                    {/* Admin Routes */}
                    <Route element={<ProtectedRoute />}>
                        <Route path="/admin" element={<AdminLayout />}>
                            <Route index element={<AdminDashboardPage />} />
                            <Route path="queue" element={<AdminQueuePage />} />
                            <Route path="history" element={<AdminOrdersHistoryPage />} />
                            <Route path="users" element={<AdminUsersPage />} />
                            <Route path="inventory" element={<AdminInventoryPage />} />
                            <Route path="products" element={<AdminProductsPage />} />
                            <Route path="analytics" element={<AdminAnalyticsPage />} />
                            <Route path="feedback" element={<AdminFeedbackPage />} />
                            <Route path="settings" element={<AdminSettingsPage />} />
                        </Route>
                    </Route>

                    {/* Employee Routes */}
                    <Route element={<ProtectedRoute allowedRoles={['employee', 'admin']} />}>
                        <Route path="/employee" element={<EmployeeLayout />}>
                            <Route index element={<POSDashboard />} />
                            <Route path="pos" element={<POSPage />} />
                            <Route path="queue" element={<AdminQueuePage />} />
                            <Route path="inventory" element={<AdminInventoryPage />} />
                            <Route path="history" element={<AdminOrdersHistoryPage />} />
                        </Route>
                    </Route>

                    <Route path="*" element={<NotFound />} />
                </Routes>
            </React.Suspense>
            <CartSidebar
                isOpen={isCartOpen}
                onClose={closeCart}
                cartItems={cartItems}
                onUpdateQuantity={updateQuantity}
                onRemoveItem={removeFromCart}
                onCheckout={handleCheckout}
                onEditItem={handleEditCartItem}
                selectedItemIds={selectedItemIds}
                onToggleItemSelection={toggleItemSelection}
                onSelectAll={selectAllItems}
                onDeselectAll={deselectAllItems}
            />
            {editingCartItem && (
                <ProductCustomizeModal
                    product={editingCartItem.product}
                    selectedSize={editingCartItem.selectedSize}
                    isOpen={isEditModalOpen}
                    onClose={() => {
                        setIsEditModalOpen(false);
                        setEditingCartItem(null);
                    }}
                    onConfirm={handleUpdateCartItem}
                    initialCustomizations={editingCartItem.customizations}
                    initialQuantity={editingCartItem.quantity}
                />
            )}
            {toastMessage && (
                <div className="fixed bottom-4 right-4 z-[100] animate-fade-in-up rounded-lg bg-gray-900 px-4 py-3 text-white shadow-lg">
                    {toastMessage}
                </div>
            )}
            <ChatBot />
        </>
    );
};

const App: React.FC = () => {
    return (
        <AuthProvider>
            <ReCaptchaProvider>
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
            </ReCaptchaProvider>
        </AuthProvider>
    );
};

export default App;