
import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Star, Sparkles } from 'lucide-react';

import { Product, ProductSize } from '../../data/mockProducts';
import Card from '../ui/Card';
import Badge from '../ui/Badge';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product, selectedSize: ProductSize) => void;
  isLoggedIn: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart, isLoggedIn }) => {
  const { name, description, category, imageUrl, comboImageUrl, available, stock, popular, new: isNew } = product;
  const navigate = useNavigate();

  const [selectedSize, setSelectedSize] = React.useState<ProductSize>(product.sizes[0]);

  const displayImageUrl =
    selectedSize.name === 'Combo Meal' && comboImageUrl
      ? comboImageUrl
      : imageUrl;

  const isOutOfStock = !available || stock === 0;

  const handleAddToCartClick = () => {
    if (isLoggedIn) {
      onAddToCart(product, selectedSize);
    } else {
      navigate('/auth/login');
    }
  };

  const renderStockStatus = () => {
    if (isOutOfStock) {
      return <p className="text-sm font-medium text-red-600">Out of Stock</p>;
    }
    if (stock < 5) {
      return <p className="text-sm font-medium text-orange-600">Only {stock} left</p>;
    }
    return <p className="text-sm font-medium text-green-600">In Stock</p>;
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

      <div className="flex flex-1 flex-col p-3 sm:p-4">
        <div>
          <p className="text-xs text-gray-500">{category}</p>
          <h3 className="font-semibold text-coffee-900 text-base sm:text-lg">{name}</h3>
          <p className="hidden mt-1 h-10 text-sm text-gray-600 line-clamp-2 sm:block">{description}</p>
        </div>

        <div className="mt-auto pt-3 sm:pt-4">
          <div className="flex items-center justify-between">
            <p className="text-lg font-bold text-primary-600 sm:text-xl">₱{selectedSize.price.toFixed(2)}</p>
            {renderStockStatus()}
          </div>

          <div className="mt-3 flex w-full rounded-full border border-gray-200 bg-gray-50 p-1 sm:mt-4">
            {product.sizes.map((size) => (
              <button
                key={size.name}
                onClick={() => setSelectedSize(size)}
                className={`w-1/2 rounded-full py-1 text-xs font-semibold transition-colors sm:py-1.5 sm:text-sm ${selectedSize.name === size.name
                  ? 'bg-primary-600 text-white shadow'
                  : 'text-gray-600 hover:bg-primary-50'
                  }`}
              >
                {size.name} ({size.size})
              </button>
            ))}
          </div>

          <button
            onClick={handleAddToCartClick}
            disabled={isOutOfStock}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-full bg-primary-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-gray-400 sm:mt-3 sm:py-2.5 sm:text-sm"
            aria-label={isLoggedIn ? `Add ${name} to cart` : `Login to order ${name}`}
          >
            {isOutOfStock ? (
              'Out of Stock'
            ) : isLoggedIn ? (
              <>
                <ShoppingCart className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                Add to Cart
              </>
            ) : (
              'Login to Order'
            )}
          </button>
        </div>
      </div>
    </Card>
  );
};

export default ProductCard;