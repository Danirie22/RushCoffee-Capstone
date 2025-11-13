
import React from 'react';
import Card from '../../../components/ui/Card';

interface OrderSummaryWidgetProps {
  items: Array<{
    productName: string;
    quantity: number;
    price: number;
  }>;
  subtotal: number;
  serviceFee?: number;
  total: number;
}

const OrderSummaryWidget: React.FC<OrderSummaryWidgetProps> = ({
  items,
  subtotal,
  serviceFee = 0,
  total,
}) => {
  return (
    <div className="w-full lg:sticky lg:top-24">
        <Card className="rounded-xl border-gray-200 p-6 shadow-none">
            <h2 className="mb-4 font-display text-lg font-semibold text-coffee-900">
                Order Summary
            </h2>
            
            {/* Items List */}
            <div className="max-h-60 space-y-2 overflow-y-auto pr-2">
                {items.map((item, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                        <div className="flex items-center">
                            <span className="text-gray-700">{item.productName}</span>
                             <span className="ml-2 rounded-md bg-gray-100 px-1.5 py-0.5 text-xs font-medium text-gray-600">
                                &times;{item.quantity}
                            </span>
                        </div>
                        <span className="font-medium text-gray-900">
                            ₱{(item.price * item.quantity).toFixed(2)}
                        </span>
                    </div>
                ))}
            </div>

            <hr className="my-4 border-gray-200" />

            {/* Breakdown Section */}
            <div className="space-y-2">
                <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium text-gray-900">₱{subtotal.toFixed(2)}</span>
                </div>
                {serviceFee > 0 && (
                     <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Service Fee</span>
                        <span className="font-medium text-gray-900">₱{serviceFee.toFixed(2)}</span>
                    </div>
                )}
            </div>

            <hr className="my-4 border-dashed border-gray-300" />
            
            {/* Total */}
            <div className="flex items-center justify-between">
                <span className="text-base font-bold text-gray-900">Total</span>
                <span className="font-display text-2xl font-bold text-primary-600">
                   ₱{total.toFixed(2)}
                </span>
            </div>
        </Card>
    </div>
  );
};

export default OrderSummaryWidget;
