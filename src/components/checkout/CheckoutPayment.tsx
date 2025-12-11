import React from 'react';
import { AlertCircle } from 'lucide-react';
import PaymentMethodSelector from './PaymentMethodSelector';
import GCashPayment from './GCashPayment';

interface CheckoutPaymentProps {
    selectedPaymentMethod: 'gcash' | 'cash' | null;
    setSelectedPaymentMethod: (method: 'gcash' | 'cash') => void;
    totalAmount: number;
    paymentReference: string;
    setPaymentReference: (ref: string) => void;
    accountName: string;
    setAccountName: (name: string) => void;
    errors: { payment?: string; gcash?: string; accountName?: string; reference?: string };
}

const CheckoutPayment: React.FC<CheckoutPaymentProps> = ({
    selectedPaymentMethod,
    setSelectedPaymentMethod,
    totalAmount,
    paymentReference,
    setPaymentReference,
    accountName,
    setAccountName,
    errors
}) => {
    return (
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
            <PaymentMethodSelector
                selectedMethod={selectedPaymentMethod}
                onSelectMethod={setSelectedPaymentMethod}
                totalAmount={totalAmount}
            />
            {errors.payment && <p className="mt-2 text-xs text-red-500">{errors.payment}</p>}

            {selectedPaymentMethod === 'gcash' && (
                <div className="mt-6 border-t pt-6">
                    <GCashPayment
                        totalAmount={totalAmount}
                        orderNumber={`RC-${Date.now()}`}
                        referenceNumber={paymentReference}
                        onReferenceNumberChange={setPaymentReference}
                        accountName={accountName}
                        onAccountNameChange={setAccountName}
                    />
                    {errors.gcash && <p className="mt-2 text-xs text-red-500 text-center">{errors.gcash}</p>}
                    {errors.accountName && <p className="mt-2 text-xs text-red-500 text-center">{errors.accountName}</p>}
                    {errors.reference && <p className="mt-2 text-xs text-red-500 text-center">{errors.reference}</p>}
                </div>
            )}

            {selectedPaymentMethod === 'cash' && (
                <div className="mt-6 rounded-lg border-l-4 border-green-400 bg-green-50 p-4" role="alert">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <AlertCircle className="h-5 w-5 text-green-400" />
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-green-700">Please prepare the exact amount. You can pay at the counter upon pickup.</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CheckoutPayment;
