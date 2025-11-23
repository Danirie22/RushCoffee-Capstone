// Queue Page - Fully Polished v11 (All Refinements)
import * as React from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { ArrowRight, Bell, X, Clock, TrendingUp, Award, Coffee, Star, Plus, Sparkles, Check, XCircle } from 'lucide-react';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import ModernQueueCard from '../../components/queue/ModernQueueCard';
import ProductCustomizeModal from '../../components/menu/ProductCustomizeModal';
import { useAuth } from '../../context/AuthContext';
import { useOrder } from '../../context/OrderContext';
import { useProduct } from '../../context/ProductContext';
import { useCart } from '../../context/CartContext';
import RushCoffeeLogo from '../../components/layout/RushCoffeeLogo';
import { rushCoffeeLogoBase64 } from '../../assets/rush-coffee-logo-base64';
import {
    requestNotificationPermission,
    showNotification,
    getNotificationPermission,
    isNotificationSupported
} from '../../utils/notifications';
import { Product, ProductSize, mockProducts } from '../../data/mockProducts';

// Skeleton Loader Components
const StatCardSkeleton = () => (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-md border border-gray-100 text-center animate-pulse">
        <div className="flex flex-col items-center">
            <div className="h-12 w-12 rounded-full bg-gray-200 mb-3"></div>
            <div className="h-8 w-16 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 w-12 bg-gray-200 rounded"></div>
        </div>
    </div>
);

const OrderCardSkeleton = () => (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-5 shadow-md border border-gray-100 animate-pulse">
        <div className="flex items-start gap-4">
            <div className="flex-shrink-0 h-16 w-16 rounded-xl bg-gray-200"></div>
            <div className="flex-1 min-w-0">
                <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            </div>
        </div>
    </div>
);

const QueuePage: React.FC = () => {
    const { currentUser } = useAuth();
    const { activeOrder, orderHistory } = useOrder();
    const { products, isLoading: productsLoading } = useProduct();
    const { addToCart, showToast } = useCart();
    const location = useLocation();
    const navigate = useNavigate();

    const [notificationPermission, setNotificationPermission] = React.useState<NotificationPermission>('default');
    const [showPermissionBanner, setShowPermissionBanner] = React.useState(false);
    const notificationSentForOrder = React.useRef<string | null>(null);

    // State for Quick Add Modal
    const [selectedProduct, setSelectedProduct] = React.useState<Product | null>(null);
    const [isCustomizeModalOpen, setIsCustomizeModalOpen] = React.useState(false);

    // Track dismissed completed orders to prevent them from reappearing
    const [dismissedOrderIds, setDismissedOrderIds] = React.useState<string[]>(() => {
        const saved = localStorage.getItem('dismissedOrderIds');
        return saved ? JSON.parse(saved) : [];
    });

    // Persist dismissed orders to localStorage
    React.useEffect(() => {
        localStorage.setItem('dismissedOrderIds', JSON.stringify(dismissedOrderIds));
    }, [dismissedOrderIds]);

    // Determine which order to display (Active OR Undismissed Completed/Cancelled)
    const displayOrder = React.useMemo(() => {
        if (activeOrder) return activeOrder;

        // If no active order, check the most recent order
        if (orderHistory.length > 0) {
            const mostRecent = orderHistory[0];
            // If it's completed OR cancelled and NOT dismissed, show it
            if ((mostRecent.status === 'completed' || mostRecent.status === 'cancelled') && !dismissedOrderIds.includes(mostRecent.id)) {
                return mostRecent;
            }
        }
        return null;
    }, [activeOrder, orderHistory, dismissedOrderIds]);

    // Get a featured product (use Context products, fallback to mockProducts if empty)
    const featuredProduct = React.useMemo(() => {
        const sourceProducts = products.length > 0 ? products : mockProducts;
        if (sourceProducts.length > 0) {
            return sourceProducts[0];
        }
        return null;
    }, [products]);

    // State for success message
    const [showSuccessMessage, setShowSuccessMessage] = React.useState(location.state?.fromCheckout || false);

    // Auto-dismiss success message
    React.useEffect(() => {
        if (showSuccessMessage) {
            const timer = setTimeout(() => {
                setShowSuccessMessage(false);
                // Clear the state from history so it doesn't reappear on refresh
                window.history.replaceState({}, document.title);
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [showSuccessMessage]);

    // Check notification permission on mount
    React.useEffect(() => {
        if (isNotificationSupported()) {
            const permission = getNotificationPermission();
            setNotificationPermission(permission);
            if (permission === 'default') {
                setShowPermissionBanner(true);
            }
        }
    }, []);

    // Effect to trigger notification when order is ready
    React.useEffect(() => {
        if (
            activeOrder &&
            activeOrder.status === 'ready' &&
            notificationPermission === 'granted' &&
            notificationSentForOrder.current !== activeOrder.id
        ) {
            // Send notification using the new utility
            showNotification({
                title: "Your Order is Ready! ☕",
                body: `Your Rush Coffee order (${activeOrder.orderNumber}) is now ready for pickup.`,
                icon: rushCoffeeLogoBase64,
                tag: activeOrder.id, // Prevents duplicate notifications for the same order
                data: { orderId: activeOrder.id, orderNumber: activeOrder.orderNumber }
            }).then((success) => {
                if (success) {
                    console.log('Notification sent successfully');
                    notificationSentForOrder.current = activeOrder.id;
                }
            });
        }

        // Reset sent flag if there's no active order or it's completed
        if (!activeOrder || activeOrder.status === 'completed') {
            notificationSentForOrder.current = null;
        }
    }, [activeOrder, notificationPermission]);

    const handleRequestPermission = async () => {
        if (!isNotificationSupported()) {
            alert('This browser does not support notifications');
            return;
        }

        const permission = await requestNotificationPermission();
        setNotificationPermission(permission);
        if (permission === 'granted' || permission === 'denied') {
            setShowPermissionBanner(false);
        }
    };

    const handleDismiss = () => {
        if (displayOrder) {
            setDismissedOrderIds(prev => [...prev, displayOrder.id]);
        }
    };

    // Handle Quick Add
    const handleQuickAddClick = (product: Product) => {
        setSelectedProduct(product);
        setIsCustomizeModalOpen(true);
    };

    const handleConfirmCustomization = (customizations: any, quantity: number) => {
        if (selectedProduct) {
            const defaultSize = selectedProduct.sizes[0];

            // Corrected addToCart usage: passing arguments individually
            addToCart(selectedProduct, defaultSize, customizations, quantity);

            showToast(`Added ${quantity} ${selectedProduct.name} to cart`);
            setIsCustomizeModalOpen(false);
        }
    };

    // Get recent completed/cancelled orders (LIMIT TO 2 for better visual balance)
    const recentOrders = React.useMemo(() => {
        return orderHistory
            .filter(order => order.status === 'completed' || order.status === 'cancelled')
            .slice(0, 2); // Changed from 3 to 2
    }, [orderHistory]);

    // Helper function to get product image by ID
    const getProductImage = (productId: string): string | null => {
        const product = products.find(p => p.id === productId);
        return product?.imageUrl || null;
    };

    if (!currentUser) {
        // Guest view or logged out user
        return (
            <div className="flex min-h-screen flex-col bg-gradient-to-br from-coffee-50 via-gray-50 to-primary-50 relative">
                {/* Background Pattern */}
                <div className="fixed inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-10 left-10 h-32 w-32 rounded-full bg-coffee-600 blur-3xl opacity-5"></div>
                    <div className="absolute bottom-20 right-10 h-40 w-40 rounded-full bg-primary-600 blur-3xl opacity-5"></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-64 w-64 rounded-full bg-coffee-400 blur-3xl opacity-5"></div>
                </div>

                <Header />
                <main className="flex flex-1 items-center justify-center px-6 py-20 text-center relative z-10">
                    <div>
                        <RushCoffeeLogo className="mx-auto h-24 w-24 text-gray-300 opacity-50" />
                        <h1 className="mt-4 font-display text-2xl font-bold text-coffee-900">
                            You're not in the queue
                        </h1>
                        <p className="mt-2 text-gray-600">
                            Please log in and place an order to see your queue status.
                        </p>
                        <div className="mt-8 flex justify-center gap-4">
                            <Link to="/auth/login" className="rounded-full bg-primary-600 px-8 py-3 font-semibold text-white transition-transform hover:scale-105 shadow-lg">
                                Login
                            </Link>
                            <Link to="/menu" className="rounded-full border-2 border-primary-600 px-8 py-3 font-semibold text-primary-600 transition-transform hover:scale-105 hover:bg-primary-50 shadow-sm">
                                View Menu
                            </Link>
                        </div>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    // Main view: Always show Dashboard (Stats/History)
    // If there is a displayOrder, ModernQueueCard will render as a modal overlay on top.
    return (
        <div className="flex min-h-screen flex-col bg-gradient-to-br from-coffee-50 via-gray-50 to-primary-50 relative">
            {/* Background Pattern */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-10 left-10 h-32 w-32 rounded-full bg-coffee-600 blur-3xl opacity-5"></div>
                <div className="absolute bottom-20 right-10 h-40 w-40 rounded-full bg-primary-600 blur-3xl opacity-5"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-64 w-64 rounded-full bg-coffee-400 blur-3xl opacity-5"></div>
            </div>

            <Header />
            <main className="flex-1 w-full max-w-3xl mx-auto px-4 py-8 sm:py-12 relative z-10">
                {/* Active Order Modal (Portal) */}
                {displayOrder && (
                    <ModernQueueCard
                        order={displayOrder}
                        onDismiss={handleDismiss}
                    />
                )}

                {/* Success Message (Toast style if not in modal) */}
                {showSuccessMessage && !displayOrder && (
                    <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4">
                        <div className="w-full rounded-2xl bg-gradient-to-r from-green-50 to-emerald-50 p-4 text-center border border-green-200 shadow-lg animate-fade-in-up">
                            <div className="flex items-center justify-center gap-2 mb-1">
                                <div className="h-6 w-6 rounded-full bg-green-500 flex items-center justify-center">
                                    <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <h2 className="font-bold text-green-900">Order Placed Successfully!</h2>
                            </div>
                            <p className="text-sm text-green-700">You are now in the queue.</p>
                        </div>
                    </div>
                )}

                {/* Permission Banner */}
                {showPermissionBanner && notificationPermission === 'default' && (!displayOrder || displayOrder.status === 'completed') && (
                    <div className="mb-8 relative w-full animate-fade-in-up rounded-2xl border border-primary-200 bg-white/95 backdrop-blur-sm p-4 shadow-md">
                        <button
                            onClick={() => setShowPermissionBanner(false)}
                            className="absolute top-2 right-2 rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                            aria-label="Dismiss"
                        >
                            <X className="h-4 w-4" />
                        </button>
                        <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 rounded-full bg-primary-100 p-2">
                                <Bell className="h-6 w-6 text-primary-600" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-gray-900">Enable Notifications?</h3>
                                <p className="mt-1 text-sm text-gray-600">
                                    Get notified when your coffee is ready for pickup!
                                </p>
                                <button
                                    onClick={handleRequestPermission}
                                    className="mt-3 rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-700 shadow-sm"
                                >
                                    Allow Notifications
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Dashboard Grid */}
                <div className="grid gap-6 md:grid-cols-2">
                    {/* Left Column: Stats */}
                    <div className="space-y-6">
                        {/* Loyalty Points Card */}
                        <div className="rounded-3xl bg-white p-6 shadow-xl shadow-coffee-900/5 border border-white/50 backdrop-blur-sm relative overflow-hidden group hover:shadow-2xl transition-all duration-300">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Award className="h-24 w-24 text-primary-600 rotate-12" />
                            </div>
                            <div className="relative z-10">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="p-2 bg-primary-100 rounded-xl">
                                        <Award className="h-5 w-5 text-primary-600" />
                                    </div>
                                    <h2 className="font-bold text-gray-900">Loyalty Points</h2>
                                </div>
                                <div className="mt-4">
                                    <span className="font-display text-5xl font-bold text-primary-600 tracking-tight">
                                        {currentUser.loyaltyPoints || 0}
                                    </span>
                                    <span className="ml-2 text-sm font-medium text-gray-500 uppercase tracking-wide">Points</span>
                                </div>
                                <p className="mt-2 text-sm text-gray-600">
                                    Earn 4-5 points per item based on size!
                                </p>
                                <div className="mt-4 h-2 w-full rounded-full bg-gray-100 overflow-hidden">
                                    <div
                                        className="h-full rounded-full bg-gradient-to-r from-primary-500 to-primary-600"
                                        style={{ width: `${Math.min((currentUser.loyaltyPoints || 0) % 100, 100)}%` }}
                                    ></div>
                                </div>
                                <p className="mt-2 text-xs text-gray-400 text-right">
                                    {100 - ((currentUser.loyaltyPoints || 0) % 100)} points to next reward
                                </p>
                            </div>
                        </div>

                        {/* Quick Order Card */}
                        <div className="rounded-3xl bg-gradient-to-br from-coffee-800 to-coffee-900 p-6 shadow-xl text-white relative overflow-hidden group hover:shadow-2xl transition-all duration-300">
                            <div className="absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-white/10 blur-2xl group-hover:bg-white/20 transition-colors"></div>
                            <div className="relative z-10">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-2">
                                        <div className="p-2 bg-white/10 rounded-xl backdrop-blur-sm">
                                            <Sparkles className="h-5 w-5 text-primary-300" />
                                        </div>
                                        <h2 className="font-bold text-white">Quick Order</h2>
                                    </div>
                                    <Link to="/menu" className="text-xs font-bold text-primary-300 hover:text-white transition-colors flex items-center gap-1">
                                        Full Menu <ArrowRight className="h-3 w-3" />
                                    </Link>
                                </div>

                                {featuredProduct ? (
                                    <div className="flex items-center gap-4">
                                        <div className="h-20 w-20 rounded-2xl bg-white/10 backdrop-blur-md overflow-hidden border border-white/10 flex-shrink-0">
                                            <img
                                                src={featuredProduct.imageUrl}
                                                alt={featuredProduct.name}
                                                className="h-full w-full object-cover"
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-bold text-lg truncate">{featuredProduct.name}</h3>
                                            <p className="text-white/60 text-sm truncate">{featuredProduct.description}</p>
                                            <div className="mt-3 flex items-center justify-between">
                                                <span className="font-bold text-primary-300">₱{featuredProduct.basePrice}</span>
                                                <button
                                                    onClick={() => handleQuickAddClick(featuredProduct)}
                                                    className="p-2 bg-primary-600 hover:bg-primary-500 rounded-xl transition-colors shadow-lg shadow-primary-900/50"
                                                >
                                                    <Plus className="h-4 w-4 text-white" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-4 text-white/50 text-sm">
                                        Loading recommendations...
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Recent History */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-900">Recent Orders</h2>
                            <Link to="/profile" className="text-sm font-semibold text-primary-600 hover:text-primary-700">
                                View All
                            </Link>
                        </div>

                        <div className="space-y-4">
                            {recentOrders.length > 0 ? (
                                recentOrders.map((order) => (
                                    <div key={order.id} className="group relative overflow-hidden rounded-2xl bg-white p-4 shadow-sm border border-gray-100 transition-all hover:shadow-md hover:border-primary-100">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-start gap-4">
                                                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${order.status === 'cancelled' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                                                    {order.status === 'cancelled' ? <XCircle className="h-6 w-6" /> : <Check className="h-6 w-6" />}
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-gray-900">Order #{order.orderNumber}</h3>
                                                    <p className="text-sm text-gray-500">
                                                        {order.timestamp?.toLocaleDateString()} • {order.orderItems.length} items
                                                    </p>
                                                    <div className="mt-2 flex flex-wrap gap-2">
                                                        {order.orderItems.slice(0, 2).map((item, idx) => (
                                                            <span key={idx} className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
                                                                {item.quantity}x {item.productName}
                                                            </span>
                                                        ))}
                                                        {order.orderItems.length > 2 && (
                                                            <span className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
                                                                +{order.orderItems.length - 2} more
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-gray-900">₱{order.totalAmount.toFixed(2)}</p>
                                                {order.status === 'cancelled' ? (
                                                    <div className="mt-1 flex justify-end">
                                                        <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800">
                                                            Cancelled
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <div className="mt-1 flex justify-end">
                                                        {[1, 2, 3, 4, 5].map((star) => (
                                                            <Star key={star} className="h-3 w-3 text-amber-400 fill-amber-400" />
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="rounded-2xl bg-white p-8 text-center border border-dashed border-gray-200">
                                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-50">
                                        <Coffee className="h-6 w-6 text-gray-400" />
                                    </div>
                                    <h3 className="mt-2 text-sm font-semibold text-gray-900">No recent orders</h3>
                                    <p className="mt-1 text-sm text-gray-500">Your order history will appear here.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
            <Footer />

            {/* Product Customize Modal */}
            <ProductCustomizeModal
                isOpen={isCustomizeModalOpen}
                onClose={() => setIsCustomizeModalOpen(false)}
                product={selectedProduct}
                selectedSize={selectedProduct?.sizes[0]}
                onConfirm={handleConfirmCustomization}
            />
        </div>
    );
};

export default QueuePage;