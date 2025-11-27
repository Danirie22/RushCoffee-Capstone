import * as React from 'react';
import { AlertCircle } from 'lucide-react';
import gcashQr from '../../assets/gcash-qr.jpg';

interface GCashPaymentProps {
  totalAmount: number;
  orderNumber: string;
  referenceNumber: string;
  onReferenceNumberChange: (value: string) => void;
  accountName: string;
  onAccountNameChange: (value: string) => void;
}

const GCashPayment: React.FC<GCashPaymentProps> = ({
  totalAmount,
  referenceNumber,
  onReferenceNumberChange,
  accountName,
  onAccountNameChange,
}) => {
  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      <div className="rounded-lg border-l-4 border-blue-400 bg-blue-50 p-4" role="alert">
        <div className="flex">
          <div className="flex-shrink-0">
            <AlertCircle className="h-5 w-5 text-blue-400" aria-hidden="true" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-blue-700">
              Please scan the QR code, complete the payment, and enter the reference number below.
            </p>
          </div>
        </div>
      </div>

      {/* QR Code Section */}
      <div className="text-center">
        <div className="mx-auto flex h-64 w-64 items-center justify-center rounded-xl border-4 border-primary-600 bg-white p-2 shadow-lg overflow-hidden">
          <img src={gcashQr} alt="GCash QR Code" className="h-full w-full object-contain" />
        </div>
        <p className="mt-4 text-sm font-medium text-gray-600">Merchant: <span className="font-bold text-coffee-900">Rush Coffee</span></p>
        <p className="font-display text-3xl font-bold text-primary-600">₱{totalAmount.toFixed(2)}</p>
      </div>

      {/* Account Name Input */}
      <div>
        <label htmlFor="account-name" className="block text-sm font-medium text-gray-700">
          GCash Account Name
        </label>
        <div className="mt-1">
          <input
            type="text"
            id="account-name"
            name="account-name"
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm p-2 border"
            placeholder="e.g. Juan dela Cruz"
            value={accountName}
            onChange={(e) => onAccountNameChange(e.target.value)}
          />
        </div>
      </div>

      {/* Reference Number Input */}
      <div>
        <label htmlFor="reference-number" className="block text-sm font-medium text-gray-700">
          GCash Reference Number
        </label>
        <div className="mt-1">
          <input
            type="text"
            id="reference-number"
            name="reference-number"
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm p-2 border"
            placeholder="e.g. 1234 5678 9012"
            value={referenceNumber}
            onChange={(e) => onReferenceNumberChange(e.target.value)}
          />
        </div>
        <p className="mt-1 text-xs text-gray-500">
          Please enter the reference number from your GCash SMS or receipt.
        </p>
      </div>
    </div>
  );
};

export default GCashPayment;