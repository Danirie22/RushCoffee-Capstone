import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Minus, Plus, Trash2, ArrowRight, Coffee, Check } from 'lucide-react';
import { Product, ProductSize } from '../../data/mockProducts';
import Badge from '../ui/Badge';
import RushCoffeeLogo from '../layout/RushCoffeeLogo';
import { CartItem } from '../../context/CartContext';

const TOPPINGS_PRICES: Record<string, number> = {
  'Pearls': 10,
  'Pudding': 15,
  'Grass Jelly': 15,
};

interface CartSidebarProps {
  cartItems: CartItem[];
  isOpen: boolean;
  onClose: () => void;
  onUpdateQuantity: (cartItemId: string, newQuantity: number) => void;
  onRemoveItem: (cartItemId: string) => void;
  onCheckout: () => void;
  selectedItemIds: string[];
  onToggleItemSelection: (cartItemId: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
}

const CartSidebar: React.FC<CartSidebarProps> = ({
  cartItems,
  isOpen,
  onClose,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
  selectedItemIds,
  onToggleItemSelection,
  onSelectAll,
  onDeselectAll,
}) => {
  const navigate = useNavigate();
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const allSelected = cartItems.length > 0 && selectedItemIds.length === cartItems.length;
  const someSelected = selectedItemIds.length > 0 && selectedItemIds.length < cartItems.length;

  const getToppingsPrice = (toppings?: string[]) => {
    if (!toppings) return 0;
    return toppings.reduce((acc, t) => acc + (TOPPINGS_PRICES[t] || 0), 0);
  };

  // Calculate subtotal only for selected items
  const subtotal = cartItems
    .filter(item => selectedItemIds.includes(item.id))
    .reduce((sum, item) => {
      const toppingsPrice = getToppingsPrice(item.customizations?.toppings);
      return sum + (item.selectedSize.price + toppingsPrice) * item.quantity;
    }, 0);

  const handleStartOrdering = () => {
    onClose();
    navigate('/menu');
  };

  const handleSelectAllToggle = () => {
    if (allSelected) {
      onDeselectAll();
    } else {
      onSelectAll();
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <aside
        className={`fixed top-0 right-0 z-50 h-full w-full transform bg-white shadow-2xl transition-transform duration-300 ease-in-out sm:w-96 md:w-[450px] ${isOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-heading"
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <header className="flex items-center justify-between border-b border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <h2 id="cart-heading" className="font-display text-xl font-bold text-coffee-900">
                Your Order
              </h2>
              {totalItems > 0 && (
                <Badge>{totalItems} {totalItems === 1 ? 'item' : 'items'}</Badge>
              )}
            </div>
            <button
              onClick={onClose}
              className="rounded-md p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-800"
              aria-label="Close cart"
            >
              <X className="h-6 w-6" />
            </button>
          </header>

          {/* Select All Checkbox */}
          {cartItems.length > 0 && (
            <div className="border-b border-gray-200 px-6 py-3 bg-gray-50/50 backdrop-blur-sm sticky top-0 z-10">
              <label className="flex items-center gap-3 cursor-pointer group select-none">
                <div className="relative flex items-center justify-center h-5 w-5">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={handleSelectAllToggle}
                    className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border-2 border-gray-300 bg-white transition-all checked:border-primary-600 checked:bg-primary-600 hover:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                  />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity duration-200">
                    {someSelected && !allSelected ? (
                      <Minus className="h-3.5 w-3.5 text-white" strokeWidth={3} />
                    ) : (
                      <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />
                    )}
                  </div>
                </div>
                <span className="text-sm font-semibold text-gray-700 group-hover:text-primary-700 transition-colors">
                  {allSelected ? 'Deselect All' : 'Select All'}
                </span>
                {selectedItemIds.length > 0 && (
                  <span className="ml-auto text-xs font-medium text-primary-600 bg-primary-50 px-2 py-1 rounded-full">
                    {selectedItemIds.length} selected
                  </span>
                )}
              </label>
            </div>
          )}

          {/* Cart Items or Empty State */}
          {cartItems.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
              <RushCoffeeLogo className="h-24 w-24 text-gray-300 opacity-50" />
              <h3 className="text-lg font-semibold text-gray-800">Your cart is empty</h3>
              <p className="text-gray-500">Looks like you haven't added anything yet.</p>
              <button
                onClick={handleStartOrdering}
                className="mt-4 rounded-full bg-primary-600 px-6 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-700"
              >
                Start Ordering
              </button>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto p-6">
              <ul className="-my-4 divide-y divide-gray-200">
                {cartItems.map((item) => {
                  const isCombo = item.selectedSize.name === 'Combo Meal';
                  const displayName = isCombo ? `${item.product.name} (${item.selectedSize.name})` : item.product.name;
                  const displayImageUrl = isCombo && item.product.comboImageUrl ? item.product.comboImageUrl : item.product.imageUrl;
                  const toppingsPrice = getToppingsPrice(item.customizations?.toppings);
                  const unitPrice = item.selectedSize.price + toppingsPrice;
                  const isSelected = selectedItemIds.includes(item.id);

                  return (
                    <li key={item.id} className={`relative flex items-start gap-3 py-4 transition-colors ${isSelected ? 'bg-primary-50/30' : ''}`}>
                      {/* Checkbox */}
                      <div className="pt-1 relative flex items-center justify-center h-5 w-5">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => onToggleItemSelection(item.id)}
                          className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border-2 border-gray-300 bg-white transition-all checked:border-primary-600 checked:bg-primary-600 hover:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                        />
                        <Check
                          className="absolute h-3.5 w-3.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity duration-200 pointer-events-none"
                          strokeWidth={3}
                        />
                      </div>

                      {/* Product Image */}
                      <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                        <img src={displayImageUrl} alt={displayName} className="h-full w-full object-cover object-center" />
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-800 truncate">{displayName}</h4>
                        <p className="text-sm text-gray-500">{item.selectedSize.size} - ₱{unitPrice.toFixed(2)}</p>

                        {/* Customizations Display */}
                        {item.customizations && (
                          <div className="mt-1 text-xs text-gray-500 space-y-0.5">
                            {item.customizations.sugarLevel && <p>Sugar: {item.customizations.sugarLevel}</p>}
                            {item.customizations.iceLevel && <p>Ice: {item.customizations.iceLevel}</p>}
                            {item.customizations.toppings && item.customizations.toppings.length > 0 && (
                              <p>Toppings: {item.customizations.toppings.join(', ')}</p>
                            )}
                          </div>
                        )}

                        <div className="mt-2 flex items-center">
                          <button
                            onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                            disabled={item.quantity === 1}
                            className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 text-gray-600 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                            aria-label={`Decrease quantity of ${displayName}`}
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="w-12 text-center font-semibold text-gray-800" aria-live="polite">{item.quantity}</span>
                          <button
                            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                            className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 text-gray-600 transition hover:bg-gray-100"
                            aria-label={`Increase quantity of ${displayName}`}
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      {/* Price */}
                      <div className="flex flex-col items-end gap-1">
                        <p className="font-semibold text-gray-900">₱{(unitPrice * item.quantity).toFixed(2)}</p>
                        <button
                          onClick={() => onRemoveItem(item.id)}
                          className="p-1 text-gray-400 transition-colors hover:text-red-600"
                          aria-label={`Remove ${displayName} from cart`}
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {/* Footer */}
          {cartItems.length > 0 && (
            <footer className="mt-auto border-t border-gray-200 p-6">
              <div className="flex items-center justify-between text-lg font-semibold text-gray-900">
                <span>Subtotal</span>
                <span>₱{subtotal.toFixed(2)}</span>
              </div>
              {selectedItemIds.length < cartItems.length && (
                <p className="mt-1 text-xs text-amber-600">
                  {selectedItemIds.length === 0
                    ? 'Please select items to checkout'
                    : `${cartItems.length - selectedItemIds.length} item(s) not selected`}
                </p>
              )}
              <p className="mt-1 text-sm text-gray-500">Taxes and service fee calculated at checkout.</p>
              <div className="mt-6">
                <button
                  onClick={onCheckout}
                  disabled={selectedItemIds.length === 0}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-primary-600 px-6 py-3 text-base font-semibold text-white shadow-sm transition-colors hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-gray-400 disabled:opacity-50"
                >
                  Proceed to Checkout
                  <ArrowRight className="h-5 w-5" />
                </button>
              </div>
            </footer>
          )}
        </div>
      </aside>
    </>
  );
};

export default CartSidebar;
