

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';

import { Product, ProductSize } from '../../data/mockProducts';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product, selectedSize: ProductSize) => void;
  isLoggedIn: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart, isLoggedIn }) => {
  const { name, description, category, imageUrl, available, stock, popular, new: isNew } = product;
  const navigate = useNavigate();
  
  const [selectedSize, setSelectedSize] = useState<ProductSize>(product.sizes[0]);

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
          src={imageUrl}
          alt={name}
          className="h-48 w-full object-cover"
        />
        <div className="absolute top-2 right-2 flex flex-col items-end gap-1">
          {isOutOfStock ? (
            <Badge className="bg-red-100 text-red-800">Out of Stock</Badge>
          ) : stock > 0 && stock < 5 ? (
            <Badge className="bg-orange-100 text-orange-800">Low Stock</Badge>
          ) : null}
          {popular && !isOutOfStock && <Badge className="bg-primary-100 text-primary-800">Popular</Badge>}
          {isNew && !isOutOfStock && <Badge className="bg-blue-100 text-blue-800">New</Badge>}
        </div>
      </div>
      
      <div className="flex flex-1 flex-col p-4">
        <div>
          <p className="text-sm text-gray-500">{category}</p>
          <h3 className="mt-1 text-lg font-semibold text-coffee-900">{name}</h3>
          <p className="mt-1 h-10 text-sm text-gray-600 line-clamp-2">{description}</p>
        </div>
        
        <div className="mt-auto pt-4">
          <div className="flex items-center justify-between">
            <p className="text-xl font-bold text-primary-600">₱{selectedSize.price.toFixed(2)}</p>
            {renderStockStatus()}
          </div>
          
          <div className="mt-4 flex w-full rounded-full border border-gray-200 bg-gray-50 p-1">
            {product.sizes.map((size) => (
              <button
                key={size.name}
                onClick={() => setSelectedSize(size)}
                className={`w-1/2 rounded-full py-1.5 text-sm font-semibold transition-colors ${
                  selectedSize.name === size.name
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
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-gray-400"
            aria-label={isLoggedIn ? `Add ${name} to cart` : `Login to order ${name}`}
          >
            {isOutOfStock ? (
              'Out of Stock'
            ) : isLoggedIn ? (
              <>
                <ShoppingCart className="h-4 w-4" />
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