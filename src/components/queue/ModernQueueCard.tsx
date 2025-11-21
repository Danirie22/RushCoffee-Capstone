import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { Clock, Coffee, Bell, Check, ChevronDown, RefreshCw, ShoppingCart, Star, X, ArrowLeft, ThumbsUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import Card from '../../../components/ui/Card';
import Button from '../ui/Button';
import { QueueItem } from '../../context/OrderContext';
import { useCart, ReorderItem } from '../../context/CartContext';
import { useProduct } from '../../context/ProductContext';
import { db } from '../../firebaseConfig';

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
    bgColor: 'bg-amber-100',
    borderColor: 'border-amber-200',
    step: 1,
  },
  preparing: {
    Icon: Coffee,
    text: 'Brewing Now',
    subtext: 'Your coffee is being crafted.',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    borderColor: 'border-blue-200',
    step: 2,
  },
  ready: {
    Icon: Bell,
    text: 'Ready for Pickup!',
    subtext: 'Grab it at the counter.',
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    borderColor: 'border-green-200',
    step: 3,
  },
  completed: {
    Icon: Check,
    text: 'Enjoy!',
    subtext: 'Order completed.',
    color: 'text-primary-600',
    bgColor: 'bg-primary-100',
    borderColor: 'border-primary-200',
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
  const navigate = useNavigate();

  // Defensive check for status config
  const config = statusConfig[order.status] || statusConfig.waiting;

  const { addMultipleToCart, showToast } = useCart();
  const { products } = useProduct();

  // Trigger confetti when status becomes ready
  useEffect(() => {
    // Only show confetti if status is ready AND we haven't shown it recently for this order
    // We use sessionStorage to track if we've shown confetti for this specific order ID
    const hasShownConfetti = sessionStorage.getItem(`confetti_shown_${order.id}`);

    if (order.status === 'ready' && !hasShownConfetti) {
      setShowConfetti(true);
      sessionStorage.setItem(`confetti_shown_${order.id}`, 'true');

      const timer = setTimeout(() => setShowConfetti(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [order.status, order.id]);

  const handleReorder = () => {
    const itemsToAdd: ReorderItem[] = [];
    const unavailableItems: string[] = [];

    for (const orderItem of order.orderItems) {
      const product = products.find(p => p.id === orderItem.productId);

      if (!product || !product.available || product.stock === 0) {
        unavailableItems.push(orderItem.productName);
        continue;
      }

      const sizeMatch = orderItem.productName.match(/\((Grande|Venti)\)$/);
      const sizeName = sizeMatch ? sizeMatch[1] : null;

      if (!sizeName) {
        unavailableItems.push(orderItem.productName);
        continue;
      }

      const selectedSize = product.sizes.find(s => s.name === sizeName);

      if (!selectedSize) {
        unavailableItems.push(orderItem.productName);
        continue;
      }

      itemsToAdd.push({
        product,
        selectedSize,
        quantity: orderItem.quantity,
        customizations: orderItem.customizations,
      });
    }

    if (itemsToAdd.length > 0) {
      addMultipleToCart(itemsToAdd);
    }

    if (unavailableItems.length > 0) {
      showToast(`Could not add: ${unavailableItems.join(', ')}. They may be unavailable.`);
    }
  };

  const handleClaimOrder = async () => {
    if (isUpdating) return;
    setIsUpdating(true);
    try {
      await db.collection('orders').doc(order.id).update({
        status: 'completed'
      });
      // The UI will update automatically via the real-time listener in OrderContext
      // QueuePage will then switch to showing the completed card
    } catch (error) {
      console.error("Error updating order status:", error);
      showToast("Failed to update order status. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  // --- Render Completed State ---
  if (order.status === 'completed') {
    return (
      <Card className="w-full max-w-md overflow-hidden rounded-3xl border-none shadow-2xl ring-1 ring-black/5 relative">
        {/* Dismiss Button */}
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="absolute top-4 right-4 z-20 rounded-full bg-white/20 p-2 text-white backdrop-blur-sm transition-colors hover:bg-white/30"
          >
            <X className="h-5 w-5" />
          </button>
        )}

        <div className="bg-gradient-to-br from-primary-600 to-primary-800 px-6 py-10 text-center text-white">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-md">
            <Check className="h-8 w-8 text-white" />
          </div>
          <h2 className="font-display text-2xl font-bold">Enjoy your coffee!</h2>
          <p className="mt-2 text-primary-100">Order #{order.orderNumber} completed</p>
        </div>

        <div className="p-6">
          <div className="mb-6 text-center">
            <p className="mb-3 text-sm font-medium text-gray-500">How was your experience?</p>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className={`rounded-full p-1 transition-colors focus:outline-none ${star <= (hoveredRating || rating) ? 'text-yellow-400' : 'text-gray-300'
                    }`}
                >
                  <Star className={`h-8 w-8 ${star <= (hoveredRating || rating) ? 'fill-yellow-400' : 'fill-transparent'}`} />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {/* Primary Action: Done (Dismiss) */}
            {onDismiss && (
              <Button
                size="lg"
                className="w-full rounded-xl bg-primary-600 text-white hover:bg-primary-700 shadow-md hover:shadow-lg transition-all"
                onClick={onDismiss}
              >
                Done
              </Button>
            )}

            {/* Secondary Action: Order Again */}
            <Button
              size="lg"
              variant="ghost"
              className="w-full rounded-xl text-gray-600 hover:bg-gray-50"
              onClick={() => navigate('/menu')}
            >
              Order Again
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  // --- Render Active State ---
  return (
    <div className="relative w-full max-w-md">

      <Card className="overflow-hidden rounded-3xl border-none shadow-2xl ring-1 ring-black/5 relative">
        {showConfetti && <ConfettiExplosion />}

        {/* Header Section with Transitions */}
        <motion.div
          className={`relative overflow-hidden px-6 py-8 transition-colors duration-500 ${config.bgColor}`}
          layout
        >
          {/* Background Blob */}
          <div className={`absolute -right-10 -top-10 h-40 w-40 rounded-full opacity-20 blur-3xl transition-colors duration-500 ${config.color.replace('text-', 'bg-')}`} />

          <div className="relative z-10 flex flex-col items-center text-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={order.status}
                initial={{ scale: 0.8, opacity: 0, rotate: -20 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                exit={{ scale: 0.8, opacity: 0, rotate: 20 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className={`mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-sm ${config.color}`}
              >
                <config.Icon className="h-10 w-10" />
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
                <h2 className="font-display text-2xl font-bold text-gray-900">
                  {config.text}
                </h2>
                <p className="mt-1 text-gray-600">{config.subtext}</p>
              </motion.div>
            </AnimatePresence>

            <div className="mt-3 inline-flex items-center rounded-full bg-white/60 px-3 py-1 text-xs font-medium text-gray-500 backdrop-blur-sm">
              Order #{order.orderNumber}
            </div>
          </div>
        </motion.div>

        {/* Progress Stepper */}
        <div className="px-6 py-6">
          <div className="relative flex justify-between items-center">
            {/* Connecting Line Background */}
            <div className="absolute left-[20px] right-[20px] top-[20px] h-1 -translate-y-1/2 bg-gray-100 rounded-full z-0"></div>

            {/* Active Progress Line */}
            <motion.div
              className="absolute left-[20px] top-[20px] h-1 -translate-y-1/2 bg-primary-500 rounded-full z-0"
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
                      scale: isCurrent ? 1.1 : 1,
                      backgroundColor: isActive ? '#D97706' : '#F3F4F6',
                      borderColor: isActive ? '#D97706' : '#E5E7EB',
                      boxShadow: isCurrent ? '0 0 0 4px rgba(217, 119, 6, 0.2)' : 'none',
                    }}
                    transition={{ duration: 0.3 }}
                    className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors duration-300 bg-white ${isActive ? 'text-white border-primary-600 bg-primary-600' : 'text-gray-400 border-gray-200'}`}
                  >
                    <StepIcon className="h-5 w-5" />
                  </motion.div>
                  <span className={`mt-2 text-xs font-medium transition-colors duration-300 ${isActive ? 'text-primary-700' : 'text-gray-400'}`}>
                    {step.charAt(0).toUpperCase() + step.slice(1)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Order Details */}
        <div className="border-t border-gray-100 bg-gray-50/50 px-6 py-6">
          <div className="mb-6 grid grid-cols-2 gap-4 rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-100">
            <div>
              <p className="text-xs text-gray-500">Estimated Wait</p>
              <p className="text-lg font-bold text-gray-900">~{order.estimatedTime} min</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">Total Amount</p>
              <p className="text-lg font-bold text-primary-600">₱{order.totalAmount.toFixed(2)}</p>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => setIsDetailsOpen(!isDetailsOpen)}
              className="flex w-full items-center justify-between rounded-xl bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-gray-100 transition-all hover:bg-gray-50"
            >
              <span className="flex items-center gap-2">
                <Coffee className="h-4 w-4 text-gray-400" />
                View Order Items ({order.orderItems.length})
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
                  <ul className="divide-y divide-gray-50 px-4">
                    {order.orderItems.map((item, index) => (
                      <li key={index} className="flex justify-between py-3 text-sm">
                        <div>
                          <span className="font-medium text-gray-900">{item.productName}</span>
                          <div className="text-xs text-gray-500">Qty: {item.quantity}</div>
                        </div>
                        <span className="font-medium text-gray-600">₱{(item.price * item.quantity).toFixed(2)}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Action Buttons */}
            {order.status === 'ready' ? (
              <Button
                variant="primary"
                className="w-full rounded-xl bg-green-600 text-white hover:bg-green-700 shadow-md hover:shadow-lg transition-all"
                onClick={handleClaimOrder}
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <span className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    Updating...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <ThumbsUp className="h-4 w-4" />
                    I've Received My Order
                  </span>
                )}
              </Button>
            ) : (
              <Button
                variant="primary"
                className="w-full rounded-xl bg-primary-600 text-white hover:bg-primary-700 shadow-md hover:shadow-lg transition-all"
                onClick={handleReorder}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Add More Items
              </Button>
            )}

            {/* Back to Menu for active orders */}
            <Button
              variant="ghost"
              className="w-full rounded-xl text-gray-500 hover:bg-gray-50"
              onClick={() => navigate('/menu')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Menu
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ModernQueueCard;