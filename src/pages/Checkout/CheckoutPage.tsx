import * as React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ShoppingBag, ArrowLeft, ArrowRight, MessageSquare } from 'lucide-react';

import Header from '../../components/layout/Header';
import Button from '../../components/ui/Button';

import OrderSummaryWidget from '../../components/checkout/OrderSummaryWidget';
import UserInfoForm from '../../components/checkout/UserInfoForm';
import RewardsRedemption from '../../components/checkout/RewardsRedemption';
import CheckoutPayment from '../../components/checkout/CheckoutPayment';

import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useOrder, QueueItem } from '../../context/OrderContext';
import { useToppings } from '../../hooks/useToppings';
import { useRewards } from '../../hooks/useRewards';
import { AvailableReward } from '../../data/mockRewards';
import { db } from '../../firebaseConfig';
import firebase from 'firebase/compat/app';
import 'firebase/compat/storage';

const CheckoutPage: React.FC = () => {
    const navigate = useNavigate();
    const { cartItems, showToast, totalCartItems, clearCart, selectedItemIds } = useCart();
    const { currentUser } = useAuth();
    const { setActiveOrder, addOrderToHistory } = useOrder();
    const { toppings: availableToppings } = useToppings();
    const { rewards, loading: loadingRewards } = useRewards();

    const getToppingsPrice = (toppingNames?: string[]) => {
        if (!toppingNames) return 0;
        return toppingNames.reduce((acc, name) => {
            const topping = availableToppings.find(t => t.name === name);
            return acc + (topping?.price || 0);
        }, 0);
    };

    // Filter only selected items for checkout
    const selectedCartItems = React.useMemo(() =>
        cartItems.filter(item => selectedItemIds.includes(item.id)),
        [cartItems, selectedItemIds]
    );

    // State
    const [selectedPaymentMethod, setSelectedPaymentMethod] = React.useState<'gcash' | 'cash' | null>(null);
    const [customerInfo, setCustomerInfo] = React.useState({ name: '', phone: '' });
    const [orderNotes, setOrderNotes] = React.useState('');
    const [errors, setErrors] = React.useState<{ name?: string; phone?: string; payment?: string; gcash?: string; reference?: string; accountName?: string }>({});

    const [paymentReference, setPaymentReference] = React.useState('');
    const [accountName, setAccountName] = React.useState('');

    const [isProcessing, setIsProcessing] = React.useState(false);
    const [orderPlaced, setOrderPlaced] = React.useState(false);
    const [selectedReward, setSelectedReward] = React.useState<AvailableReward | null>(null);

    // Memoized calculations for order summary
    const { subtotal, toppingsTotal, discountAmount, total } = React.useMemo(() => {
        const sub = selectedCartItems.reduce((acc, item) => acc + item.selectedSize.price * item.quantity, 0);
        const toppings = selectedCartItems.reduce((acc, item) => {
            const itemToppingsPrice = getToppingsPrice(item.customizations?.toppings);
            return acc + itemToppingsPrice * item.quantity;
        }, 0);

        let discount = 0;
        if (selectedReward) {
            if (selectedReward.category === 'discount') {
                // 10% Off
                if (selectedReward.name.includes('10%')) {
                    discount = (sub + toppings) * 0.10;
                }
            } else if (selectedReward.category === 'drink' && selectedReward.name.includes('Free Grande')) {
                // Find first Grande drink
                const eligibleItem = selectedCartItems.find(item => item.selectedSize.name === 'Grande');
                if (eligibleItem) {
                    discount = eligibleItem.selectedSize.price;
                }
            } else if (selectedReward.category === 'food' && selectedReward.name.includes('Rice Meal')) {
                // Find first Rice Meal
                const eligibleItem = selectedCartItems.find(item => item.product.category === 'Meals' || item.product.name.includes('Rice'));
                if (eligibleItem) {
                    discount = eligibleItem.selectedSize.price;
                }
            }
        }

        // Ensure discount doesn't exceed total
        discount = Math.min(discount, sub + toppings);

        return { subtotal: sub, toppingsTotal: toppings, discountAmount: discount, total: sub + toppings - discount };
    }, [selectedCartItems, availableToppings, selectedReward]);

    const summaryItems = React.useMemo(() =>
        selectedCartItems.map(item => ({
            productName: `${item.product.name} (${item.selectedSize.name})`,
            quantity: item.quantity,
            price: item.selectedSize.price,
            imageUrl: item.product.imageUrl,
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

    // Real-time form validation check
    const isFormValid = React.useMemo(() => {
        const hasValidName = customerInfo.name.trim().length >= 2;
        const hasValidPhone = /^\+63 9\d{2} \d{3} \d{4}$/.test(customerInfo.phone);
        const hasPaymentMethod = selectedPaymentMethod !== null;

        // If GCash is selected, check for reference and account name
        if (selectedPaymentMethod === 'gcash') {
            const hasReference = paymentReference.trim().length > 0;
            const hasAccountName = accountName.trim().length > 0;
            return hasValidName && hasValidPhone && hasPaymentMethod && hasReference && hasAccountName;
        }

        return hasValidName && hasValidPhone && hasPaymentMethod;
    }, [customerInfo.name, customerInfo.phone, selectedPaymentMethod, paymentReference, accountName]);

    // Form validation
    const validateForm = () => {
        const newErrors: typeof errors = {};
        if (customerInfo.name.trim().length < 2) {
            newErrors.name = 'Name must be at least 2 characters long.';
        }
        if (!/^\+63 9\d{2} \d{3} \d{4}$/.test(customerInfo.phone)) {
            newErrors.phone = 'Please enter a valid PH phone number (+63 9xx xxx xxxx).';
        }
        if (!selectedPaymentMethod) {
            newErrors.payment = 'Please select a payment method.';
        }
        if (selectedPaymentMethod === 'gcash') {
            if (!paymentReference.trim()) {
                newErrors.reference = 'Please enter the GCash reference number.';
            }
            if (!accountName.trim()) {
                newErrors.accountName = 'Please enter the GCash account name.';
            }
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

        try {
            // Receipt upload skipped
            const receiptUrl = '';

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
                receiptUrl: receiptUrl || null,
                paymentReference: paymentReference || null,
                paymentAccountName: accountName || null,
                estimatedTime: 10,
                orderType: 'online',
                discountApplied: discountAmount,
                rewardRedeemed: selectedReward ? {
                    id: selectedReward.id,
                    name: selectedReward.name,
                    pointsCost: selectedReward.pointsCost
                } : null,
            };

            await addOrderToHistory(orderData as Omit<QueueItem, 'id' | 'timestamp'>);

            // Deduct points if reward redeemed
            if (selectedReward) {
                const userDocRef = db.collection('users').doc(currentUser.uid);
                await userDocRef.update({
                    currentPoints: firebase.firestore.FieldValue.increment(-selectedReward.pointsCost),
                    rewardsHistory: firebase.firestore.FieldValue.arrayUnion({
                        id: `rh-${Date.now()}`,
                        type: 'redeemed',
                        points: -selectedReward.pointsCost,
                        description: `Redeemed: ${selectedReward.name} (Checkout)`,
                        date: new Date(),
                    })
                });
            }

            clearCart();
            setIsProcessing(false);
            setOrderPlaced(true);
            navigate('/queue', { state: { fromCheckout: true, orderNumber: newOrderNumber } });

        } catch (error) {
            console.error("Error placing order:", error);
            showToast('Failed to place order. Please try again.');
            setIsProcessing(false);
        }
    };


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

            </div>
        );
    }

    return (
        <div className="flex min-h-screen flex-col bg-gray-50">
            <Header />
            <main className="container mx-auto max-w-7xl px-4 py-8">
                <div className="mb-8 flex items-center gap-4">
                    <button
                        onClick={() => navigate('/menu')}
                        className="rounded-full bg-white p-2 text-gray-500 shadow-sm transition-colors hover:bg-gray-50 hover:text-primary-600"
                    >
                        <ArrowLeft className="h-6 w-6" />
                    </button>
                    <div>
                        <h1 className="font-display text-3xl font-bold text-coffee-900">Checkout</h1>
                        <p className="text-sm text-gray-500">Complete your order details</p>
                    </div>
                </div>
                <form onSubmit={handlePlaceOrder} id="checkout-form" className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                    {/* Left Column */}
                    <div className="space-y-8 lg:col-span-2">

                        {/* 1. User Information */}
                        <UserInfoForm
                            customerInfo={customerInfo}
                            setCustomerInfo={setCustomerInfo}
                            errors={errors}
                        />

                        {/* 2. Rewards Selection */}
                        <RewardsRedemption
                            rewards={rewards}
                            selectedReward={selectedReward}
                            setSelectedReward={setSelectedReward}
                            loading={loadingRewards}
                            currentUser={currentUser}
                        />

                        {/* 3. Payment Method */}
                        <CheckoutPayment
                            selectedPaymentMethod={selectedPaymentMethod}
                            setSelectedPaymentMethod={setSelectedPaymentMethod}
                            totalAmount={total}
                            paymentReference={paymentReference}
                            setPaymentReference={setPaymentReference}
                            accountName={accountName}
                            setAccountName={setAccountName}
                            errors={errors}
                        />

                        {/* 4. Order Notes (Kept minimal here or could be extracted too) */}
                        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
                            <h2 className="mb-4 font-display text-xl font-bold text-coffee-900">Special Instructions (Optional)</h2>
                            <div className="relative">
                                <MessageSquare className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                <textarea
                                    id="notes"
                                    value={orderNotes}
                                    onChange={e => setOrderNotes(e.target.value)}
                                    rows={3}
                                    className="block w-full rounded-lg border-gray-200 bg-gray-50 py-2.5 pl-10 text-gray-900 shadow-sm transition-all focus:border-primary-500 focus:bg-white focus:ring-primary-500"
                                    placeholder="e.g., less ice, extra shot..."
                                ></textarea>
                            </div>
                        </div>

                        {/* Desktop Action Button */}
                        <div className="hidden lg:block">
                            <Button
                                type="submit"
                                form="checkout-form"
                                disabled={!isFormValid || isProcessing}
                                isLoading={isProcessing}
                                variant="secondary"
                                size="lg"
                                fullWidth
                                endIcon={!isProcessing ? <ArrowRight className="h-5 w-5" /> : undefined}
                                className="mt-2 rounded-xl bg-gradient-to-r from-primary-600 to-primary-700 shadow-lg shadow-primary-600/20 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
                            >
                                Place Order
                            </Button>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="lg:col-span-1">
                        <OrderSummaryWidget items={summaryItems} subtotal={subtotal} toppingsTotal={toppingsTotal} discount={discountAmount} total={total} />
                    </div>
                </form>
            </main>

            {/* Fixed Action Button on Mobile */}
            <div className="sticky bottom-0 left-0 right-0 border-t border-gray-200 bg-white/90 p-4 backdrop-blur-sm lg:hidden">
                <Button
                    type="submit"
                    form="checkout-form"
                    disabled={!isFormValid || isProcessing}
                    isLoading={isProcessing}
                    variant="secondary"
                    size="lg"
                    fullWidth
                    endIcon={!isProcessing ? <ArrowRight className="h-5 w-5" /> : undefined}
                    className="rounded-xl bg-gradient-to-r from-primary-600 to-primary-700 shadow-lg shadow-primary-600/20 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
                >
                    {`Place Order (₱${total.toFixed(2)})`}
                </Button>
            </div>
        </div>
    );
};

export default CheckoutPage;
