
import React from 'react';
import { Wallet, Banknote, Check } from 'lucide-react';
import Badge from '../../../components/ui/Badge';

interface PaymentMethodSelectorProps {
  selectedMethod: 'gcash' | 'cash' | null;
  onSelectMethod: (method: 'gcash' | 'cash') => void;
}

const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  selectedMethod,
  onSelectMethod,
}) => {
  const gcashSelected = selectedMethod === 'gcash';
  const cashSelected = selectedMethod === 'cash';

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
          className={`relative cursor-pointer rounded-xl border-2 p-6 transition-all duration-200 ease-in-out hover:border-primary-300 ${
            gcashSelected
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
          onClick={() => onSelectMethod('cash')}
          role="radio"
          aria-checked={cashSelected}
          tabIndex={0}
          onKeyDown={(e) => (e.key === ' ' || e.key === 'Enter') && onSelectMethod('cash')}
          className={`relative cursor-pointer rounded-xl border-2 p-6 transition-all duration-200 ease-in-out hover:border-primary-300 ${
            cashSelected
              ? 'border-primary-600 bg-primary-50 shadow-lg'
              : 'border-gray-200 bg-white'
          }`}
        >
          <div className="flex gap-4">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-green-100">
              <Banknote className="h-7 w-7 text-green-600" />
            </div>
            <div>
              <h3 className="pr-8 font-display text-lg font-bold text-coffee-900">Cash on Pickup</h3>
              <p className="mt-1 text-sm text-gray-600">Pay when you collect your order.</p>
            </div>
          </div>
          <div className="mt-4">
            <Badge className={cashSelected ? 'bg-green-200 text-green-800' : 'bg-gray-100 text-gray-700'}>
              Pay at counter
            </Badge>
          </div>
          <RadioIndicator isSelected={cashSelected} />
        </div>
      </div>
    </div>
  );
};

export default PaymentMethodSelector;
