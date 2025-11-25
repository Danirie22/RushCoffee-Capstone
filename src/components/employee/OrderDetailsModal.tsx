import React from 'react';
import { X, Clock, User, CreditCard, Package, Check } from 'lucide-react';
import { OrderData, OrderItem } from '../../services/orderService';
import Badge from '../ui/Badge';

interface OrderDetailsModalProps {
    order: OrderData & { id: string };
    isOpen: boolean;
    onClose: () => void;
    onStatusUpdate?: (orderId: string, newStatus: 'preparing' | 'ready' | 'completed') => void;
}

const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({ order, isOpen, onClose, onStatusUpdate }) => {
    if (!isOpen) return null;

    const formatTime = (timestamp: any) => {
        if (!timestamp) return '';
        const date = timestamp.toDate();
        return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'preparing':
                return <Badge className="bg-yellow-100 text-yellow-800 text-sm">🟡 Preparing</Badge>;
            case 'ready':
                return <Badge className="bg-green-100 text-green-800 text-sm">🟢 Ready for Pickup</Badge>;
            case 'completed':
                return <Badge className="bg-gray-100 text-gray-800 text-sm">⚫ Completed</Badge>;
            case 'cancelled':
                return <Badge className="bg-red-100 text-red-800 text-sm">🔴 Cancelled</Badge>;
            default:
                return <Badge className="text-sm">{status}</Badge>;
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="p-6 border-b bg-gradient-to-r from-coffee-600 to-coffee-800 text-white">
                    <div className="flex items-start justify-between">
                        <div>
                            <h2 className="text-2xl font-bold mb-2">{order.orderNumber}</h2>
                            <div className="flex items-center gap-3 text-coffee-100">
                                <div className="flex items-center gap-1.5">
                                    <Clock className="h-4 w-4" />
                                    <span className="text-sm">{formatTime(order.createdAt)}</span>
                                </div>
                                {getStatusBadge(order.status)}
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="h-8 w-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Order Items */}
                    <div>
                        <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                            <Package className="h-5 w-5 text-coffee-600" />
                            Order Items
                        </h3>
                        <div className="space-y-2">
                            {order.items.map((item: OrderItem, idx: number) => (
                                <div key={idx} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                                    <div className="flex-1">
                                        <div className="font-semibold text-gray-900">{item.productName}</div>
                                        <div className="text-sm text-gray-500 mt-1">
                                            Size: {item.sizeLabel}
                                        </div>
                                        {item.customizations && (
                                            <div className="text-xs text-gray-500 mt-1 space-y-0.5">
                                                {item.customizations.sugarLevel && (
                                                    <div>• Sugar: {item.customizations.sugarLevel}</div>
                                                )}
                                                {item.customizations.iceLevel && (
                                                    <div>• Ice: {item.customizations.iceLevel}</div>
                                                )}
                                                {item.customizations.toppings && item.customizations.toppings.length > 0 && (
                                                    <div>• Toppings: {item.customizations.toppings.join(', ')}</div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm text-gray-500">Qty: {item.quantity}</div>
                                        <div className="font-bold text-gray-900">₱{(item.price * item.quantity).toFixed(2)}</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Total */}
                        <div className="mt-4 p-4 bg-coffee-50 rounded-lg border-2 border-coffee-200">
                            <div className="flex justify-between items-center">
                                <span className="font-bold text-gray-900 text-lg">Total</span>
                                <span className="font-bold text-coffee-700 text-2xl">₱{order.subtotal.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Payment & Employee Info */}
                    <div className="grid grid-cols-2 gap-4">
                        {/* Payment */}
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-2 text-gray-600 mb-2">
                                <CreditCard className="h-4 w-4" />
                                <span className="font-semibold">Payment</span>
                            </div>
                            <div className="space-y-1 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Method:</span>
                                    <span className="font-medium capitalize">{order.paymentMethod}</span>
                                </div>
                                {order.paymentMethod === 'cash' && order.paymentDetails.amountReceived && (
                                    <>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Received:</span>
                                            <span className="font-medium">₱{order.paymentDetails.amountReceived.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Change:</span>
                                            <span className="font-medium">₱{order.paymentDetails.change?.toFixed(2)}</span>
                                        </div>
                                    </>
                                )}
                                {order.paymentMethod === 'gcash' && order.paymentDetails.referenceNumber && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Ref:</span>
                                        <span className="font-medium">{order.paymentDetails.referenceNumber}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Employee */}
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-2 text-gray-600 mb-2">
                                <User className="h-4 w-4" />
                                <span className="font-semibold">Processed By</span>
                            </div>
                            <div className="text-sm">
                                <div className="font-medium text-gray-900">{order.employeeName}</div>
                                {order.customerName && (
                                    <div className="text-gray-600 mt-1">
                                        Customer: {order.customerName}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                {onStatusUpdate && (order.status === 'preparing' || order.status === 'ready') && (
                    <div className="p-6 border-t bg-gray-50 flex gap-3">
                        {order.status === 'preparing' && (
                            <button
                                onClick={() => {
                                    onStatusUpdate(order.id, 'ready');
                                    onClose();
                                }}
                                className="flex-1 py-3 px-4 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
                            >
                                <Check className="h-5 w-5" />
                                Mark as Ready
                            </button>
                        )}
                        {order.status === 'ready' && (
                            <button
                                onClick={() => {
                                    onStatusUpdate(order.id, 'completed');
                                    onClose();
                                }}
                                className="flex-1 py-3 px-4 bg-gray-800 hover:bg-gray-900 text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
                            >
                                <Check className="h-5 w-5" />
                                Mark as Completed
                            </button>
                        )}
                        <button
                            onClick={onClose}
                            className="px-6 py-3 bg-white hover:bg-gray-100 text-gray-700 border border-gray-300 rounded-xl font-semibold transition-colors"
                        >
                            Close
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrderDetailsModal;
