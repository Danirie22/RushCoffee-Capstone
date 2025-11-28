import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Product, ProductSize } from '../../data/mockProducts';

interface POSProductCardProps {
    product: Product;
    onSelect: (product: Product, selectedSize: ProductSize) => void;
}

const POSProductCard: React.FC<POSProductCardProps> = ({ product, onSelect }) => {
    const { name, category, imageUrl, comboImageUrl, available, stock } = product;
    const [selectedSize, setSelectedSize] = useState<ProductSize>(product.sizes[0]);

    const displayImageUrl = selectedSize.name === 'Combo Meal' && comboImageUrl ? comboImageUrl : imageUrl;
    const isOutOfStock = !available || stock === 0;

    const handleClick = () => {
        if (!isOutOfStock) {
            onSelect(product, selectedSize);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!isOutOfStock && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            handleClick();
        }
    };

    return (
        <div
            role="button"
            tabIndex={isOutOfStock ? -1 : 0}
            onClick={handleClick}
            onKeyDown={handleKeyDown}
            className={`w-full text-left rounded-2xl overflow-hidden bg-white shadow-sm border transition-all ${isOutOfStock
                ? 'opacity-60 cursor-not-allowed'
                : 'cursor-pointer hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] border-gray-200 hover:border-primary-300'
                }`}
        >
            {/* Image */}
            <div className="relative aspect-square bg-gray-100">
                <img src={displayImageUrl} alt={name} className="w-full h-full object-cover" />
                {isOutOfStock && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <span className="bg-red-500 text-white px-4 py-2 rounded-lg font-bold text-sm">Out of Stock</span>
                    </div>
                )}
                {stock > 0 && stock < 5 && !isOutOfStock && (
                    <div className="absolute top-2 right-2 bg-orange-500 text-white px-2 py-1 rounded-lg text-xs font-bold">
                        Low Stock
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-3 md:p-4">
                <p className="text-xs text-gray-500 mb-1">{category}</p>
                <h3 className="font-bold text-gray-900 text-sm md:text-base mb-2 line-clamp-1">{name}</h3>

                {/* Size Selector */}
                <div className="flex gap-1 mb-3">
                    {product.sizes.map((size, index) => (
                        <button
                            key={`${size.name}-${index}`}
                            onClick={(e) => {
                                e.stopPropagation();
                                setSelectedSize(size);
                            }}
                            className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold transition-colors ${selectedSize.name === size.name
                                ? 'bg-primary-600 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            {size.name}
                        </button>
                    ))}
                </div>

                {/* Price & Add Button */}
                <div className="flex items-center justify-between">
                    <span className="text-lg md:text-xl font-bold text-primary-700">₱{selectedSize.price.toFixed(2)}</span>
                    {!isOutOfStock && (
                        <div className="h-9 w-9 md:h-10 md:w-10 rounded-full bg-primary-600 flex items-center justify-center text-white shadow-md">
                            <Plus className="h-5 w-5 md:h-6 md:w-6" />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default POSProductCard;
