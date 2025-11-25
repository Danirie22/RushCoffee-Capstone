import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Star, Sparkles } from 'lucide-react';

import { Product, ProductSize } from '../../data/mockProducts';
import Card from '../ui/Card';
import Badge from '../ui/Badge';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product, selectedSize: ProductSize) => void;
  onBuyNow?: (product: Product, selectedSize: ProductSize) => void;
  isLoggedIn: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart, onBuyNow, isLoggedIn }) => {
  const { name, description, category, imageUrl, comboImageUrl, available, stock, popular, new: isNew } = product;
  const navigate = useNavigate();

  const [selectedSize, setSelectedSize] = React.useState<ProductSize>(product.sizes[0]);

  const displayImageUrl =
    selectedSize.name === 'Combo Meal' && comboImageUrl
      ? comboImageUrl
      : imageUrl;

  const isOutOfStock = !available || stock === 0;

  const handleAddToCartClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLoggedIn) {
      onAddToCart(product, selectedSize);
    } else {
      navigate('/auth/login');
    }
  };

  const handleBuyNowClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLoggedIn && onBuyNow) {
      onBuyNow(product, selectedSize);
    } else if (!isLoggedIn) {
      navigate('/auth/login');
    }
  };

  const renderStockStatus = () => {
    if (isOutOfStock) {
      return <p className="text-[10px] sm:text-sm font-medium text-red-600">Out of Stock</p>;
    }
    if (stock < 5) {
      return <p className="text-[10px] sm:text-sm font-medium text-orange-600">Only {stock} left</p>;
    }
    return <p className="text-[10px] sm:text-sm font-medium text-green-600">In Stock</p>;
  };

  return (
    <Card className="flex flex-col overflow-hidden transition-transform duration-300 hover:-translate-y-1" hover>
      <div className="relative">
        <img
          src={displayImageUrl}
          alt={name}
          className="h-32 w-full object-cover sm:h-48"
        />
        <div className="absolute top-2 right-2 z-10 flex flex-col items-end gap-1">
          {isOutOfStock ? (
            <Badge className="bg-red-100 text-red-800" size="sm">Out of Stock</Badge>
          ) : stock > 0 && stock < 5 ? (
            <Badge className="bg-orange-100 text-orange-800" size="sm">Low Stock</Badge>
          ) : null}

          {popular && !isOutOfStock && (
            <div className="rounded-full bg-amber-100 p-1.5 text-amber-600 shadow-sm" title="Popular">
              <Star className="h-4 w-4 fill-current" />
            </div>
          )}

          {isNew && !isOutOfStock && (
            <div className="rounded-full bg-blue-100 p-1.5 text-blue-600 shadow-sm" title="New">
              <Sparkles className="h-4 w-4" />
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-2.5 sm:p-4">
        <div>
          <p className="text-[10px] text-gray-500 sm:text-xs">{category}</p>
          <h3 className="font-semibold text-coffee-900 text-sm sm:text-lg leading-tight">{name}</h3>
        </div>

        <div className="mt-auto pt-2 sm:pt-4">
          <div className="flex items-end justify-between gap-1">
            <p className="text-base font-bold text-primary-600 sm:text-xl">₱{selectedSize.price.toFixed(2)}</p>
            {renderStockStatus()}
          </div>

          <div className="mt-2 flex w-full rounded-full border border-gray-200 bg-gray-50 p-1 sm:mt-4">
            {product.sizes.map((size) => (
              <button
                key={size.name}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedSize(size);
                }}
                className={`w-1/2 rounded-full py-1 text-[10px] sm:text-xs font-semibold transition-colors sm:py-1.5 ${selectedSize.name === size.name
                    ? 'bg-primary-600 text-white shadow'
                    : 'text-gray-600 hover:bg-primary-50'
                  }`}
              >
                {size.name} <span className="hidden sm:inline">({size.size})</span>
              </button>
            ))}
          </div>

          <div className="mt-2 flex gap-2 sm:mt-3">
            {isOutOfStock ? (
              <button
                disabled
                className="flex w-full items-center justify-center gap-2 rounded-full bg-gray-100 px-3 py-2 text-[10px] font-semibold text-gray-400 sm:px-4 sm:py-2.5 sm:text-sm cursor-not-allowed"
              >
                Out of Stock
              </button>
            ) : isLoggedIn ? (
              <>
                <button
                  onClick={handleAddToCartClick}
                  className="flex items-center justify-center rounded-xl bg-primary-50 px-3 py-2 text-primary-700 hover:bg-primary-100 transition-colors"
                  title="Add to Cart"
                >
                  <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
                <button
                  onClick={handleBuyNowClick}
                  className="flex-1 flex items-center justify-center rounded-xl bg-primary-600 px-3 py-2 text-[10px] font-bold text-white shadow-sm transition-colors hover:bg-primary-700 sm:text-sm"
                >
                  Buy Now
                </button>
              </>
            ) : (
              <button
                onClick={() => navigate('/auth/login')}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-primary-600 px-3 py-2 text-[10px] font-semibold text-white shadow-sm hover:bg-primary-700 sm:px-4 sm:py-2.5 sm:text-sm"
              >
                Login to Order
              </button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ProductCard;