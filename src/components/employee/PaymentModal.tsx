import React, { useState, useEffect } from 'react';
import { X, Banknote, CreditCard, ArrowRight, CheckCircle2, Calculator } from 'lucide-react';

import { PaymentDetails } from '../../types';

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    totalAmount: number;
    onPaymentComplete: (paymentDetails: PaymentDetails) => void;
}

type PaymentMethod = 'cash' | 'gcash';

const PaymentModal: React.FC<PaymentModalProps> = ({
    isOpen,
    onClose,
    totalAmount,
    onPaymentComplete
}) => {
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
    const [amountReceived, setAmountReceived] = useState<string>('');
    const [referenceNumber, setReferenceNumber] = useState('');
    const [change, setChange] = useState(0);

    // Reset state when modal opens
    useEffect(() => {
        if (isOpen) {
            setPaymentMethod('cash');
            setAmountReceived('');
            setReferenceNumber('');
            setChange(0);
        }
    }, [isOpen]);

    // Calculate change whenever amount received changes
    useEffect(() => {
        const received = parseFloat(amountReceived) || 0;
        setChange(Math.max(0, received - totalAmount));
    }, [amountReceived, totalAmount]);

    if (!isOpen) return null;

    const handleQuickCash = (amount: number) => {
        setAmountReceived(amount.toString());
    };

    const handleExactAmount = () => {
        setAmountReceived(totalAmount.toString());
    };

    const handleSubmit = () => {
        const received = parseFloat(amountReceived) || 0;

        if (paymentMethod === 'cash' && received < totalAmount) {
            alert('Insufficient amount received');
            return;
        }

        if (paymentMethod === 'gcash' && !referenceNumber) {
            alert('Please enter reference number');
            return;
        }

        onPaymentComplete({
            method: paymentMethod,
            amount: totalAmount,
            amountReceived: paymentMethod === 'cash' ? received : totalAmount,
            change: paymentMethod === 'cash' ? change : 0,
            referenceNumber: paymentMethod === 'gcash' ? referenceNumber : undefined
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center animate-in fade-in duration-200">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative z-10 w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="bg-primary-900 text-white p-6 flex items-center justify-between shrink-0">
                    <div>
                        <h2 className="text-2xl font-bold">Payment</h2>
                        <p className="text-primary-200 text-sm">Select payment method</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 bg-gray-50">

                    {/* Total Amount Display */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6 text-center">
                        <p className="text-gray-500 font-medium mb-1">Total Amount Due</p>
                        <p className="text-5xl font-bold text-primary-700">₱{totalAmount.toFixed(2)}</p>
                    </div>

                    {/* Payment Method Tabs */}
                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <button
                            onClick={() => setPaymentMethod('cash')}
                            className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${paymentMethod === 'cash'
                                ? 'border-primary-600 bg-primary-50 text-primary-700 shadow-md'
                                : 'border-gray-200 bg-white text-gray-500 hover:border-primary-200 hover:bg-gray-50'
                                }`}
                        >
                            <Banknote className="h-8 w-8" />
                            <span className="font-bold">Cash Payment</span>
                        </button>
                        <button
                            onClick={() => setPaymentMethod('gcash')}
                            className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${paymentMethod === 'gcash'
                                ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-md'
                                : 'border-gray-200 bg-white text-gray-500 hover:border-blue-200 hover:bg-gray-50'
                                }`}
                        >
                            <CreditCard className="h-8 w-8" />
                            <span className="font-bold">GCash / E-Wallet</span>
                        </button>
                    </div>

                    {/* Cash Payment Interface */}
                    {paymentMethod === 'cash' && (
                        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-300">
                            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                                <label className="block text-sm font-bold text-gray-700 mb-2">Amount Received</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xl">₱</span>
                                    <input
                                        type="number"
                                        value={amountReceived}
                                        onChange={(e) => setAmountReceived(e.target.value)}
                                        className="w-full pl-10 pr-4 py-4 text-3xl font-bold text-gray-900 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                                        placeholder="0.00"
                                        autoFocus
                                    />
                                </div>

                                {/* Quick Cash Buttons */}
                                <div className="grid grid-cols-4 gap-2 mt-4">
                                    <button
                                        onClick={handleExactAmount}
                                        className="py-2 px-1 rounded-lg bg-primary-100 text-primary-700 font-bold text-sm hover:bg-primary-200 transition-colors"
                                    >
                                        Exact
                                    </button>
                                    {[100, 200, 500, 1000].map(amount => (
                                        <button
                                            key={amount}
                                            onClick={() => handleQuickCash(amount)}
                                            className="py-2 px-1 rounded-lg bg-gray-100 text-gray-700 font-bold text-sm hover:bg-gray-200 transition-colors"
                                        >
                                            ₱{amount}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Change Display */}
                            <div className={`rounded-2xl p-6 border transition-all duration-300 ${change > 0
                                ? 'bg-green-50 border-green-200'
                                : 'bg-gray-50 border-gray-200 opacity-50'
                                }`}>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={`h-10 w-10 rounded-full flex items-center justify-center ${change > 0 ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-400'
                                            }`}>
                                            <Calculator className="h-5 w-5" />
                                        </div>
                                        <span className={`font-bold text-lg ${change > 0 ? 'text-green-800' : 'text-gray-500'}`}>
                                            Change Due
                                        </span>
                                    </div>
                                    <span className={`text-3xl font-bold ${change > 0 ? 'text-green-700' : 'text-gray-400'}`}>
                                        ₱{change.toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* GCash Payment Interface */}
                    {paymentMethod === 'gcash' && (
                        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-300">
                            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm flex flex-col items-center text-center">
                                <div className="h-48 w-48 bg-gray-100 rounded-xl mb-4 flex items-center justify-center border-2 border-dashed border-gray-300">
                                    <p className="text-gray-400 font-medium">QR Code Here</p>
                                </div>
                                <p className="text-sm text-gray-500 mb-6">Scan this QR code to pay via GCash</p>

                                <div className="w-full text-left">
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Reference Number</label>
                                    <input
                                        type="text"
                                        value={referenceNumber}
                                        onChange={(e) => setReferenceNumber(e.target.value)}
                                        className="w-full px-4 py-3 text-lg font-medium text-gray-900 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                        placeholder="Enter last 4 digits"
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 bg-white border-t border-gray-100 shrink-0">
                    <button
                        onClick={handleSubmit}
                        disabled={paymentMethod === 'cash' ? parseFloat(amountReceived || '0') < totalAmount : !referenceNumber}
                        className="w-full py-4 bg-gradient-to-r from-primary-600 to-primary-800 hover:from-primary-700 hover:to-primary-900 text-white font-bold text-xl rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 transition-all flex items-center justify-center gap-3"
                    >
                        <CheckCircle2 className="h-6 w-6" />
                        Complete Payment
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PaymentModal;
