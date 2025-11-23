import React from 'react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { Coffee, Check, X, RefreshCw, ShoppingBag } from 'lucide-react';
import { QueueItem } from '../../context/OrderContext';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import { useCart } from '../../context/CartContext';
import { useProduct } from '../../context/ProductContext';
import { ReorderItem } from '../../context/CartContext';

interface OrderHistoryProps {
  orders: QueueItem[];
  limit?: number;
  showViewAll?: boolean;
  onViewAll?: () => void;
}

const statusConfig = {
  completed: { icon: Check, color: 'bg-green-100 text-green-800' },
  cancelled: { icon: X, color: 'bg-red-100 text-red-800' },
  preparing: { icon: Coffee, color: 'bg-blue-100 text-blue-800' },
  waiting: { icon: Coffee, color: 'bg-yellow-100 text-yellow-800' },
  ready: { icon: Coffee, color: 'bg-purple-100 text-purple-800' },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
  },
};

const OrderCard: React.FC<{ order: QueueItem }> = ({ order }) => {
  const StatusIcon = statusConfig[order.status as keyof typeof statusConfig]?.icon || Coffee;
  const statusColor = statusConfig[order.status as keyof typeof statusConfig]?.color || 'bg-gray-100 text-gray-800';
  const { addMultipleToCart, showToast } = useCart();
  const { products } = useProduct();

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

  const itemsSummary = () => {
    const items = order.orderItems;
    if (items.length <= 2) {
      return items.map(item => `${item.quantity}x ${item.productName}`).join(', ');
    }
    const firstTwo = items.slice(0, 2).map(item => item.productName).join(', ');
    return `${firstTwo}, and ${items.length - 2} more item(s)`;
  };

  return (
    <Card hover className="transition-shadow duration-300">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-grow">
          <div className="flex items-center justify-between">
            <p className="font-mono text-sm font-semibold text-primary-700">{order.orderNumber}</p>
            <Badge className={`capitalize ${statusColor}`}>
              <StatusIcon className="mr-1 h-3 w-3" />
              {order.status}
            </Badge>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            {format(order.timestamp, 'MMM dd, yyyy • hh:mm a')}
          </p>
          <p className="mt-2 text-sm text-gray-700">{itemsSummary()}</p>
          {order.status === 'cancelled' && order.cancellationReason && (
            <div className="mt-2 rounded-md bg-red-50 p-2 text-sm text-red-700 border border-red-100">
              <span className="font-semibold">Reason:</span> {order.cancellationReason}
            </div>
          )}
        </div>
        <div className="flex-shrink-0 text-right sm:ml-4">
          <p className="font-display text-2xl font-bold text-coffee-900">₱{order.totalAmount.toFixed(2)}</p>
          <Button size="sm" variant="secondary" className="mt-2" onClick={handleReorder}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Reorder
          </Button>
        </div>
      </div>
    </Card>
  );
};

const OrderHistory: React.FC<OrderHistoryProps> = ({ orders, limit, showViewAll, onViewAll }) => {
  const sortedOrders = [...orders].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  const displayOrders = limit ? sortedOrders.slice(0, limit) : sortedOrders;

  if (orders.length === 0) {
    return (
      <div className="py-16 text-center">
        <ShoppingBag className="mx-auto h-16 w-16 text-gray-300" />
        <h3 className="mt-4 text-xl font-semibold text-gray-800">No Orders Yet</h3>
        <p className="mt-2 text-gray-600">Your past orders will appear here.</p>
        <Button size="lg" className="mt-6">Browse Menu</Button>
      </div>
    );
  }

  return (
    <div>
      <motion.div
        className="space-y-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {displayOrders.map(order => (
          <motion.div key={order.id} variants={itemVariants} layout>
            <OrderCard order={order} />
          </motion.div>
        ))}
      </motion.div>
      {showViewAll && sortedOrders.length > (limit || 0) && (
        <div className="mt-6 text-center">
          <Button variant="ghost" onClick={onViewAll}>
            View All Orders
          </Button>
        </div>
      )}
    </div>
  );
};

export default OrderHistory;