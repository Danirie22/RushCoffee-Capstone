import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ArrowRight, User, Clock, Check, XCircle } from 'lucide-react';

import { QueueItem } from '../../context/OrderContext';

type OrderStatus = 'waiting' | 'preparing' | 'ready' | 'completed';

interface OrderCardProps {
    order: QueueItem;
    onUpdateStatus: (orderId: string, newStatus: OrderStatus) => void;
    onCancelOrder: (orderId: string) => void;
}

const statusActions = {
    waiting: {
        text: 'Start Preparing',
        nextStatus: 'preparing' as OrderStatus,
        color: 'bg-blue-500 hover:bg-blue-600',
    },
    preparing: {
        text: 'Mark as Ready',
        nextStatus: 'ready' as OrderStatus,
        color: 'bg-green-500 hover:bg-green-600',
    },
    ready: {
        text: 'Complete Order',
        nextStatus: 'completed' as OrderStatus,
        color: 'bg-primary-600 hover:bg-primary-700',
    },
};

const OrderCard: React.FC<OrderCardProps> = ({ order, onUpdateStatus, onCancelOrder }) => {
    const action = statusActions[order.status as keyof typeof statusActions];
    const timeSinceOrder = formatDistanceToNow(order.timestamp, { addSuffix: true });

    return (
        <div className="rounded-lg border bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
            <div className="flex items-center justify-between">
                <h3 className="font-mono text-sm font-bold text-primary-700">{order.orderNumber}</h3>
                <p className="font-display text-lg font-bold text-gray-800">₱{order.totalAmount.toFixed(2)}</p>
            </div>
            <div className="mt-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>{order.customerName}</span>
                </div>
                <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>{timeSinceOrder}</span>
                </div>
            </div>
            <div className="mt-3 border-t pt-2">
                <ul className="text-xs text-gray-500">
                    {order.orderItems.map((item, index) => (
                        <li key={index}>
                            {item.quantity}x {item.productName}
                        </li>
                    ))}
                </ul>
            </div>
            <div className="mt-4 flex gap-2">
                {action && (
                    <button
                        onClick={() => onUpdateStatus(order.id, action.nextStatus)}
                        className={`flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors ${action.color}`}
                    >
                        <span>{action.text}</span>
                        {action.nextStatus === 'completed' ? <Check className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
                    </button>
                )}
                <button
                    onClick={() => onCancelOrder(order.id)}
                    className="flex items-center justify-center gap-2 rounded-full bg-red-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-red-600"
                    title="Cancel Order"
                >
                    <XCircle className="h-4 w-4" />
                    <span>Cancel</span>
                </button>
            </div>
        </div>
    );
};

export default OrderCard;
