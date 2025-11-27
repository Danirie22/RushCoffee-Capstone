import React, { useState } from 'react';
import { Plus, Minus, Loader2, X } from 'lucide-react';
import { Product, ProductSize } from '../../data/mockProducts';
import { Customizations } from '../../context/CartContext';
import { useToppings } from '../../hooks/useToppings';
import { useCustomizationOptions } from '../../hooks/useCustomizationOptions';
import Modal from '../ui/Modal';

interface ProductCustomizeModalProps {
    product: Product;
    selectedSize: ProductSize;
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (customizations: Customizations, quantity: number, totalPrice?: number, selectedSize?: ProductSize) => void;
    onBuyNow?: (customizations: Customizations, quantity: number, selectedSize?: ProductSize) => void;
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
    const [currentSize, setCurrentSize] = useState<ProductSize>(selectedSize);

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
            setCurrentSize(selectedSize); // Initialize with prop
        }
    }, [isOpen, initialCustomizations, initialQuantity, selectedSize]);

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
        onConfirm(getCustomizations(), quantity, totalPrice / quantity, currentSize); // Pass unit price (total / quantity) and size
        onClose(); // Close the modal after confirming
    };

    const handleBuyNow = () => {
        if (onBuyNow) {
            onBuyNow(getCustomizations(), quantity, currentSize);
            onClose();
        }
    };

    // Build toppings list with "None" option
    const toppingOptions = [
        { id: 'none', name: 'None', price: 0 },
        ...toppings.map(t => ({ id: t.id, name: t.name, price: t.price }))
    ];

    const selectedToppingData = toppingOptions.find((t) => t.name === selectedTopping);
    const toppingPrice = selectedToppingData?.price || 0;
    const totalPrice = (currentSize.price + toppingPrice) * quantity;

    const isLoading = toppingsLoading || optionsLoading;

    const footerContent = (
        <button
            onClick={handleConfirm}
            disabled={isLoading}
            className="w-full flex items-center justify-between rounded-xl bg-gradient-to-r from-coffee-600 to-coffee-700 px-6 py-3 text-white font-bold shadow-lg hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
            <span>Add to Order</span>
            <span className="text-lg tabular-nums">₱{totalPrice.toFixed(2)}</span>
        </button>
    );

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            hideHeader={true}
            hideCloseButton={true}
            footer={footerContent}
            className="sm:max-w-lg"
        >
            <div>
                {/* Product Header Info */}
                <div className="-mx-6 -mt-6 mb-2">
                    <div className="bg-[#F5F5F0] w-full h-96 flex items-center justify-center relative overflow-hidden">
                        {/* Custom Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/50 hover:bg-white/80 backdrop-blur-sm transition-colors text-gray-600 hover:text-gray-900"
                        >
                            <X className="h-5 w-5" />
                        </button>

                        <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="h-full w-full object-cover object-center"
                        />
                    </div>

                    <div className="px-6 pt-4">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-coffee-600 tracking-wide uppercase">{product.category}</span>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">{product.name}</h2>
                        <p className="text-gray-500 leading-relaxed text-sm">{product.description}</p>
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-coffee-600" />
                    </div>
                ) : (
                    <div className="space-y-1">
                        {/* Size Selection */}
                        <div className="py-4 border-b border-gray-100 -mx-6 px-6">
                            <h4 className="mb-3 text-sm font-bold text-gray-900 uppercase tracking-wide flex items-center gap-2">
                                Size
                            </h4>
                            <div className="flex flex-wrap gap-2">
                                {product.sizes.map((size) => (
                                    <button
                                        key={size.name}
                                        onClick={() => setCurrentSize(size)}
                                        className={`flex-1 min-w-[80px] rounded-lg py-2 text-sm font-semibold transition-all border ${currentSize.name === size.name
                                            ? 'bg-coffee-600 text-white border-coffee-600 shadow-md'
                                            : 'bg-white text-gray-600 border-gray-200 hover:border-coffee-300 hover:bg-coffee-50'
                                            }`}
                                    >
                                        {size.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Sugar Level - Only for beverages */}
                        {['Coffee Based', 'Non-Coffee Based', 'Matcha Series', 'Refreshments'].includes(product.category) && (
                            <div className="py-4 border-b border-gray-100 -mx-6 px-6">
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
                            <div className="py-4 border-b border-gray-100 -mx-6 px-6">
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
                        <div className="py-4 border-b border-gray-100 -mx-6 px-6">
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
                        <div className="flex items-center justify-between py-4 -mx-6 px-6">
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
                    </div>
                )}
            </div>
        </Modal>
    );
};

export default ProductCustomizeModal;
