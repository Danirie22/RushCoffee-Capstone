import * as React from 'react';
import Card from '../ui/Card';

interface OrderSummaryWidgetProps {
    items: Array<{
        productName: string;
        quantity: number;
        price: number;
        imageUrl?: string;
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
                <div className="max-h-80 space-y-3 overflow-y-auto pr-2">
                    {items.map((item, index) => (
                        <div key={index} className="flex items-center gap-3 rounded-lg bg-gray-50 p-2">
                            {/* Product Image */}
                            {item.imageUrl && (
                                <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-white border border-gray-200">
                                    <img
                                        src={item.imageUrl}
                                        alt={item.productName}
                                        className="h-full w-full object-cover"
                                    />
                                </div>
                            )}
                            {/* Product Info */}
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">{item.productName}</p>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <span className="text-xs font-medium text-gray-500">×{item.quantity}</span>
                                    <span className="text-sm font-bold text-coffee-700">
                                        ₱{(item.price * item.quantity).toFixed(2)}
                                    </span>
                                </div>
                            </div>
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