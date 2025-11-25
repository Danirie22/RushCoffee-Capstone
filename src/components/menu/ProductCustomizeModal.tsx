import React, { useState } from 'react';
import { X, Plus, Minus, Loader2 } from 'lucide-react';
import { Product, ProductSize } from '../../data/mockProducts';
import { Customizations } from '../../context/CartContext';
import { useToppings } from '../../hooks/useToppings';
import { useCustomizationOptions } from '../../hooks/useCustomizationOptions';

interface ProductCustomizeModalProps {
    product: Product;
    selectedSize: ProductSize;
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (customizations: Customizations, quantity: number, totalPrice?: number) => void;
    onBuyNow?: (customizations: Customizations, quantity: number) => void;
    initialCustomizations?: Customizations;
    initialQuantity?: number;
}

const ProductCustomizeModal: React.FC<ProductCustomizeModalProps> = ({
    product,
    selectedSize,
    isOpen,
    onClose,
    onConfirm,
    onBuyNow,
    initialCustomizations,
    initialQuantity = 1,
}) => {
    const [sugarLevel, setSugarLevel] = useState('100%');
    const [iceLevel, setIceLevel] = useState('Normal');
    const [selectedTopping, setSelectedTopping] = useState('None');
    const [quantity, setQuantity] = useState(1);

    // Fetch dynamic data from Firestore
    const { toppings, isLoading: toppingsLoading } = useToppings();
    const { options, isLoading: optionsLoading } = useCustomizationOptions();

    // Reset or Initialize state when modal opens
    React.useEffect(() => {
        if (isOpen) {
            if (initialCustomizations) {
                setSugarLevel(initialCustomizations.sugarLevel || '100%');
                setIceLevel(initialCustomizations.iceLevel || 'Normal');
                // Handle toppings array to single selection mapping
                const toppingName = initialCustomizations.toppings && initialCustomizations.toppings.length > 0
                    ? initialCustomizations.toppings[0]
                    : 'None';
                setSelectedTopping(toppingName);
            } else {
                // Reset to defaults if no initial customizations
                setSugarLevel('100%');
                setIceLevel('Normal');
                setSelectedTopping('None');
            }
            setQuantity(initialQuantity); // Use initialQuantity
        }
    }, [isOpen, initialCustomizations, initialQuantity]);

    if (!isOpen) return null;

    const getCustomizations = () => {
        const isBeverage = ['Coffee Based', 'Non-Coffee Based', 'Matcha Series', 'Refreshments'].includes(product.category);
        const customizations: any = {
            toppings: selectedTopping !== 'None' ? [selectedTopping] : [],
        };

        if (isBeverage) {
            customizations.sugarLevel = sugarLevel;
            customizations.iceLevel = iceLevel;
        }

        return customizations;
    };

    const handleConfirm = () => {
        onConfirm(getCustomizations(), quantity, totalPrice / quantity); // Pass unit price (total / quantity)
    };

    const handleBuyNow = () => {
        onBuyNow(getCustomizations(), quantity);
        onClose();
    };

    // Build toppings list with "None" option
    const toppingOptions = [
        { id: 'none', name: 'None', price: 0 },
        ...toppings.map(t => ({ id: t.id, name: t.name, price: t.price }))
    ];

    const selectedToppingData = toppingOptions.find((t) => t.name === selectedTopping);
    const toppingPrice = selectedToppingData?.price || 0;
    const totalPrice = (selectedSize.price + toppingPrice) * quantity;

    const isLoading = toppingsLoading || optionsLoading;

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center animate-in fade-in duration-200">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative z-10 w-full max-w-lg overflow-hidden bg-white shadow-2xl transition-all duration-300 ease-out sm:rounded-3xl rounded-t-3xl max-h-[90vh] flex flex-col animate-in slide-in-from-bottom-4 sm:slide-in-from-bottom-0 sm:zoom-in-95">

                {/* Compact Header */}
                <div className="relative shrink-0 bg-white border-b border-gray-100 p-4 flex items-center gap-4">
                    {/* Thumbnail */}
                    <div className="h-20 w-20 shrink-0 rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
                        <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="h-full w-full object-cover"
                        />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-xl text-gray-900 leading-tight mb-1">
                            {product.name}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <span className="bg-gray-100 px-2 py-0.5 rounded font-medium text-gray-700">
                                {selectedSize.name}
                            </span>
                            <span>{selectedSize.size}</span>
                        </div>
                    </div>

                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="h-9 w-9 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto px-5 py-5 pb-24 space-y-6">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-coffee-600" />
                        </div>
                    ) : (
                        <>
                            {/* Sugar Level - Only for beverages */}
                            {['Coffee Based', 'Non-Coffee Based', 'Matcha Series', 'Refreshments'].includes(product.category) && (
                                <div>
                                    <h4 className="mb-3 text-sm font-bold text-gray-900 uppercase tracking-wide flex items-center gap-2">
                                        Sugar Level
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {options.sugarLevels.map((level) => (
                                            <button
                                                key={level.value}
                                                onClick={() => setSugarLevel(level.value)}
                                                className={`flex-1 min-w-[60px] rounded-lg py-2 text-sm font-semibold transition-all border ${sugarLevel === level.value
                                                    ? 'bg-coffee-600 text-white border-coffee-600 shadow-md'
                                                    : 'bg-white text-gray-600 border-gray-200 hover:border-coffee-300 hover:bg-coffee-50'
                                                    }`}
                                            >
                                                {level.value}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Ice Level - Only for beverages */}
                            {['Coffee Based', 'Non-Coffee Based', 'Matcha Series', 'Refreshments'].includes(product.category) && (
                                <div>
                                    <h4 className="mb-3 text-sm font-bold text-gray-900 uppercase tracking-wide flex items-center gap-2">
                                        Ice Level
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {options.iceLevels.map((level) => (
                                            <button
                                                key={level.value}
                                                onClick={() => setIceLevel(level.value)}
                                                className={`flex-1 min-w-[60px] rounded-lg py-2 text-sm font-semibold transition-all border ${iceLevel === level.value
                                                    ? 'bg-coffee-600 text-white border-coffee-600 shadow-md'
                                                    : 'bg-white text-gray-600 border-gray-200 hover:border-coffee-300 hover:bg-coffee-50'
                                                    }`}
                                            >
                                                {level.value}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Toppings - Chips Layout */}
                            <div>
                                <h4 className="mb-3 text-sm font-bold text-gray-900 uppercase tracking-wide flex items-center justify-between">
                                    <span>Toppings</span>
                                    <span className="text-xs font-normal text-gray-500 normal-case">Select one</span>
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {toppingOptions.map((topping) => {
                                        const isSelected = selectedTopping === topping.name;
                                        return (
                                            <button
                                                key={topping.id}
                                                onClick={() => setSelectedTopping(topping.name)}
                                                className={`
                                                    relative px-3 py-2 rounded-lg text-sm font-medium transition-all border flex items-center gap-2
                                                    ${isSelected
                                                        ? 'bg-coffee-50 border-coffee-600 text-coffee-700 shadow-sm ring-1 ring-coffee-600'
                                                        : 'bg-white border-gray-200 text-gray-600 hover:border-coffee-300 hover:bg-gray-50'
                                                    }
                                                `}
                                            >
                                                <span>{topping.name}</span>
                                                {topping.price > 0 && (
                                                    <span className={`text-xs font-bold ${isSelected ? 'text-coffee-600' : 'text-gray-400'}`}>
                                                        +₱{topping.price}
                                                    </span>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Quantity */}
                            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                <span className="font-bold text-gray-900">Quantity</span>
                                <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-1 border border-gray-200">
                                    <button
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        className="h-8 w-8 rounded-md bg-white shadow-sm flex items-center justify-center text-gray-600 hover:text-coffee-600 disabled:opacity-50 transition-colors"
                                        disabled={quantity <= 1}
                                    >
                                        <Minus className="h-4 w-4" />
                                    </button>
                                    <span className="w-8 text-center font-bold text-gray-900 tabular-nums">{quantity}</span>
                                    <button
                                        onClick={() => setQuantity(quantity + 1)}
                                        className="h-8 w-8 rounded-md bg-coffee-600 shadow-sm flex items-center justify-center text-white hover:bg-coffee-700 transition-colors"
                                    >
                                        <Plus className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Sticky Footer */}
                <div className="absolute bottom-0 left-0 right-0 border-t border-gray-200 bg-white p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                    <div className="flex gap-3">
                        {/* Add to Order Button (Primary) */}
                        <button
                            onClick={handleConfirm}
                            disabled={isLoading}
                            className="w-full flex items-center justify-between rounded-xl bg-gradient-to-r from-coffee-600 to-coffee-700 px-6 py-3.5 text-white font-bold shadow-lg hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <span>Add to Order</span>
                            <span className="text-lg tabular-nums">₱{totalPrice.toFixed(2)}</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductCustomizeModal;
