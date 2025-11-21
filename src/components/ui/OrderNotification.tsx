import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Info, AlertTriangle, XCircle, X } from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';

const OrderNotification: React.FC = () => {
    const { notification, hideNotification } = useNotification();

    const icons = {
        success: <CheckCircle className="h-6 w-6 text-green-500" />,
        info: <Info className="h-6 w-6 text-blue-500" />,
        warning: <AlertTriangle className="h-6 w-6 text-amber-500" />,
        error: <XCircle className="h-6 w-6 text-red-500" />,
    };

    const bgColors = {
        success: 'bg-white border-green-100',
        info: 'bg-white border-blue-100',
        warning: 'bg-white border-amber-100',
        error: 'bg-white border-red-100',
    };

    return (
        <AnimatePresence>
            {notification.isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: -50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -50 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    className={`fixed top-6 left-0 right-0 z-[100] mx-auto flex w-[90%] max-w-md items-center gap-3 rounded-xl border p-4 shadow-xl ${bgColors[notification.type]}`}
                >
                    <div className="flex-shrink-0">
                        {icons[notification.type]}
                    </div>
                    <div className="flex-1">
                        <p className="font-medium text-gray-900">
                            {notification.message}
                        </p>
                    </div>
                    <button
                        onClick={hideNotification}
                        className="flex-shrink-0 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-500"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default OrderNotification;
