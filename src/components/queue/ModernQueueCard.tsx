import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Coffee, Bell, Check, ChevronDown, ShoppingBag, Star, ArrowLeft, ThumbsUp, Receipt } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import firebase from 'firebase/compat/app';

import Button from '../ui/Button';
import { QueueItem } from '../../context/OrderContext';
import { useCart } from '../../context/CartContext';
import { db } from '../../firebaseConfig';
import DigitalReceipt from '../checkout/DigitalReceipt';

// --- Confetti Component ---
const ConfettiParticle = ({ delay }: { delay: number }) => {
    const randomX = Math.random() * 300 - 150;
    const randomY = Math.random() * 300 + 50;
    const randomRotate = Math.random() * 360;
    const colors = ['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899'];
    const color = colors[Math.floor(Math.random() * colors.length)];

    return (
        <motion.div
            initial={{ opacity: 1, x: 0, y: -20, scale: 0.5, rotate: 0 }}
            animate={{
                opacity: [1, 1, 0],
                x: randomX,
                y: randomY,
                scale: [0.5, 1, 0.5],
                rotate: randomRotate,
            }}
            transition={{ duration: 2.5, delay, ease: "easeOut" }}
            style={{
                position: 'absolute',
                top: 0,
                left: '50%',
                width: '8px',
                height: '8px',
                backgroundColor: color,
                borderRadius: Math.random() > 0.5 ? '50%' : '2px',
                zIndex: 50,
            }}
        />
    );
};

const ConfettiExplosion = () => {
    const particles = Array.from({ length: 60 });
    return (
        <div className="absolute top-0 left-0 right-0 h-full pointer-events-none overflow-hidden z-50">
            {particles.map((_, i) => (
                <ConfettiParticle key={i} delay={Math.random() * 0.3} />
            ))}
        </div>
    );
};

// --- Status Configuration ---
const statusConfig = {
    waiting: {
        Icon: Clock,
        text: 'Order Placed',
        subtext: 'We\'ve received your order.',
        color: 'text-amber-600',
        bgColor: 'bg-amber-50',
        headerGradient: 'from-amber-500 to-amber-600',
        step: 1,
    },
    preparing: {
        Icon: Coffee,
        text: 'Brewing Now',
        subtext: 'Your coffee is being crafted.',
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        headerGradient: 'from-blue-500 to-blue-600',
        step: 2,
    },
    ready: {
        Icon: Bell,
        text: 'Ready for Pickup!',
        subtext: 'Grab it at the counter.',
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        headerGradient: 'from-green-500 to-green-600',
        step: 3,
    },
    completed: {
        Icon: Check,
        text: 'Enjoy!',
        subtext: 'Order completed.',
        color: 'text-primary-600',
        bgColor: 'bg-primary-50',
        headerGradient: 'from-primary-600 to-primary-800',
        step: 4,
    },
};

interface ModernQueueCardProps {
    order: QueueItem;
    onDismiss?: () => void;
}

const ModernQueueCard: React.FC<ModernQueueCardProps> = ({ order, onDismiss }) => {
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [rating, setRating] = useState(0);
    const [hoveredRating, setHoveredRating] = useState(0);
    const [isReceiptOpen, setIsReceiptOpen] = useState(false);
    const navigate = useNavigate();

    // Defensive check for status config
    const config = statusConfig[order.status] || statusConfig.waiting;

    const { showToast } = useCart();

    // Lock body scroll when modal is open
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    // Trigger confetti when status becomes ready
    useEffect(() => {
        const hasShownConfetti = sessionStorage.getItem(`confetti_shown_${order.id}`);

        if (order.status === 'ready' && !hasShownConfetti) {
            setShowConfetti(true);
            sessionStorage.setItem(`confetti_shown_${order.id}`, 'true');

            const timer = setTimeout(() => setShowConfetti(false), 4000);
            return () => clearTimeout(timer);
        }
    }, [order.status, order.id]);

    const handleBrowseMenu = () => {
        navigate('/menu');
    };

    const handleClaimOrder = async () => {
        if (isUpdating) return;
        setIsUpdating(true);
        try {
            // Calculate loyalty points based on order sizes
            let loyaltyPoints = 0;
            order.orderItems.forEach(item => {
                // Check if the product name contains size information
                const productName = item.productName.toLowerCase();

                // Coffee and drinks: Grande = 4 points, Venti = 5 points
                if (productName.includes('grande')) {
                    loyaltyPoints += 4 * item.quantity;
                } else if (productName.includes('venti')) {
                    loyaltyPoints += 5 * item.quantity;
                }
                // Meals: Ala Carte = 4 points, Combo = 5 points
                else if (productName.includes('ala carte')) {
                    loyaltyPoints += 4 * item.quantity;
                } else if (productName.includes('combo')) {
                    loyaltyPoints += 5 * item.quantity;
                }
            });

            // Update order status
            await db.collection('orders').doc(order.id).update({
                status: 'completed',
                completedAt: new Date(),
                updatedAt: new Date(),
            });

            // Update user statistics: increment totalOrders and currentPoints
            if (order.userId) {
                const updateData: any = {
                    totalOrders: firebase.firestore.FieldValue.increment(1),
                };

                if (loyaltyPoints > 0) {
                    updateData.currentPoints = firebase.firestore.FieldValue.increment(loyaltyPoints);
                    updateData.loyaltyPoints = firebase.firestore.FieldValue.increment(loyaltyPoints);
                }

                await db.collection('users').doc(order.userId).update(updateData);

                if (loyaltyPoints > 0) {
                    showToast(`Order completed! Earned ${loyaltyPoints} loyalty points!`);
                } else {
                    showToast('Order marked as completed!');
                }
            }
        } catch (error) {
            console.error("Error updating order status:", error);
            showToast("Failed to update order status. Please try again.");
        } finally {
            setIsUpdating(false);
        }
    };

    // --- Render Completed State (Modal) ---
    if (order.status === 'completed') {
        return createPortal(
            <>
                <AnimatePresence>
                    <div key="completed-modal" className="fixed inset-0 z-[60] flex items-center justify-center px-4 sm:px-6">
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />

                        {/* Modal Panel */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative w-full max-w-sm overflow-hidden rounded-3xl bg-white shadow-2xl max-h-[90vh] overflow-y-auto scrollbar-hide"
                        >
                            {/* Header */}
                            <div className={`bg-gradient-to-br ${config.headerGradient} px-6 py-8 text-center text-white relative overflow-hidden`}>
                                {/* Decorative circles */}
                                <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-10">
                                    <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-white"></div>
                                    <div className="absolute bottom-10 -left-10 w-24 h-24 rounded-full bg-white"></div>
                                </div>

                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.1 }}
                                    className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-md ring-4 ring-white/10"
                                >
                                    <Check className="h-8 w-8 text-white" strokeWidth={3} />
                                </motion.div>

                                <h2 className="font-display text-2xl font-bold tracking-tight">Enjoy your coffee!</h2>
                                <p className="mt-1 text-primary-100 font-medium">Order #{order.orderNumber} completed</p>
                            </div>

                            {/* Body */}
                            <div className="p-6">
                                <div className="mb-6 text-center">
                                    <p className="mb-3 text-sm font-semibold text-gray-500 uppercase tracking-wide">How was your experience?</p>
                                    <div className="flex justify-center gap-2">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <motion.button
                                                key={star}
                                                whileHover={{ scale: 1.2 }}
                                                whileTap={{ scale: 0.9 }}
                                                onClick={() => setRating(star)}
                                                onMouseEnter={() => setHoveredRating(star)}
                                                onMouseLeave={() => setHoveredRating(0)}
                                                className="focus:outline-none"
                                            >
                                                <Star
                                                    className={`h-8 w-8 transition-colors duration-200 ${star <= (hoveredRating || rating)
                                                        ? 'fill-amber-400 text-amber-400'
                                                        : 'fill-gray-100 text-gray-300'
                                                        }`}
                                                />
                                            </motion.button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    {/* View Receipt */}
                                    <Button
                                        size="lg"
                                        variant="outline"
                                        className="w-full rounded-xl border-2 border-gray-100 text-gray-700 hover:bg-gray-50 hover:border-gray-200 font-semibold py-3.5"
                                        onClick={() => setIsReceiptOpen(true)}
                                    >
                                        <Receipt className="mr-2 h-5 w-5" />
                                        View Receipt
                                    </Button>

                                    {/* Done Button */}
                                    {onDismiss && (
                                        <Button
                                            size="lg"
                                            className="w-full rounded-xl bg-primary-600 text-white hover:bg-primary-700 shadow-lg hover:shadow-primary-600/30 transition-all font-bold py-3.5 text-base"
                                            onClick={() => {
                                                navigate('/queue');
                                                if (onDismiss) onDismiss();
                                            }}
                                        >
                                            Done
                                        </Button>
                                    )}

                                    {/* Order Again */}
                                    <Button
                                        size="lg"
                                        variant="ghost"
                                        className="w-full rounded-xl text-primary-600 hover:bg-primary-50 font-semibold py-2"
                                        onClick={() => navigate('/menu')}
                                    >
                                        Order Again
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </AnimatePresence>

                {/* Digital Receipt Portal */}
                <DigitalReceipt
                    order={order}
                    isOpen={isReceiptOpen}
                    onClose={() => setIsReceiptOpen(false)}
                />
            </>,
            document.body
        );
    }

    // --- Render Active State (Modal) ---
    return createPortal(
        <>
            <AnimatePresence>
                <div key="active-modal" className="fixed inset-0 z-[60] flex items-center justify-center px-4 sm:px-6">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                    />

                    {/* Modal Panel */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl max-h-[90vh] overflow-y-auto scrollbar-hide"
                    >
                        {showConfetti && <ConfettiExplosion />}

                        {/* Header Section */}
                        <motion.div
                            className={`relative overflow-hidden px-6 py-8 text-center text-white bg-gradient-to-br ${config.headerGradient}`}
                            layout
                        >
                            {/* Decorative circles */}
                            <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-10">
                                <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-white"></div>
                                <div className="absolute bottom-10 -left-10 w-24 h-24 rounded-full bg-white"></div>
                            </div>

                            <div className="relative z-10 flex flex-col items-center">
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={order.status}
                                        initial={{ scale: 0.8, opacity: 0, rotate: -20 }}
                                        animate={{ scale: 1, opacity: 1, rotate: 0 }}
                                        exit={{ scale: 0.8, opacity: 0, rotate: 20 }}
                                        transition={{ type: "spring", stiffness: 200, damping: 15 }}
                                        className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-md ring-4 ring-white/10 shadow-lg"
                                    >
                                        <config.Icon className="h-8 w-8 text-white" />
                                    </motion.div>
                                </AnimatePresence>

                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={`${order.status}-text`}
                                        initial={{ y: 10, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        exit={{ y: -10, opacity: 0 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <h2 className="font-display text-2xl font-bold tracking-tight">
                                            {config.text}
                                        </h2>
                                        <p className="mt-1 text-white/90 font-medium text-base">{config.subtext}</p>
                                    </motion.div>
                                </AnimatePresence>

                                <div className="mt-3 inline-flex items-center rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white backdrop-blur-md border border-white/10">
                                    Order #{order.orderNumber}
                                </div>
                            </div>
                        </motion.div>

                        {/* Progress Stepper */}
                        <div className="px-6 py-5 bg-white">
                            <div className="relative flex justify-between items-center">
                                {/* Connecting Line Background */}
                                <div className="absolute left-[20px] right-[20px] top-[16px] h-1 -translate-y-1/2 bg-gray-100 rounded-full z-0"></div>

                                {/* Active Progress Line */}
                                <motion.div
                                    className={`absolute left-[20px] top-[16px] h-1 -translate-y-1/2 rounded-full z-0 bg-gradient-to-r ${config.headerGradient}`}
                                    initial={{ width: '0%' }}
                                    animate={{
                                        width: config.step === 1 ? '0%' :
                                            config.step === 2 ? '50%' :
                                                'calc(100% - 40px)'
                                    }}
                                    transition={{ duration: 0.5, ease: "easeInOut" }}
                                ></motion.div>

                                {/* Steps */}
                                {['waiting', 'preparing', 'ready'].map((step, index) => {
                                    const stepNum = index + 1;
                                    const isActive = config.step >= stepNum;
                                    const isCurrent = config.step === stepNum;

                                    let StepIcon = Clock;
                                    if (step === 'preparing') StepIcon = Coffee;
                                    if (step === 'ready') StepIcon = Bell;

                                    return (
                                        <div key={step} className="relative z-10 flex flex-col items-center">
                                            <motion.div
                                                animate={{
                                                    scale: isCurrent ? 1.2 : 1,
                                                    backgroundColor: isActive ? '#fff' : '#fff',
                                                    borderColor: isActive ? 'currentColor' : '#E5E7EB',
                                                    boxShadow: isCurrent ? '0 10px 15px -3px rgba(0, 0, 0, 0.1)' : 'none',
                                                }}
                                                transition={{ duration: 0.3 }}
                                                className={`flex h-8 w-8 items-center justify-center rounded-full border-2 transition-colors duration-300 ${isActive ? config.color.replace('text-', 'border-') : 'border-gray-200 text-gray-300'}`}
                                            >
                                                <StepIcon className={`h-4 w-4 ${isActive ? config.color : 'text-gray-300'}`} />
                                            </motion.div>
                                            <span className={`mt-2 text-[10px] font-bold uppercase tracking-wider transition-colors duration-300 ${isActive ? config.color : 'text-gray-400'}`}>
                                                {step}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Order Details */}
                        <div className="border-t border-gray-100 bg-gray-50/50 px-6 py-5">
                            <div className="mb-4 grid grid-cols-2 gap-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-100">
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Estimated Wait</p>
                                    <p className="text-lg font-bold text-gray-900 mt-0.5">~{order.estimatedTime} min</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Amount</p>
                                    <p className="text-lg font-bold text-primary-600 mt-0.5">₱{order.totalAmount.toFixed(2)}</p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <button
                                    onClick={() => setIsDetailsOpen(!isDetailsOpen)}
                                    className="flex w-full items-center justify-between rounded-xl bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-gray-100 transition-all hover:bg-gray-50 hover:shadow-md"
                                >
                                    <span className="flex items-center gap-3">
                                        <Coffee className="h-4 w-4 text-gray-400" />
                                        <span className="font-semibold">View Order Items ({order.orderItems.length})</span>
                                    </span>
                                    <ChevronDown
                                        className={`h-4 w-4 text-gray-400 transition-transform duration-300 ${isDetailsOpen ? 'rotate-180' : ''}`}
                                    />
                                </button>

                                <AnimatePresence>
                                    {isDetailsOpen && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-100"
                                        >
                                            <ul className="divide-y divide-gray-50 px-5">
                                                {order.orderItems.map((item, index) => (
                                                    <li key={index} className="flex justify-between py-3 text-sm">
                                                        <div>
                                                            <span className="font-bold text-gray-900 block">{item.productName}</span>
                                                            <div className="text-xs text-gray-500 mt-0.5">Qty: {item.quantity}</div>
                                                        </div>
                                                        <span className="font-bold text-gray-600">₱{(item.price * item.quantity).toFixed(2)}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                            <div className="p-3 border-t border-gray-50 bg-gray-50/50">
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="w-full text-xs font-semibold text-primary-600 hover:bg-primary-50"
                                                    onClick={() => setIsReceiptOpen(true)}
                                                >
                                                    <Receipt className="mr-2 h-3 w-3" />
                                                    View Digital Receipt
                                                </Button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Action Buttons */}
                                <div className="pt-1 space-y-2">
                                    {order.status === 'ready' ? (
                                        <Button
                                            variant="primary"
                                            className="w-full rounded-xl bg-green-600 text-white hover:bg-green-700 shadow-lg hover:shadow-green-600/30 transition-all py-3.5 text-base font-bold"
                                            onClick={handleClaimOrder}
                                            disabled={isUpdating}
                                        >
                                            {isUpdating ? (
                                                <span className="flex items-center justify-center gap-2">
                                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                                    Updating...
                                                </span>
                                            ) : (
                                                <span className="flex items-center justify-center gap-2">
                                                    <ThumbsUp className="h-4 w-4" />
                                                    I've Received My Order
                                                </span>
                                            )}
                                        </Button>
                                    ) : (
                                        <Button
                                            variant="primary"
                                            className="w-full rounded-xl bg-coffee-600 text-white hover:bg-coffee-700 shadow-lg hover:shadow-coffee-600/30 transition-all py-3.5 font-bold"
                                            onClick={handleBrowseMenu}
                                        >
                                            <ShoppingBag className="mr-2 h-5 w-5" />
                                            Browse Menu
                                        </Button>
                                    )}

                                    {/* Back to Menu for active orders */}
                                    <Button
                                        variant="ghost"
                                        className="w-full rounded-xl text-gray-500 hover:bg-gray-100 font-semibold py-2.5"
                                        onClick={() => navigate('/menu')}
                                    >
                                        <ArrowLeft className="mr-2 h-4 w-4" />
                                        Back to Menu
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </AnimatePresence>

            {/* Digital Receipt Portal */}
            <DigitalReceipt
                order={order}
                isOpen={isReceiptOpen}
                onClose={() => setIsReceiptOpen(false)}
            />
        </>,
        document.body
    );
};

export default ModernQueueCard;