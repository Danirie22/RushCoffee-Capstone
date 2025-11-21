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
    onConfirm: (customizations: Customizations, quantity: number) => void;
}

const ProductCustomizeModal: React.FC<ProductCustomizeModalProps> = ({
    product,
    selectedSize,
    isOpen,
    onClose,
    onConfirm,
}) => {
    const [sugarLevel, setSugarLevel] = useState('100%');
    const [iceLevel, setIceLevel] = useState('Normal');
    const [selectedTopping, setSelectedTopping] = useState('None');
    const [quantity, setQuantity] = useState(1);

    // Fetch dynamic data from Firestore
    const { toppings, isLoading: toppingsLoading } = useToppings();
    const { options, isLoading: optionsLoading } = useCustomizationOptions();

    // Reset state when modal is closed
    React.useEffect(() => {
        if (!isOpen) {
            setQuantity(1);
            setSugarLevel('100%');
            setIceLevel('Normal');
            setSelectedTopping('None');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleConfirm = () => {
        onConfirm(
            {
                sugarLevel,
                iceLevel,
                toppings: selectedTopping !== 'None' ? [selectedTopping] : [],
            },
            quantity
        );
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
            <div className="relative z-10 w-full max-w-lg overflow-hidden bg-white shadow-2xl transition-all duration-300 ease-out sm:rounded-3xl rounded-t-3xl max-h-[92vh] flex flex-col animate-in slide-in-from-bottom-4 sm:slide-in-from-bottom-0 sm:zoom-in-95">

                {/* Hero Image Section */}
                <div className="relative h-72 shrink-0 overflow-hidden">
                    {/* Product Image */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary-50 to-primary-100">
                        <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="h-full w-full object-cover scale-110 hover:scale-125 transition-transform duration-700"
                        />
                    </div>

                    {/* Subtle gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-gray-900 shadow-xl backdrop-blur-sm transition-all hover:bg-white hover:scale-110 active:scale-95 z-10"
                        aria-label="Close modal"
                    >
                        <X className="h-5 w-5" />
                    </button>

                    {/* Product Info */}
                    <div className="absolute bottom-0 left-0 right-0 p-6 pb-8">
                        <div className="space-y-2">
                            <h3 className="font-display text-3xl sm:text-4xl font-bold leading-tight tracking-tight text-white drop-shadow-lg">
                                {product.name}
                            </h3>
                            <div className="flex items-center gap-3">
                                <span className="inline-flex items-center rounded-full bg-white/20 backdrop-blur-md px-4 py-1.5 text-sm font-semibold text-white border border-white/30">
                                    {selectedSize.name}
                                </span>
                                <span className="inline-flex items-center rounded-full bg-white/20 backdrop-blur-md px-4 py-1.5 text-sm font-semibold text-white border border-white/30">
                                    {selectedSize.size}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto px-6 py-6 pb-28">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
                        </div>
                    ) : (
                        <>
                            {/* Sugar Level */}
                            <div className="mb-8">
                                <h4 className="mb-4 font-display text-lg font-bold text-gray-900 flex items-center gap-2">
                                    <span className="h-1.5 w-1.5 rounded-full bg-primary-600"></span>
                                    Sugar Level
                                </h4>
                                <div className="flex flex-wrap gap-2.5">
                                    {options.sugarLevels.map((level) => (
                                        <button
                                            key={level.value}
                                            onClick={() => setSugarLevel(level.value)}
                                            className={`rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-200 ${sugarLevel === level.value
                                                ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/30 scale-105 ring-2 ring-primary-600 ring-offset-2'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105'
                                                }`}
                                        >
                                            {level.value}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Ice Level */}
                            <div className="mb-8">
                                <h4 className="mb-4 font-display text-lg font-bold text-gray-900 flex items-center gap-2">
                                    <span className="h-1.5 w-1.5 rounded-full bg-primary-600"></span>
                                    Ice Level
                                </h4>
                                <div className="flex flex-wrap gap-2.5">
                                    {options.iceLevels.map((level) => (
                                        <button
                                            key={level.value}
                                            onClick={() => setIceLevel(level.value)}
                                            className={`rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-200 ${iceLevel === level.value
                                                ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/30 scale-105 ring-2 ring-primary-600 ring-offset-2'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105'
                                                }`}
                                        >
                                            {level.value}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Toppings - Radio Buttons */}
                            <div className="mb-8">
                                <h4 className="mb-4 font-display text-lg font-bold text-gray-900 flex items-center gap-2">
                                    <span className="h-1.5 w-1.5 rounded-full bg-primary-600"></span>
                                    Choose Your Topping
                                    <span className="ml-auto text-sm font-normal text-gray-500">(Select one)</span>
                                </h4>
                                <div className="space-y-2.5">
                                    {toppingOptions.map((topping) => {
                                        const isSelected = selectedTopping === topping.name;
                                        return (
                                            <label
                                                key={topping.id}
                                                className={`flex cursor-pointer items-center justify-between rounded-2xl border-2 p-4 transition-all duration-200 ${isSelected
                                                    ? 'border-primary-600 bg-primary-50 shadow-md shadow-primary-600/10 scale-[1.02]'
                                                    : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50 hover:shadow-sm'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    {/* Radio Button */}
                                                    <div className={`flex h-6 w-6 items-center justify-center rounded-full border-2 transition-all duration-200 ${isSelected
                                                        ? 'border-primary-600 bg-primary-600 shadow-sm'
                                                        : 'border-gray-400 bg-white'
                                                        }`}>
                                                        {isSelected && (
                                                            <div className="h-2.5 w-2.5 rounded-full bg-white animate-in zoom-in-50 duration-200" />
                                                        )}
                                                    </div>
                                                    <input
                                                        type="radio"
                                                        name="topping"
                                                        checked={isSelected}
                                                        onChange={() => setSelectedTopping(topping.name)}
                                                        className="hidden"
                                                    />
                                                    <span className={`font-semibold transition-colors ${isSelected ? 'text-primary-900' : 'text-gray-700'
                                                        }`}>
                                                        {topping.name}
                                                    </span>
                                                </div>
                                                {topping.price > 0 && (
                                                    <span className={`font-bold transition-colors ${isSelected ? 'text-primary-600' : 'text-gray-900'
                                                        }`}>
                                                        +₱{topping.price}
                                                    </span>
                                                )}
                                            </label>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Quantity */}
                            <div className="flex items-center justify-between rounded-2xl bg-gray-50 p-4 border border-gray-200">
                                <span className="font-display text-lg font-bold text-gray-900">Quantity</span>
                                <div className="flex items-center gap-4 rounded-full bg-white px-2 py-2 shadow-sm border border-gray-200">
                                    <button
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        className="rounded-full p-2 text-gray-600 hover:bg-primary-50 hover:text-primary-600 disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-gray-600 transition-all"
                                        disabled={quantity <= 1}
                                        aria-label="Decrease quantity"
                                    >
                                        <Minus className="h-4 w-4" />
                                    </button>
                                    <span className="w-8 text-center font-bold text-gray-900 tabular-nums">{quantity}</span>
                                    <button
                                        onClick={() => setQuantity(quantity + 1)}
                                        className="rounded-full p-2 text-gray-600 hover:bg-primary-50 hover:text-primary-600 transition-all"
                                        aria-label="Increase quantity"
                                    >
                                        <Plus className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Sticky Footer */}
                <div className="absolute bottom-0 left-0 right-0 border-t border-gray-200 bg-white/95 backdrop-blur-md p-5 shadow-[0_-8px_16px_-4px_rgba(0,0,0,0.08)]">
                    <button
                        onClick={handleConfirm}
                        disabled={isLoading}
                        className="group flex w-full items-center justify-between rounded-2xl bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-4 text-lg font-bold text-white shadow-xl shadow-primary-600/30 transition-all duration-200 hover:shadow-2xl hover:shadow-primary-600/40 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <span className="flex items-center gap-2">
                            {isLoading ? (
                                <>
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    <span>Loading...</span>
                                </>
                            ) : (
                                <>
                                    <span>Add to Cart</span>
                                    {quantity > 1 && (
                                        <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-sm font-semibold">
                                            ×{quantity}
                                        </span>
                                    )}
                                </>
                            )}
                        </span>
                        <span className="font-display text-xl tabular-nums">₱{totalPrice.toFixed(2)}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductCustomizeModal;
