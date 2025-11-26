import React, { useState } from 'react';
import { Plus, Minus, Loader2 } from 'lucide-react';
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
        if (onBuyNow) {
            onBuyNow(getCustomizations(), quantity);
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
    const totalPrice = (selectedSize.price + toppingPrice) * quantity;

    const isLoading = toppingsLoading || optionsLoading;

    const footerContent = (
        <button
            onClick={handleConfirm}
            disabled={isLoading}
            className="w-full flex items-center justify-between rounded-xl bg-gradient-to-r from-coffee-600 to-coffee-700 px-6 py-3.5 text-white font-bold shadow-lg hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
            <span>Add to Order</span>
            <span className="text-lg tabular-nums">₱{totalPrice.toFixed(2)}</span>
        </button>
    );

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={product.name}
            footer={footerContent}
            className="sm:max-w-lg"
        >
            <div className="space-y-6">
                {/* Product Header Info */}
                <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
                    <div className="h-20 w-20 shrink-0 rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
                        <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="h-full w-full object-cover"
                        />
                    </div>
                    <div>
                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                            <span className="bg-gray-100 px-2 py-0.5 rounded font-medium text-gray-700">
                                {selectedSize.name}
                            </span>
                            <span>{selectedSize.size}</span>
                        </div>
                        <p className="text-sm text-gray-500 line-clamp-2">{product.description}</p>
                    </div>
                </div>

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
        </Modal>
    );
};

export default ProductCustomizeModal;
