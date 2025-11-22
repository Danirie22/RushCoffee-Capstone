// Queue Page - Fully Polished v11 (All Refinements)
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

    // Determine which order to display (Active OR Undismissed Completed)
    const displayOrder = React.useMemo(() => {
        if (activeOrder) return activeOrder;

        // If no active order, check the most recent order
        if (orderHistory.length > 0) {
            const mostRecent = orderHistory[0];
            // If it's completed and NOT dismissed, show it
            if (mostRecent.status === 'completed' && !dismissedOrderIds.includes(mostRecent.id)) {
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

            addToCart({
                product: selectedProduct,
                size: defaultSize,
                quantity,
                customizations,
            });
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
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary-100 to-primary-200">
                                <Bell className="h-6 w-6 text-primary-600" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900">Get Order Updates</h3>
                                <p className="text-sm text-gray-600">Know the moment your coffee is ready!</p>
                            </div>
                        </div>
                        <button
                            onClick={handleRequestPermission}
                            className="mt-4 w-full rounded-full bg-gradient-to-r from-primary-600 to-primary-700 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:shadow-lg"
                        >
                            Enable Notifications
                        </button>
                    </div>
                )}

                {/* Dashboard Content */}
                <div className="text-center mb-8 sm:mb-12">
                    <h1 className="font-display text-2xl sm:text-3xl font-bold text-coffee-900">
                        Your Queue
                    </h1>
                    <p className="mt-2 text-sm sm:text-base text-gray-600">
                        Track your orders and rewards
                    </p>
                </div>

                {/* Quick Stats - Grid with Loading State */}
                {currentUser && (
                    <div className="mb-8 sm:mb-12">
                        <h2 className="text-center text-xs font-bold text-gray-500 uppercase tracking-wider mb-6">Your Coffee Journey</h2>
                        <div className="grid grid-cols-3 gap-3 sm:gap-6">
                            {!currentUser ? (
                                <>
                                    <StatCardSkeleton />
                                    <StatCardSkeleton />
                                    <StatCardSkeleton />
                                </>
                            ) : (
                                <>
                                    <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-md border border-gray-100 hover:shadow-lg transition-shadow text-center">
                                        <div className="flex flex-col items-center">
                                            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center mb-2 sm:mb-3">
                                                <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                                            </div>
                                            <p className="text-2xl sm:text-3xl font-bold text-coffee-900">{currentUser.totalOrders || 0}</p>
                                            <p className="text-xs sm:text-sm text-gray-600 mt-1 font-medium">Orders</p>
                                        </div>
                                    </div>
                                    <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-md border border-gray-100 hover:shadow-lg transition-shadow text-center">
                                        <div className="flex flex-col items-center">
                                            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center mb-2 sm:mb-3">
                                                <Award className="h-5 w-5 sm:h-6 sm:w-6 text-amber-600" />
                                            </div>
                                            <p className="text-2xl sm:text-3xl font-bold text-coffee-900">{currentUser.currentPoints || 0}</p>
                                            <p className="text-xs sm:text-sm text-gray-600 mt-1 font-medium">Points</p>
                                        </div>
                                    </div>
                                    <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-md border border-gray-100 hover:shadow-lg transition-shadow text-center">
                                        <div className="flex flex-col items-center">
                                            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center mb-2 sm:mb-3">
                                                <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                                            </div>
                                            <p className="text-xl sm:text-2xl font-bold text-coffee-900 capitalize">{currentUser.tier || 'Bronze'}</p>
                                            <p className="text-xs sm:text-sm text-gray-600 mt-1 font-medium">Tier</p>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}

                {/* Recent Orders - List with Loading State */}
                {recentOrders.length > 0 && (
                    <div className="w-full mb-8">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-center flex-1 text-xs font-bold text-gray-500 uppercase tracking-wider">Recent Orders</h2>
                            {orderHistory.filter(o => o.status === 'completed').length > 2 && (
                                <Link
                                    to="/profile"
                                    className="text-xs font-semibold text-primary-600 hover:text-primary-700 transition-colors"
                                >
                                    View All
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
                                        className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 sm:p-5 shadow-md border border-gray-100 hover:shadow-xl hover:scale-[1.01] transition-all duration-200 cursor-pointer group"
                                    >
                                        <div className="flex items-start gap-3 sm:gap-4">
                                            {/* Product Image or Coffee Icon */}
                                            <div className="flex-shrink-0 h-14 w-14 sm:h-16 sm:w-16 rounded-xl overflow-hidden bg-gradient-to-br from-coffee-100 to-coffee-200 shadow-inner group-hover:shadow-lg transition-shadow">
                                                {productImage ? (
                                                    <img
                                                        src={productImage}
                                                        alt={firstItem.productName}
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="h-full w-full flex items-center justify-center">
                                                        <Coffee className="h-7 w-7 sm:h-8 sm:w-8 text-coffee-600" />
                                                    </div>
                                                )}
                                            </div>

                                            {/* Order Details */}
                                            <div className="flex-1 min-w-0 text-left">
                                                {/* Top Row: Product Name and Date */}
                                                <div className="flex items-start justify-between mb-1">
                                                    <h3 className="font-bold text-coffee-900 text-sm sm:text-base truncate pr-2 sm:pr-4">
                                                        {firstItem?.productName || 'Coffee Order'}
                                                    </h3>
                                                    <span className="text-xs text-gray-500 flex-shrink-0 font-medium bg-gray-100 px-2 py-1 rounded-full">
                                                        {new Date(order.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                    </span>
                                                </div>

                                                {/* Order Number - Left aligned */}
                                                <p className="text-xs text-gray-500 mb-2 font-mono">
                                                    {order.orderNumber}
                                                </p>

                                                {/* Additional Items */}
                                                {order.orderItems.length > 1 && (
                                                    <p className="text-xs text-gray-600 mb-2 sm:mb-3 italic">
                                                        +{order.orderItems.length - 1} more item{order.orderItems.length > 2 ? 's' : ''}
                                                    </p>
                                                )}

                                                {/* Bottom Row: Status and Price */}
                                                <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
                                                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                                                        Completed
                                                    </span>
                                                    <p className="text-sm sm:text-base font-bold text-primary-600">₱{order.totalAmount.toFixed(2)}</p>
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
                <div className="w-full max-w-md mx-auto mt-6">
                    {productsLoading ? (
                        <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-gray-100 text-center animate-pulse">
                            <div className="mb-4 relative mx-auto w-32 h-32 bg-gray-200 rounded-full"></div>
                            <div className="h-6 bg-gray-200 rounded w-3/4 mx-auto mb-2"></div>
                            <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
                            <div className="h-12 bg-gray-200 rounded"></div>
                        </div>
                    ) : featuredProduct ? (
                        <>
                            {recentOrders.length > 0 ? (
                                <h2 className="text-center text-xs font-bold text-gray-500 uppercase tracking-wider mb-6">Recommended for You</h2>
                            ) : (
                                <div className="text-center mb-6 animate-fade-in-up">
                                    <div className="inline-flex items-center justify-center gap-2 mb-2">
                                        <Sparkles className="h-5 w-5 text-amber-500" />
                                        <h2 className="text-lg font-bold text-coffee-900">Welcome to Rush Coffee!</h2>
                                        <Sparkles className="h-5 w-5 text-amber-500" />
                                    </div>
                                    <p className="text-sm text-gray-600">Start your journey with our most popular drink:</p>
                                </div>
                            )}
                            <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-5 sm:p-6 shadow-xl border border-gray-100 text-center relative overflow-hidden group hover:shadow-2xl transition-all duration-300">
                                {/* Badge */}
                                <div className="absolute top-4 right-4 bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md z-10 animate-pulse">
                                    Recommended
                                </div>

                                {/* Background Gradient */}
                                <div className="absolute inset-0 bg-gradient-to-b from-primary-50/50 to-transparent pointer-events-none" />

                                <div className="relative z-10">
                                    <div className="mb-4 relative mx-auto w-28 h-28 sm:w-32 sm:h-32">
                                        <div className="absolute inset-0 bg-primary-200 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-500" />
                                        <img
                                            src={featuredProduct.imageUrl}
                                            alt={featuredProduct.name}
                                            className="w-full h-full object-cover rounded-full shadow-lg group-hover:scale-110 transition-transform duration-500"
                                        />
                                    </div>

                                    <h3 className="text-lg sm:text-xl font-display font-bold text-gray-900 mb-1">
                                        {featuredProduct.name}
                                    </h3>
                                    <p className="text-xs sm:text-sm text-gray-500 mb-4 line-clamp-2 px-2 sm:px-4">
                                        {featuredProduct.description}
                                    </p>

                                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                                        <button
                                            onClick={() => handleQuickAddClick(featuredProduct)}
                                            className="w-full sm:flex-1 bg-primary-600 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-primary-600/20 hover:bg-primary-700 hover:shadow-primary-600/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                                        >
                                            <Plus className="w-5 h-5" />
                                            Add to Cart
                                        </button>
                                        <button
                                            onClick={() => navigate('/menu')}
                                            className="w-full sm:w-auto bg-white text-gray-700 font-bold py-3 px-4 rounded-xl border border-gray-200 hover:bg-gray-50 hover:border-gray-300 hover:shadow-md transition-all"
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
                            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 border-2 border-dashed border-gray-200 text-center">
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