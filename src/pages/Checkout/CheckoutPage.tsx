
import * as React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ShoppingBag, User, Phone, MessageSquare, Check, Coffee, AlertCircle, Loader2 } from 'lucide-react';

import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import PaymentMethodSelector from '../../components/checkout/PaymentMethodSelector';
import GCashPayment from '../../components/checkout/GCashPayment';
import OrderSummaryWidget from '../../components/checkout/OrderSummaryWidget';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useOrder, QueueItem } from '../../context/OrderContext';

const CheckoutPage: React.FC = () => {
    const navigate = useNavigate();
    const { cartItems, showToast, totalCartItems, clearCart, selectedItemIds } = useCart();
    const { currentUser } = useAuth();
    const { setActiveOrder, addOrderToHistory } = useOrder();


    // Filter only selected items for checkout
    const selectedCartItems = React.useMemo(() =>
        cartItems.filter(item => selectedItemIds.includes(item.id)),
        [cartItems, selectedItemIds]
    );

    // State
    const [selectedPaymentMethod, setSelectedPaymentMethod] = React.useState<'gcash' | 'cash' | null>(null);
    const [customerInfo, setCustomerInfo] = React.useState({ name: '', phone: '' });
    const [orderNotes, setOrderNotes] = React.useState('');
    const [errors, setErrors] = React.useState<{ name?: string; phone?: string; payment?: string; gcash?: string }>({});

    const [receiptFile, setReceiptFile] = React.useState<File | null>(null);

    const [isProcessing, setIsProcessing] = React.useState(false);
    const [orderPlaced, setOrderPlaced] = React.useState(false);

    // Memoized calculations for order summary
    const { subtotal, serviceFee, total } = React.useMemo(() => {
        const sub = selectedCartItems.reduce((acc, item) => acc + item.selectedSize.price * item.quantity, 0);
        const fee = 15.00; // Example service fee
        return { subtotal: sub, serviceFee: fee, total: sub + fee };
    }, [selectedCartItems]);

    const summaryItems = React.useMemo(() =>
        selectedCartItems.map(item => ({
            productName: `${item.product.name} (${item.selectedSize.name})`,
            quantity: item.quantity,
            price: item.selectedSize.price,
        })),
        [selectedCartItems]);

    // Redirect if cart is empty
    React.useEffect(() => {
        if (!currentUser) {
            showToast('Please log in to proceed to checkout.');
            navigate('/auth/login', { state: { from: '/checkout' } });
            return;
        }
        if (totalCartItems === 0 && !isProcessing && !orderPlaced) {
            showToast('Your cart is empty. Add items to checkout.');
            navigate('/menu');
        }
    }, [totalCartItems, navigate, showToast, isProcessing, orderPlaced, currentUser]);

    // Pre-fill user info if logged in
    React.useEffect(() => {
        if (currentUser) {
            setCustomerInfo({
                name: `${currentUser.firstName} ${currentUser.lastName}`,
                phone: currentUser.phone || '',
            });
        }
    }, [currentUser]);

    // Form validation
    const validateForm = () => {
        const newErrors: typeof errors = {};
        if (customerInfo.name.trim().length < 2) {
            newErrors.name = 'Name must be at least 2 characters long.';
        }
        if (!/^(09|\+639)\d{9}$/.test(customerInfo.phone)) {
            newErrors.phone = 'Please enter a valid Philippine phone number (e.g., 09xxxxxxxxx).';
        }
        if (!selectedPaymentMethod) {
            newErrors.payment = 'Please select a payment method.';
        }
        if (selectedPaymentMethod === 'gcash' && !receiptFile) {
            newErrors.gcash = 'Please upload your payment receipt to proceed.';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handlePlaceOrder = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser || !validateForm()) {
            showToast('Please correct the errors before proceeding.');
            return;
        }

        setIsProcessing(true);
        const newOrderNumber = `RC-2025-${Math.floor(1000 + Math.random() * 9000)}`;

        // Simulate API call
        setTimeout(async () => {
            const orderData = {
                userId: currentUser.uid,
                customerName: customerInfo.name,
                orderNumber: newOrderNumber,
                position: Math.floor(Math.random() * 5) + 1,
                status: 'waiting',
                orderItems: selectedCartItems.map(item => ({
                    productId: item.product.id,
                    productName: `${item.product.name} (${item.selectedSize.name})`,
                    quantity: item.quantity,
                    price: item.selectedSize.price,
                    size: item.selectedSize.name,
                    category: item.product.category,
                    customizations: item.customizations,
                })),
                totalAmount: total,
                paymentMethod: selectedPaymentMethod!,
                paymentStatus: selectedPaymentMethod === 'gcash' ? 'paid' : 'pending',
                estimatedTime: 10,
                orderType: 'online',
            };

            // This now just creates the order document.
            // A backend Cloud Function will be triggered on document creation
            // to securely process points and update user stats.
            await addOrderToHistory(orderData as Omit<QueueItem, 'id' | 'timestamp'>);

            // The user's profile will update automatically via the new real-time listener in AuthContext.

            clearCart();
            setIsProcessing(false);
            setOrderPlaced(true);
            navigate('/queue', { state: { fromCheckout: true, orderNumber: newOrderNumber } });

        }, 2000);
    };

    const isButtonDisabled =
        isProcessing ||
        !selectedPaymentMethod ||
        !customerInfo.name ||
        !/^(09|\+639)\d{9}$/.test(customerInfo.phone) ||
        (selectedPaymentMethod === 'gcash' && !receiptFile);


    if (!currentUser || (totalCartItems === 0 && !orderPlaced)) {
        return (
            <div className="flex min-h-screen flex-col">
                <Header />
                <main className="flex flex-1 items-center justify-center bg-gray-50 text-center">
                    <div>
                        <ShoppingBag className="mx-auto h-24 w-24 text-gray-300" />
                        <h1 className="mt-4 text-2xl font-bold text-gray-800">Your cart is empty</h1>
                        <p className="mt-2 text-gray-500">Add some delicious coffee to get started.</p>
                        <button onClick={() => navigate('/menu')} className="mt-6 rounded-full bg-primary-600 px-6 py-2 font-semibold text-white hover:bg-primary-700">
                            Browse Menu
                        </button>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="flex min-h-screen flex-col bg-gray-50">
            <Header />
            <main className="container mx-auto max-w-7xl px-4 py-8">
                <h1 className="mb-6 font-display text-3xl font-bold text-coffee-900">Checkout</h1>
                <form onSubmit={handlePlaceOrder} id="checkout-form" className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                    {/* Left Column */}
                    <div className="space-y-8 lg:col-span-2">
                        {/* Customer Info */}
                        <div className="rounded-xl border bg-white p-6">
                            <h2 className="mb-4 font-display text-xl font-bold text-coffee-900">Your Information</h2>
                            <div className="space-y-4">
                                <div className="relative">
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
                                    <User className="absolute left-3 top-10 h-5 w-5 text-gray-400" />
                                    <input type="text" id="name" value={customerInfo.name} onChange={e => setCustomerInfo({ ...customerInfo, name: e.target.value })} className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-10 shadow-sm focus:border-primary-500 focus:ring-primary-500" placeholder="Juan dela Cruz" />
                                    {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
                                </div>
                                <div className="relative">
                                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number</label>
                                    <Phone className="absolute left-3 top-10 h-5 w-5 text-gray-400" />
                                    <input type="tel" id="phone" value={customerInfo.phone} onChange={e => setCustomerInfo({ ...customerInfo, phone: e.target.value })} className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-10 shadow-sm focus:border-primary-500 focus:ring-primary-500" placeholder="09171234567" />
                                    {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Payment Method */}
                        <div className="rounded-xl border bg-white p-6">
                            <PaymentMethodSelector selectedMethod={selectedPaymentMethod} onSelectMethod={setSelectedPaymentMethod} />
                            {errors.payment && <p className="mt-2 text-xs text-red-500">{errors.payment}</p>}

                            {selectedPaymentMethod === 'gcash' && (
                                <div className="mt-6 border-t pt-6">
                                    <GCashPayment
                                        totalAmount={total}
                                        orderNumber={`TEMP-${Date.now()}`}
                                        receipt={receiptFile}
                                        onReceiptUpload={setReceiptFile}
                                    />
                                    {errors.gcash && <p className="mt-2 text-xs text-red-500 text-center">{errors.gcash}</p>}
                                </div>
                            )}

                            {selectedPaymentMethod === 'cash' && (
                                <div className="mt-6 rounded-lg border-l-4 border-green-400 bg-green-50 p-4" role="alert">
                                    <div className="flex">
                                        <div className="flex-shrink-0">
                                            <AlertCircle className="h-5 w-5 text-green-400" />
                                        </div>
                                        <div className="ml-3">
                                            <p className="text-sm text-green-700">Please prepare the exact amount. You can pay at the counter upon pickup.</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Order Notes */}
                        <div className="rounded-xl border bg-white p-6">
                            <h2 className="mb-4 font-display text-xl font-bold text-coffee-900">Special Instructions (Optional)</h2>
                            <div className="relative">
                                <MessageSquare className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                <textarea id="notes" value={orderNotes} onChange={e => setOrderNotes(e.target.value)} rows={3} className="block w-full rounded-md border-gray-300 py-2 pl-10 shadow-sm focus:border-primary-500 focus:ring-primary-500" placeholder="e.g., less ice, extra shot..."></textarea>
                            </div>
                        </div>
                        {/* Desktop Action Button */}
                        <div className="hidden lg:block">
                            <button
                                type="submit"
                                form="checkout-form"
                                disabled={isButtonDisabled}
                                className="mt-2 flex w-full max-w-xs justify-center rounded-full bg-primary-600 px-4 py-3 text-base font-semibold text-white shadow-sm transition-colors hover:bg-primary-700 disabled:cursor-not-allowed disabled:bg-primary-400"
                            >
                                {isProcessing ? <Loader2 className="h-6 w-6 animate-spin" /> : 'Place Order'}
                            </button>
                        </div>
                    </div>
                    {/* Right Column */}
                    <div className="lg:col-span-1">
                        <OrderSummaryWidget items={summaryItems} subtotal={subtotal} serviceFee={serviceFee} total={total} />
                    </div>
                </form>
            </main>
            {/* Fixed Action Button on Mobile */}
            <div className="sticky bottom-0 left-0 right-0 border-t border-gray-200 bg-white/90 p-4 backdrop-blur-sm lg:hidden">
                <button
                    type="submit"
                    form="checkout-form"
                    disabled={isButtonDisabled}
                    className="flex w-full justify-center rounded-full bg-primary-600 px-4 py-3 text-base font-semibold text-white shadow-sm transition-colors hover:bg-primary-700 disabled:cursor-not-allowed disabled:bg-primary-400"
                >
                    {isProcessing ? <Loader2 className="h-6 w-6 animate-spin" /> : `Place Order (₱${total.toFixed(2)})`}
                </button>
            </div>

            <Footer />
        </div>
    );
};

export default CheckoutPage;