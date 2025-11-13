import React from 'react';
import { Copy } from 'lucide-react';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import { useCart } from '../../context/CartContext';
import { Wallet, Banknote, Check, Clock } from 'lucide-react';

interface OrderSummaryProps {
  orderNumber: string;
  orderItems: Array<{
    productName: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  paymentMethod: 'gcash' | 'cash';
  paymentStatus: 'pending' | 'paid';
  timestamp: Date;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({
  orderNumber,
  orderItems,
  totalAmount,
  paymentMethod,
  paymentStatus,
  timestamp,
}) => {
  const { showToast } = useCart();

  const handleCopy = () => {
    navigator.clipboard.writeText(orderNumber);
    if (showToast) {
        showToast('Order number copied!');
    }
  };

  const formattedTimestamp = timestamp.toLocaleString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  return (
    <Card className="w-full max-w-lg rounded-xl border-gray-200 bg-white p-6 shadow-md">
      <div className="flex flex-col space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="font-mono text-lg font-semibold text-gray-800">
              Order #{orderNumber}
            </h2>
            <p className="text-sm text-gray-500">{formattedTimestamp}</p>
          </div>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-200"
            aria-label="Copy order number"
          >
            <Copy className="h-3.5 w-3.5" />
            Copy
          </button>
        </div>

        {/* Items List */}
        <ul className="space-y-2 border-t border-gray-200 pt-4">
          {orderItems.map((item, index) => (
            <li key={index} className="flex items-center justify-between border-b border-gray-100 py-2 last:border-b-0">
              <div>
                <p className="font-medium text-gray-800">{item.productName}</p>
                <p className="text-sm text-gray-500">
                  {item.quantity} &times; ₱{item.price.toFixed(2)}
                </p>
              </div>
              <p className="font-semibold text-gray-900">
                ₱{(item.quantity * item.price).toFixed(2)}
              </p>
            </li>
          ))}
        </ul>
        
        {/* Payment Info */}
        <div className="flex items-center justify-between border-t border-gray-200 pt-4">
          {paymentMethod === 'gcash' ? (
            <Badge className="bg-blue-100 text-blue-800">
              <Wallet className="mr-1.5 h-4 w-4" />
              GCash
            </Badge>
          ) : (
            <Badge className="bg-green-100 text-green-800">
              <Banknote className="mr-1.5 h-4 w-4" />
              Cash
            </Badge>
          )}

          {paymentStatus === 'paid' ? (
            <div className="flex items-center gap-2 text-sm font-medium text-green-600">
              <Check className="h-5 w-5" />
              <span>Paid</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm font-medium text-orange-600">
              <Clock className="h-5 w-5" />
              <span>Pending Payment</span>
            </div>
          )}
        </div>

        {/* Footer with Total */}
        <div className="flex items-center justify-between border-t border-gray-200 pt-4">
          <p className="text-lg font-semibold text-gray-900">Total</p>
          <p className="font-display text-2xl font-bold text-primary-600">
            ₱{totalAmount.toFixed(2)}
          </p>
        </div>
      </div>
    </Card>
  );
};

export default OrderSummary;
