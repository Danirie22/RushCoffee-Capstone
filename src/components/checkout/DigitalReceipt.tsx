import React from 'react';
import { createPortal } from 'react-dom';
import { X, Printer } from 'lucide-react';
import { QueueItem } from '../../context/OrderContext';
import RushCoffeeLogo from '../layout/RushCoffeeLogo';
import Button from '../ui/Button';

interface DigitalReceiptProps {
    order: QueueItem;
    isOpen: boolean;
    onClose: () => void;
}

const DigitalReceipt: React.FC<DigitalReceiptProps> = ({ order, isOpen, onClose }) => {
    // Lock body scroll when modal is open
    React.useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const handlePrint = () => {
        window.print();
    };

    return createPortal(
        <>
            {/* Overlay & Modal Container */}
            <div
                className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 print:p-0 print:absolute print:inset-0 print:block print:bg-white"
                onClick={onClose}
            >
                {/* Modal Card */}
                <div
                    className="flex flex-col w-full max-w-md max-h-[90vh] overflow-hidden rounded-3xl bg-white shadow-2xl print:max-w-none print:shadow-none print:rounded-none print:max-h-none print:overflow-visible animate-fade-in-up"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header Actions (Fixed at top) */}
                    <div className="flex items-center justify-between border-b border-gray-100 p-4 print:hidden flex-shrink-0 bg-white z-10">
                        <h3 className="font-display text-lg font-bold text-gray-900">Digital Receipt</h3>
                        <button
                            onClick={onClose}
                            className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto p-8 print:p-0 print:overflow-visible" id="receipt-content">
                        {/* Receipt Header */}
                        <div className="mb-8 text-center">
                            <RushCoffeeLogo className="mx-auto h-16 w-16 text-primary-600 mb-4" />
                            <h1 className="font-display text-2xl font-bold text-coffee-900">Rush Coffee</h1>
                            <p className="text-sm text-gray-500">11 Visayan Ave. St. Galas, Quezon City</p>
                            <p className="text-sm text-gray-500">0930 464 1022</p>
                        </div>

                        {/* Order Info */}
                        <div className="mb-8 flex items-center justify-between border-b border-dashed border-gray-300 pb-6">
                            <div className="text-left">
                                <p className="text-xs text-gray-500 uppercase tracking-wider">Order No.</p>
                                <p className="font-mono text-lg font-bold text-gray-900">{order.orderNumber}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-gray-500 uppercase tracking-wider">Date</p>
                                <p className="font-medium text-gray-900">
                                    {new Date(order.timestamp).toLocaleDateString()}
                                </p>
                                <p className="text-xs text-gray-500">
                                    {new Date(order.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                        </div>

                        {/* Customer Info */}
                        <div className="mb-6">
                            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Customer</p>
                            <p className="font-medium text-gray-900">{order.customerName}</p>
                        </div>

                        {/* Items */}
                        <div className="mb-6">
                            <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">Order Details</p>
                            <ul className="space-y-3">
                                {order.orderItems.map((item, index) => (
                                    <li key={index} className="flex justify-between text-sm">
                                        <div className="flex-1">
                                            <span className="font-medium text-gray-900">{item.quantity}x {item.productName}</span>
                                            {item.customizations && (
                                                <div className="text-xs text-gray-500 pl-4 mt-0.5">
                                                    {item.customizations.sugarLevel && <span>Sugar: {item.customizations.sugarLevel}, </span>}
                                                    {item.customizations.iceLevel && <span>Ice: {item.customizations.iceLevel}</span>}
                                                </div>
                                            )}
                                        </div>
                                        <span className="font-medium text-gray-900">₱{(item.price * item.quantity).toFixed(2)}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Totals */}
                        <div className="border-t border-dashed border-gray-300 pt-4 space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Subtotal</span>
                                <span className="font-medium text-gray-900">₱{(order.totalAmount - 15).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Service Fee</span>
                                <span className="font-medium text-gray-900">₱15.00</span>
                            </div>
                            <div className="flex justify-between text-lg font-bold text-coffee-900 pt-2 border-t border-gray-100 mt-2">
                                <span>Total</span>
                                <span>₱{order.totalAmount.toFixed(2)}</span>
                            </div>
                        </div>

                        {/* Payment Info */}
                        <div className="mt-6 rounded-lg bg-gray-50 p-4 text-center print:bg-transparent print:border print:border-gray-200">
                            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Payment Method</p>
                            <div className="flex items-center justify-center gap-2">
                                <span className={`inline-block h-2 w-2 rounded-full ${order.paymentStatus === 'paid' ? 'bg-green-500' : 'bg-amber-500'}`}></span>
                                <span className="font-bold text-gray-900 uppercase">{order.paymentMethod}</span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                                Status: <span className={order.paymentStatus === 'paid' ? 'text-green-600 font-medium' : 'text-amber-600 font-medium'}>
                                    {order.paymentStatus === 'paid' ? 'PAID' : 'PENDING'}
                                </span>
                            </p>
                        </div>

                        {/* Footer */}
                        <div className="mt-8 text-center border-t border-gray-100 pt-6">
                            <p className="font-display text-lg font-bold text-coffee-900 mb-1">Thank You!</p>
                            <p className="text-xs text-gray-500">Please present this receipt at the counter.</p>
                            <p className="text-[10px] text-gray-400 mt-4 font-mono">{order.id}</p>
                        </div>
                    </div>

                    {/* Footer Actions (Fixed at bottom) */}
                    <div className="border-t border-gray-100 p-4 bg-gray-50 print:hidden flex-shrink-0 z-10">
                        <Button
                            onClick={handlePrint}
                            fullWidth
                            className="flex items-center justify-center gap-2"
                        >
                            <Printer className="h-4 w-4" />
                            Print Receipt
                        </Button>
                    </div>
                </div>
            </div>

            {/* Print Styles */}
            <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #receipt-content, #receipt-content * {
            visibility: visible;
          }
          #receipt-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 20px;
          }
        }
      `}</style>
        </>,
        document.body
    );
};

export default DigitalReceipt;
