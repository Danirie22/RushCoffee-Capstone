// QueuePage.tsx
import * as React from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { ArrowRight, Bell, X, Clock, TrendingUp, Award, Coffee, Star, Plus, Sparkles } from 'lucide-react';
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

    // Determine which order to display (Prioritize Undismissed Completed Order -> Then Active Order)
    const displayOrder = React.useMemo(() => {
        // 1. Check for any completed order that hasn't been dismissed yet
        // We look for the most recent one first (since history is sorted desc)
        const undismissedCompleted = orderHistory.find(
            order => order.status === 'completed' && !dismissedOrderIds.includes(order.id)
        );

        if (undismissedCompleted) {
            return undismissedCompleted;
        }

        // 2. If no completed order needs attention, show active order
        if (activeOrder) return activeOrder;

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
            const newDismissedIds = [...dismissedOrderIds, displayOrder.id];
            setDismissedOrderIds(newDismissedIds);
            localStorage.setItem('dismissedOrderIds', JSON.stringify(newDismissedIds));
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

            addToCart(selectedProduct, defaultSize, customizations, quantity);
            showToast(`Added ${quantity} ${selectedProduct.name} to cart`);
            setIsCustomizeModalOpen(false);
        }
    };

    // Get recent completed orders (LIMIT TO 2 for better visual balance)
    const recentOrders = React.useMemo(() => {
        return orderHistory
            .filter(order => order.status === 'completed')
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
            <div className="flex min-h-screen flex-col bg-gray-50">
                <Header />
                <main className="flex flex-1 items-center justify-center px-6 py-20 text-center">
                    <div>
                        <RushCoffeeLogo className="mx-auto h-24 w-24 text-gray-300 opacity-50" />
                        <h1 className="mt-4 font-display text-2xl font-bold text-primary-900">
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
        <div className="flex min-h-screen flex-col bg-gray-50 relative">
            <Header />

            {/* Modern Hero Section */}
            <section className="relative overflow-hidden bg-gradient-to-br from-primary-900 via-primary-800 to-primary-900 px-6 py-12 text-white shadow-xl sm:py-20">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                <div className="absolute -right-20 -top-20 h-96 w-96 rounded-full bg-primary-500 blur-3xl opacity-20"></div>
                <div className="absolute -left-20 -bottom-20 h-72 w-72 rounded-full bg-primary-500 blur-3xl opacity-20"></div>

                <div className="container relative mx-auto max-w-3xl text-center animate-fade-in-up">
                    <div className="inline-flex items-center rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-primary-100 backdrop-blur-sm ring-1 ring-white/20 mb-6">
                        <Clock className="mr-2 h-4 w-4" />
                        Live Order Tracking
                    </div>
                    <h1 className="font-display text-4xl font-bold leading-tight tracking-tight md:text-5xl text-white mb-4">
                        Your Queue
                    </h1>
                    <p className="text-lg text-primary-100 max-w-xl mx-auto">
                        Track your orders in real-time and see your coffee journey stats.
                    </p>
                </div>
            </section>

            <main className="flex-1 w-full max-w-3xl mx-auto px-4 py-8 sm:py-12 relative z-10 -mt-10">
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
                    <div className="mb-8 relative w-full animate-fade-in-up rounded-2xl border border-primary-200 bg-white p-6 shadow-lg">
                        <button
                            onClick={() => setShowPermissionBanner(false)}
                            className="absolute top-4 right-4 rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                            aria-label="Dismiss"
                        >
                            <X className="h-5 w-5" />
                        </button>
                        <div className="flex items-start gap-4">
                            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-600">
                                <Bell className="h-6 w-6" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-gray-900 text-lg">Get Order Updates</h3>
                                <p className="text-gray-600 mt-1">Enable notifications to know exactly when your coffee is ready for pickup.</p>
                                <button
                                    onClick={handleRequestPermission}
                                    className="mt-4 rounded-full bg-primary-600 px-6 py-2 text-sm font-semibold text-white transition-all hover:bg-primary-700 hover:shadow-lg"
                                >
                                    Enable Notifications
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Quick Stats - Grid with Loading State */}
                {currentUser && (
                    <div className="mb-10">
                        <div className="grid grid-cols-3 gap-4 sm:gap-6">
                            {!currentUser ? (
                                <>
                                    <StatCardSkeleton />
                                    <StatCardSkeleton />
                                    <StatCardSkeleton />
                                </>
                            ) : (
                                <>
                                    {/* Card 1: Total Orders */}
                                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 text-center group">
                                        <div className="flex flex-col items-center">
                                            <div className="h-14 w-14 rounded-full bg-blue-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                                                <Clock className="h-7 w-7 text-blue-600" />
                                            </div>
                                            <h3 className="text-3xl font-display font-bold text-gray-900 mb-1">
                                                {orderHistory.length}
                                            </h3>
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Orders</p>
                                        </div>
                                    </div>

                                    {/* Card 2: Loyalty Points */}
                                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 text-center group">
                                        <div className="flex flex-col items-center">
                                            <div className="h-14 w-14 rounded-full bg-amber-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                                                <Award className="h-7 w-7 text-amber-600" />
                                            </div>
                                            <h3 className="text-3xl font-display font-bold text-gray-900 mb-1">
                                                {currentUser.currentPoints}
                                            </h3>
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Points</p>
                                        </div>
                                    </div>

                                    {/* Card 3: Tier Status */}
                                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 text-center group">
                                        <div className="flex flex-col items-center">
                                            <div className="h-14 w-14 rounded-full bg-green-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                                                <TrendingUp className="h-7 w-7 text-green-600" />
                                            </div>
                                            <h3 className="text-3xl font-display font-bold text-gray-900 mb-1">
                                                {currentUser.currentPoints >= 500 ? 'Gold' : currentUser.currentPoints >= 200 ? 'Silver' : 'Bronze'}
                                            </h3>
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Tier</p>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}

                {/* Recent Orders - List with Loading State */}
                {recentOrders.length > 0 && (
                    <div className="w-full mb-10">
                        <div className="flex items-center justify-between mb-6 px-2">
                            <h2 className="text-lg font-bold text-primary-900">Recent Orders</h2>
                            {orderHistory.filter(o => o.status === 'completed').length > 2 && (
                                <Link
                                    to="/profile"
                                    className="text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors flex items-center gap-1"
                                >
                                    View All <ArrowRight className="h-4 w-4" />
                                </Link>
                            )}
                        </div>
                        <div className="space-y-4">
                            {recentOrders.map((order) => {
                                const firstItem = order.orderItems[0];
                                const productImage = firstItem ? getProductImage(firstItem.productId) : null;

                                return (
                                    <div
                                        key={order.id}
                                        className="bg-white rounded-2xl p-5 shadow-md border border-gray-100 hover:shadow-xl transition-all duration-300 group"
                                    >
                                        <div className="flex items-center gap-5">
                                            {/* Product Image or Coffee Icon */}
                                            <div className="flex-shrink-0 h-20 w-20 rounded-2xl overflow-hidden bg-gray-100 shadow-inner group-hover:scale-105 transition-transform duration-300">
                                                {productImage ? (
                                                    <img
                                                        src={productImage}
                                                        alt={firstItem.productName}
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="h-full w-full flex items-center justify-center">
                                                        <Coffee className="h-8 w-8 text-gray-400" />
                                                    </div>
                                                )}
                                            </div>

                                            {/* Order Details */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between mb-1">
                                                    <h3 className="font-bold text-primary-900 text-lg truncate pr-4">
                                                        {firstItem?.productName || 'Coffee Order'}
                                                    </h3>
                                                    <span className="text-xs font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                                                        {new Date(order.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                    </span>
                                                </div>

                                                <p className="text-sm text-gray-500 mb-3 font-mono">
                                                    Order #{order.orderNumber}
                                                </p>

                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
                                                            Completed
                                                        </span>
                                                        {order.orderItems.length > 1 && (
                                                            <span className="text-xs text-gray-500">
                                                                +{order.orderItems.length - 1} more
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-lg font-bold text-primary-600">₱{order.totalAmount.toFixed(2)}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Recommended / Upsell Section with improved spacing */}
                <div className="w-full max-w-md mx-auto mt-8 mb-12">
                    {productsLoading ? (
                        <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100 text-center animate-pulse">
                            <div className="mb-4 relative mx-auto w-32 h-32 bg-gray-200 rounded-full"></div>
                            <div className="h-6 bg-gray-200 rounded w-3/4 mx-auto mb-2"></div>
                            <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
                            <div className="h-12 bg-gray-200 rounded"></div>
                        </div>
                    ) : featuredProduct ? (
                        <>
                            {recentOrders.length > 0 ? (
                                <h2 className="text-center text-xs font-bold text-gray-400 uppercase tracking-wider mb-6">Recommended for You</h2>
                            ) : (
                                <div className="text-center mb-8 animate-fade-in-up">
                                    <div className="inline-flex items-center justify-center gap-2 mb-3 bg-amber-50 px-4 py-2 rounded-full">
                                        <Sparkles className="h-5 w-5 text-amber-500" />
                                        <h2 className="text-sm font-bold text-amber-900">Start Your Journey</h2>
                                    </div>
                                    <p className="text-gray-600">Try our most popular drink to get started!</p>
                                </div>
                            )}
                            <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100 text-center relative overflow-hidden group hover:shadow-2xl transition-all duration-300">
                                {/* Badge */}
                                <div className="absolute top-4 right-4 bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md z-10">
                                    Top Pick
                                </div>

                                <div className="relative z-10">
                                    <div className="mb-6 relative mx-auto w-32 h-32 sm:w-40 sm:h-40">
                                        <div className="absolute inset-0 bg-primary-200 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-500" />
                                        <img
                                            src={featuredProduct.imageUrl}
                                            alt={featuredProduct.name}
                                            className="w-full h-full object-cover rounded-full shadow-lg group-hover:scale-110 transition-transform duration-500"
                                        />
                                    </div>

                                    <h3 className="text-xl sm:text-2xl font-display font-bold text-gray-900 mb-2">
                                        {featuredProduct.name}
                                    </h3>
                                    <p className="text-sm text-gray-500 mb-6 line-clamp-2 px-4 leading-relaxed">
                                        {featuredProduct.description}
                                    </p>

                                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                                        <button
                                            onClick={() => handleQuickAddClick(featuredProduct)}
                                            className="w-full sm:flex-1 bg-primary-600 text-white font-bold py-3.5 px-6 rounded-xl shadow-lg hover:bg-primary-700 hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2"
                                        >
                                            <Plus className="w-5 h-5" />
                                            Add to Cart
                                        </button>
                                        <button
                                            onClick={() => navigate('/menu')}
                                            className="w-full sm:w-auto bg-gray-50 text-gray-700 font-bold py-3.5 px-6 rounded-xl border border-gray-200 hover:bg-white hover:border-gray-300 hover:shadow-md transition-all"
                                        >
                                            View Menu
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        // Fallback if no products loaded (and no recent orders)
                        recentOrders.length === 0 && (
                            <div className="bg-white rounded-2xl p-8 border-2 border-dashed border-gray-200 text-center">
                                <Coffee className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-sm text-gray-500">
                                    No orders yet. Your coffee journey starts here! ☕
                                </p>
                                <button
                                    onClick={() => navigate('/menu')}
                                    className="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-primary-600 px-6 py-2.5 font-semibold text-white shadow-md transition-all hover:bg-primary-700"
                                >
                                    Start a New Order
                                </button>
                            </div>
                        )
                    )}
                </div>
            </main>

            {/* Quick Add Modal */}
            {selectedProduct && (
                <ProductCustomizeModal
                    product={selectedProduct}
                    selectedSize={selectedProduct.sizes[0]} // Default to first size
                    isOpen={isCustomizeModalOpen}
                    onClose={() => setIsCustomizeModalOpen(false)}
                    onConfirm={handleConfirmCustomization}
                />
            )}

            <Footer />
        </div>
    );
};

export default QueuePage;