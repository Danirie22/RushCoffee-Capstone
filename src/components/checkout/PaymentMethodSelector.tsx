import * as React from 'react';
import { Wallet, Banknote, Check } from 'lucide-react';
import Badge from '../ui/Badge';

interface PaymentMethodSelectorProps {
  selectedMethod: 'gcash' | 'cash' | null;
  onSelectMethod: (method: 'gcash' | 'cash') => void;
  totalAmount: number;
}

const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  selectedMethod,
  onSelectMethod,
  totalAmount,
}) => {
  const gcashSelected = selectedMethod === 'gcash';
  const cashSelected = selectedMethod === 'cash';
  const isCashDisabled = totalAmount > 200;

  // A small helper component for the radio/check indicator to keep the code DRY
  const RadioIndicator = ({ isSelected }: { isSelected: boolean }) => (
    <div className={`absolute top-4 right-4 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border-2 transition-all ${isSelected ? 'border-primary-600 bg-primary-600' : 'border-gray-400 bg-white'}`}>
      {isSelected && <Check className="h-4 w-4 text-white" />}
    </div>
  );

  return (
    <div className="w-full">
      <h2 className="mb-4 font-display text-xl font-bold text-coffee-900">
        Payment Method
      </h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2" role="radiogroup">
        {/* GCash Option */}
        <div
          onClick={() => onSelectMethod('gcash')}
          role="radio"
          aria-checked={gcashSelected}
          tabIndex={0}
          onKeyDown={(e) => (e.key === ' ' || e.key === 'Enter') && onSelectMethod('gcash')}
          className={`relative cursor-pointer rounded-xl border-2 p-6 transition-all duration-200 ease-in-out hover:border-primary-300 ${gcashSelected
            ? 'border-primary-600 bg-primary-50 shadow-lg'
            : 'border-gray-200 bg-white'
            }`}
        >
          <div className="flex gap-4">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-blue-100">
              <Wallet className="h-7 w-7 text-blue-600" />
            </div>
            <div>
              <h3 className="pr-8 font-display text-lg font-bold text-coffee-900">GCash</h3>
              <p className="mt-1 text-sm text-gray-600">Pay securely via GCash QR code.</p>
            </div>
          </div>
          <div className="mt-4">
            <Badge className={gcashSelected ? 'bg-blue-200 text-blue-800' : 'bg-gray-100 text-gray-700'}>
              Instant confirmation
            </Badge>
          </div>
          <RadioIndicator isSelected={gcashSelected} />
        </div>

        {/* Cash Option */}
        <div
          onClick={() => !isCashDisabled && onSelectMethod('cash')}
          role="radio"
          aria-checked={cashSelected}
          aria-disabled={isCashDisabled}
          tabIndex={isCashDisabled ? -1 : 0}
          onKeyDown={(e) => !isCashDisabled && (e.key === ' ' || e.key === 'Enter') && onSelectMethod('cash')}
          className={`relative rounded-xl border-2 p-6 transition-all duration-200 ease-in-out ${isCashDisabled
              ? 'cursor-not-allowed border-gray-100 bg-gray-50 opacity-60'
              : `cursor-pointer hover:border-primary-300 ${cashSelected ? 'border-primary-600 bg-primary-50 shadow-lg' : 'border-gray-200 bg-white'}`
            }`}
        >
          <div className="flex gap-4">
            <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg ${isCashDisabled ? 'bg-gray-200' : 'bg-green-100'}`}>
              <Banknote className={`h-7 w-7 ${isCashDisabled ? 'text-gray-400' : 'text-green-600'}`} />
            </div>
            <div>
              <h3 className={`pr-8 font-display text-lg font-bold ${isCashDisabled ? 'text-gray-500' : 'text-coffee-900'}`}>Over the counter payment</h3>
              <p className="mt-1 text-sm text-gray-600">Pay when you collect your order.</p>
              {isCashDisabled && (
                <p className="mt-2 text-xs font-medium text-red-500">
                  Not available for orders over ₱200
                </p>
              )}
            </div>
          </div>
          <div className="mt-4">
            <Badge className={isCashDisabled ? 'bg-gray-200 text-gray-500' : (cashSelected ? 'bg-green-200 text-green-800' : 'bg-gray-100 text-gray-700')}>
              Pay at counter
            </Badge>
          </div>
          {!isCashDisabled && <RadioIndicator isSelected={cashSelected} />}
        </div>
      </div>
    </div>
  );
};

export default PaymentMethodSelector;