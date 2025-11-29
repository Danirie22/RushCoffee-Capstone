import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Sparkles } from 'lucide-react';

import { Product, ProductSize } from '../../data/mockProducts';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product, selectedSize: ProductSize) => void;
  onBuyNow?: (product: Product, selectedSize: ProductSize) => void;
  onProductClick?: (product: Product, selectedSize: ProductSize) => void;
  isLoggedIn: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart, onBuyNow, onProductClick, isLoggedIn }) => {
  const { name, category, imageUrl, comboImageUrl, available, stock, popular, new: isNew } = product;
  const navigate = useNavigate();

  // Default to the first size since selection is now in the modal
  const selectedSize = product.sizes[0];

  const displayImageUrl =
    selectedSize.name === 'Combo Meal' && comboImageUrl
      ? comboImageUrl
      : imageUrl;

  const isOutOfStock = !available || stock === 0;

  const handleCardClick = () => {
    if (onProductClick) {
      onProductClick(product, selectedSize);
    } else if (isLoggedIn) {
      onAddToCart(product, selectedSize);
    } else {
      navigate('/auth/login');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOutOfStock && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      handleCardClick();
    }
  };

  return (
    <div
      role="button"
      tabIndex={isOutOfStock ? -1 : 0}
      onClick={!isOutOfStock ? handleCardClick : undefined}
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
        {popular && !isOutOfStock && (
          <div className="absolute top-2 left-2 rounded-full bg-amber-100 p-1.5 text-amber-600 shadow-sm" title="Popular">
            <Star className="h-4 w-4 fill-current" />
          </div>
        )}
        {isNew && !isOutOfStock && (
          <div className="absolute top-10 left-2 rounded-full bg-blue-100 p-1.5 text-blue-600 shadow-sm" title="New">
            <Sparkles className="h-4 w-4" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3 md:p-4">
        <p className="text-xs text-gray-500 mb-1">{category}</p>
        <h3 className="font-bold text-gray-900 text-sm md:text-base mb-2 line-clamp-1">{name}</h3>

        {/* Price & Action */}
        <div className="flex items-center justify-between">
          <span className="text-lg md:text-xl font-bold text-primary-700">₱{selectedSize.price.toFixed(2)}</span>
          {!isOutOfStock && !isLoggedIn && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate('/auth/login');
              }}
              className="text-xs md:text-sm font-bold text-primary-600 hover:text-primary-700 underline"
            >
              Login
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;