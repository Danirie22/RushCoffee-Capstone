import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Clock, User, CreditCard, Package, Check, FileText } from 'lucide-react';
import { Order, OrderItem } from '../../types';
import Badge from '../ui/Badge';
import { db } from '../../firebaseConfig';

interface OrderDetailsModalProps {
    order: Order;
    isOpen: boolean;
    onClose: () => void;
    onStatusUpdate?: (orderId: string, newStatus: 'preparing' | 'ready' | 'completed') => void;
}

const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({ order, isOpen, onClose, onStatusUpdate }) => {
    const [employeeFullName, setEmployeeFullName] = useState<string>('');
    const [toppingPrices, setToppingPrices] = useState<Map<string, number>>(new Map());

    // Fetch employee data from Firestore
    useEffect(() => {
        if (!isOpen) return;

        const fetchEmployeeData = async () => {
            console.log('🔍 Fetching employee data:', {
                employeeId: order.employeeId,
                employeeName: order.employeeName
            });

            // If no employeeId but we have employeeName, use it directly
            if (!order.employeeId) {
                console.log('⚠️ No employeeId found, using employeeName:', order.employeeName);
                setEmployeeFullName(order.employeeName || 'Unknown Employee');
                return;
            }

            try {
                const employeeDoc = await db.collection('users').doc(order.employeeId).get();
                if (employeeDoc.exists) {
                    const data = employeeDoc.data();
                    console.log('✅ Employee data found:', { firstName: data?.firstName, lastName: data?.lastName });
                    const fullName = `${data?.firstName || ''} ${data?.lastName || ''}`.trim();
                    setEmployeeFullName(fullName || order.employeeName || 'Unknown Employee');
                } else {
                    console.log('❌ Employee document not found for ID:', order.employeeId);
                    setEmployeeFullName(order.employeeName || 'Unknown Employee');
                }
            } catch (error) {
                console.error('❌ Error fetching employee data:', error);
                setEmployeeFullName(order.employeeName || 'Unknown Employee');
            }
        };

        fetchEmployeeData();
    }, [isOpen, order.employeeId, order.employeeName]);

    // Fetch topping prices from Firestore
    useEffect(() => {
        if (!isOpen) return;

        const fetchToppingPrices = async () => {
            try {
                const toppingsSnapshot = await db.collection('ingredients')
                    .where('isTopping', '==', true)
                    .get();

                const pricesMap = new Map<string, number>();
                toppingsSnapshot.forEach(doc => {
                    const data = doc.data();
                    pricesMap.set(data.name, data.toppingPrice || 0);
                });

                setToppingPrices(pricesMap);
            } catch (error) {
                console.error('Error fetching topping prices:', error);
            }
        };

        fetchToppingPrices();
    }, [isOpen]);

    // Prevent background scroll when modal is open
    useEffect(() => {
        // Store current overflow style
        const originalStyle = window.getComputedStyle(document.body).overflow;
        let originalMainStyle = '';
        const mainContent = document.getElementById('admin-main-content');
        const employeeContent = document.getElementById('employee-main-content');

        if (isOpen) {
            // Lock scroll on body
            document.body.style.overflow = 'hidden';

            // Lock scroll on admin main content
            if (mainContent) {
                mainContent.style.overflow = 'hidden';
            }
            // Lock scroll on employee main content
            if (employeeContent) {
                employeeContent.style.overflow = 'hidden';
            }
        } else {
            document.body.style.overflow = '';
            if (mainContent) {
                mainContent.style.overflow = '';
            }
            if (employeeContent) {
                employeeContent.style.overflow = '';
            }
        }

        return () => {
            document.body.style.overflow = '';
            if (mainContent) {
                mainContent.style.overflow = '';
            }
            if (employeeContent) {
                employeeContent.style.overflow = '';
            }
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const formatTime = (timestamp: Date | { toDate: () => Date } | string | number | null | undefined) => {
        if (!timestamp) return '';
        // Handle Firestore Timestamp or standard Date object
        let date: Date;
        if (typeof timestamp === 'object' && timestamp !== null && 'toDate' in timestamp) {
            date = (timestamp as { toDate: () => Date }).toDate();
        } else {
            date = new Date(timestamp as string | number | Date);
        }
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

    return typeof document !== 'undefined' ? createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="p-6 border-b bg-gradient-to-r from-primary-600 to-primary-800 text-white">
                    <div className="flex items-start justify-between">
                        <div>
                            <h2 className="text-2xl font-bold mb-2">{order.orderNumber}</h2>
                            <div className="flex items-center gap-3 text-primary-100">
                                <div className="flex items-center gap-1.5">
                                    <Clock className="h-4 w-4" />
                                    <span className="text-sm">{formatTime(order.timestamp)}</span>
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
                            <Package className="h-5 w-5 text-primary-600" />
                            Order Items
                        </h3>
                        <div className="space-y-2">
                            {(order.orderItems || []).map((item: OrderItem, idx: number) => {
                                // Calculate topping prices
                                let toppingTotal = 0;
                                if (item.customizations?.toppings) {
                                    item.customizations.toppings.forEach((topping: string) => {
                                        const price = toppingPrices.get(topping);
                                        if (price) toppingTotal += price;
                                    });
                                }

                                const basePrice = item.price - toppingTotal;

                                return (
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
                                                        <div>• Toppings: {item.customizations.toppings.map((topping: string, i: number) => {
                                                            const price = toppingPrices.get(topping);
                                                            return (
                                                                <span key={i}>
                                                                    {topping}
                                                                    {price && ` (+₱${price})`}
                                                                    {i < item.customizations.toppings.length - 1 ? ', ' : ''}
                                                                </span>
                                                            );
                                                        })}</div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                        <div className="text-right min-w-[100px]">
                                            <div className="text-xs text-gray-500 space-y-0.5">
                                                <div>Qty: {item.quantity}</div>
                                                <div>Base: ₱{basePrice.toFixed(2)}</div>
                                                {toppingTotal > 0 && (
                                                    <div>Toppings: +₱{toppingTotal.toFixed(2)}</div>
                                                )}
                                            </div>
                                            <div className="font-bold text-gray-900 mt-1 pt-1 border-t border-gray-300">
                                                ₱{(item.price * item.quantity).toFixed(2)}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Total Breakdown */}
                        <div className="mt-4 p-4 bg-primary-50 rounded-lg border-2 border-primary-200 space-y-2">
                            {(() => {
                                const itemsTotal = (order.orderItems || []).reduce((sum, item) => sum + (item.price * item.quantity), 0);
                                const additionalFees = order.subtotal - itemsTotal;

                                return (
                                    <>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-gray-600">Items Total:</span>
                                            <span className="font-medium text-gray-900">₱{itemsTotal.toFixed(2)}</span>
                                        </div>
                                        {additionalFees > 0 && (
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-gray-600">Additional Fees:</span>
                                                <span className="font-medium text-gray-900">₱{additionalFees.toFixed(2)}</span>
                                            </div>
                                        )}
                                        <div className="pt-2 border-t border-primary-300 flex justify-between items-center">
                                            <span className="font-bold text-gray-900 text-lg">Total</span>
                                            <span className="font-bold text-primary-700 text-2xl">₱{order.subtotal.toFixed(2)}</span>
                                        </div>
                                    </>
                                );
                            })()}
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
                                {order.paymentMethod === 'cash' && order.paymentDetails?.amountReceived && (
                                    <>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Received:</span>
                                            <span className="font-medium">₱{order.paymentDetails.amountReceived.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Change:</span>
                                            <span className="font-medium">₱{(order.paymentDetails.amountReceived - (order.subtotal || 0)).toFixed(2)}</span>
                                        </div>
                                    </>
                                )}
                                {order.paymentMethod === 'gcash' && (
                                    <>
                                        {order.paymentAccountName && (
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Account Name:</span>
                                                <span className="font-medium">{order.paymentAccountName}</span>
                                            </div>
                                        )}
                                        {(order.paymentDetails?.referenceNumber || order.paymentReference) && (
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Ref No:</span>
                                                <span className="font-medium">{order.paymentDetails?.referenceNumber || order.paymentReference}</span>
                                            </div>
                                        )}
                                    </>
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
                                <div className="font-medium text-gray-900">{employeeFullName || order.employeeName}</div>
                                {order.customerName && (
                                    <div className="text-gray-600 mt-1">
                                        Customer: {order.customerName}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Receipt Image */}
                {order.receiptUrl && (
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-center gap-2 text-gray-600 mb-3">
                            <FileText className="h-4 w-4" />
                            <span className="font-semibold">Payment Receipt</span>
                        </div>
                        <div className="relative w-full overflow-hidden rounded-lg bg-white border border-gray-200">
                            <img
                                src={order.receiptUrl}
                                alt="Payment Receipt"
                                className="w-full h-auto object-contain max-h-[300px]"
                            />
                        </div>
                        <div className="mt-3 text-center">
                            <a
                                href={order.receiptUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-primary-600 hover:text-primary-700 hover:underline font-medium inline-flex items-center gap-1"
                            >
                                View Full Size
                            </a>
                        </div>
                    </div>
                )}
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
        </div>,
        document.body
    ) : null;
};

export default OrderDetailsModal;
