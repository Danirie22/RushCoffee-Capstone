import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QueueItem } from '../../context/OrderContext';
import OrderCard from './OrderCard';

type OrderStatus = 'waiting' | 'preparing' | 'ready' | 'completed';

interface QueueColumnProps {
    title: string;
    orders: QueueItem[];
    onUpdateStatus: (orderId: string, newStatus: OrderStatus) => void;
    color: 'yellow' | 'blue' | 'green';
}

const colorMap = {
    yellow: 'border-yellow-400',
    blue: 'border-blue-400',
    green: 'border-green-400',
};

const QueueColumn: React.FC<QueueColumnProps> = ({ title, orders, onUpdateStatus, color }) => {
    return (
        <div className="flex flex-col rounded-lg bg-gray-100 p-4">
            <h2 className={`mb-4 border-b-4 pb-2 font-display text-xl font-bold text-gray-700 ${colorMap[color]}`}>
                {title} <span className="text-base font-medium text-gray-500">({orders.length})</span>
            </h2>
            <div className="flex-grow space-y-4 overflow-y-auto">
                <AnimatePresence>
                    {orders.map(order => (
                        <motion.div
                            key={order.id}
                            layout
                            initial={{ opacity: 0, y: 50, scale: 0.3 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
                        >
                            <OrderCard order={order} onUpdateStatus={onUpdateStatus} />
                        </motion.div>
                    ))}
                </AnimatePresence>
                {orders.length === 0 && (
                    <div className="flex h-32 items-center justify-center text-sm text-gray-500">
                        No orders in this stage.
                    </div>
                )}
            </div>
        </div>
    );
};

export default QueueColumn;