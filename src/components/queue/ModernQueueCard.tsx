import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { Clock, Coffee, Bell, Check, ChevronDown, RefreshCw, ShoppingCart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import Card from '../../../components/ui/Card';
import Button from '../ui/Button';
import { QueueItem } from '../../context/OrderContext';

const statusConfig = {
  waiting: {
    Icon: Clock,
    text: 'Your order is in the queue.',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
    progress: 10,
    progressText: 'Ordered'
  },
  preparing: {
    Icon: Coffee,
    text: 'Your order is being prepared.',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    progress: 50,
    progressText: 'Preparing'
  },
  ready: {
    Icon: Bell,
    text: 'Your order is ready for pickup!',
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    progress: 100,
    progressText: 'Ready'
  },
  completed: {
    Icon: Check,
    text: 'Your order has been completed.',
    color: 'text-primary-600',
    bgColor: 'bg-primary-100',
    progress: 100,
    progressText: 'Completed'
  },
};

const ModernQueueCard: React.FC<{ order: QueueItem }> = ({ order }) => {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const navigate = useNavigate();
  const config = statusConfig[order.status];
  
  const handleActionClick = () => {
    navigate('/menu');
  };

  return (
    <Card className="w-full max-w-md rounded-2xl p-6 shadow-lg">
      <div className="flex items-center gap-4">
        <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full ${config.bgColor}`}>
          <config.Icon className={`h-6 w-6 ${config.color}`} />
        </div>
        <div>
          <h2 className="font-display text-xl font-bold text-coffee-900">{config.text}</h2>
          <p className="text-sm text-gray-500">
            Order #{order.orderNumber}
          </p>
        </div>
      </div>

      <div className="mt-6 space-y-2">
        <div className="flex justify-between text-sm font-medium text-gray-600">
          <span>Ordered</span>
          <span>Preparing</span>
          <span>Ready</span>
        </div>
        <div className="h-2 w-full rounded-full bg-gray-200">
          <div
            className="h-2 rounded-full bg-primary-600 transition-all duration-500 ease-out"
            style={{ width: `${config.progress}%` }}
          />
        </div>
        <p className="text-right text-sm font-semibold text-primary-600">{config.progressText}</p>
      </div>

      <div className="mt-6 border-t border-gray-200 pt-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Time Placed</span>
          <span className="font-medium text-gray-800">{format(order.timestamp, 'p')}</span>
        </div>
        <div className="mt-1 flex justify-between text-sm">
          <span className="text-gray-500">Estimated Wait</span>
          <span className="font-medium text-gray-800">~{order.estimatedTime} min</span>
        </div>
         <div className="mt-3 flex justify-between text-lg font-bold">
          <span className="text-gray-800">Total</span>
          <span className="text-primary-600">₱{order.totalAmount.toFixed(2)}</span>
        </div>
      </div>

      <div className="mt-4 border-t border-gray-200">
        <button
          onClick={() => setIsDetailsOpen(!isDetailsOpen)}
          className="flex w-full items-center justify-between py-3 text-left font-semibold text-gray-700 hover:text-primary-600"
        >
          <span>View Items ({order.orderItems.length})</span>
          <ChevronDown
            className={`h-5 w-5 transform transition-transform duration-300 ${isDetailsOpen ? 'rotate-180' : ''}`}
          />
        </button>
        <AnimatePresence>
          {isDetailsOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <ul className="space-y-2 pb-2">
                {order.orderItems.map((item, index) => (
                  <li key={index} className="flex justify-between border-b border-gray-100 py-1 text-sm">
                    <div>
                      <span className="font-medium text-gray-800">{item.productName}</span>
                      <span className="ml-2 text-gray-500">x{item.quantity}</span>
                    </div>
                    <span className="text-gray-600">₱{(item.price * item.quantity).toFixed(2)}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      <div className="mt-4 border-t border-gray-200 pt-4">
        <Button
            size="lg"
            className="w-full"
            onClick={handleActionClick}
            variant={order.status === 'completed' ? 'primary' : 'secondary'}
        >
            {order.status === 'completed' ? (
                <>
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    Start New Order
                </>
            ) : (
                <>
                    <RefreshCw className="mr-2 h-5 w-5" />
                    Reorder Items
                </>
            )}
        </Button>
      </div>
    </Card>
  );
};

export default ModernQueueCard;