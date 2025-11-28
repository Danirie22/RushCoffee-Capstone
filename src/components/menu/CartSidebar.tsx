import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Minus, Plus, Trash2, ArrowRight, Coffee, Check } from 'lucide-react';
import { Product, ProductSize } from '../../data/mockProducts';
import Badge from '../ui/Badge';
import RushCoffeeLogo from '../layout/RushCoffeeLogo';
import { CartItem } from '../../context/CartContext';

import { useToppings } from '../../hooks/useToppings';

interface CartSidebarProps {
  cartItems: CartItem[];
  isOpen: boolean;
  onClose: () => void;
  onUpdateQuantity: (cartItemId: string, newQuantity: number) => void;
  onRemoveItem: (cartItemId: string) => void;
  onCheckout: () => void;
  onEditItem: (cartItem: CartItem) => void;
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
  onEditItem,
  selectedItemIds,
  onToggleItemSelection,
  onSelectAll,
  onDeselectAll,
}) => {
  const navigate = useNavigate();
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const { toppings: availableToppings } = useToppings();
  const allSelected = cartItems.length > 0 && selectedItemIds.length === cartItems.length;
  const someSelected = selectedItemIds.length > 0 && selectedItemIds.length < cartItems.length;

  const getToppingsPrice = (toppingNames?: string[]) => {
    if (!toppingNames) return 0;
    return toppingNames.reduce((acc, name) => {
      const topping = availableToppings.find(t => t.name === name);
      return acc + (topping?.price || 0);
    }, 0);
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
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <ul className="space-y-3">
                {cartItems.map((item) => {
                  const isCombo = item.selectedSize.name === 'Combo Meal';
                  const displayName = isCombo ? `${item.product.name} (${item.selectedSize.name})` : item.product.name;
                  const displayImageUrl = isCombo && item.product.comboImageUrl ? item.product.comboImageUrl : item.product.imageUrl;
                  const toppingsPrice = getToppingsPrice(item.customizations?.toppings);
                  const unitPrice = item.selectedSize.price + toppingsPrice;
                  const isSelected = selectedItemIds.includes(item.id);

                  return (
                    <li key={item.id} className={`relative flex gap-4 p-5 rounded-xl transition-all ${isSelected ? 'bg-coffee-50 border-2 border-coffee-200' : 'bg-gray-50/50 border-2 border-transparent hover:border-gray-200'}`}>
                      {/* Delete Button - Absolute Position */}
                      <button
                        onClick={() => onRemoveItem(item.id)}
                        className="absolute top-5 right-5 z-10 rounded-full p-2 text-gray-400 transition-all hover:bg-red-50 hover:text-red-600"
                        aria-label={`Remove ${displayName} from cart`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>

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

                      {/* Product Image - Clickable */}
                      <button
                        onClick={() => onEditItem(item)}
                        className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border border-gray-100 shadow-sm hover:border-primary-300 transition-colors cursor-pointer"
                      >
                        <img src={displayImageUrl} alt={displayName} className="h-full w-full object-cover object-center" />
                      </button>

                      {/* Product Details Column */}
                      <div className="flex-1 min-w-0 flex flex-col">
                        {/* Name & Size Row */}
                        <button
                          onClick={() => onEditItem(item)}
                          className="text-left w-full hover:opacity-75 transition-opacity"
                        >
                          <h4 className="font-bold text-gray-900 truncate text-base pr-8">{displayName}</h4>
                          <div className="mt-1.5 flex items-center justify-between">
                            <span className="inline-flex items-center rounded-md bg-white px-2.5 py-1 text-xs font-medium text-gray-700 ring-1 ring-inset ring-gray-200">
                              {item.selectedSize.name}
                            </span>
                            <span className="text-sm font-medium text-gray-700">₱{item.selectedSize.price.toFixed(2)}</span>
                          </div>
                        </button>

                        {/* Customizations Display */}
                        {item.customizations && (
                          <div className="mt-2 space-y-1.5">
                            {/* Sugar & Ice Badges */}
                            {(item.customizations.sugarLevel || item.customizations.iceLevel) && (
                              <div className="flex flex-wrap gap-1.5">
                                {item.customizations.sugarLevel && (
                                  <span className="inline-flex items-center rounded-md bg-white px-2.5 py-1 text-xs font-medium text-gray-700 ring-1 ring-inset ring-gray-200">
                                    Sugar: {item.customizations.sugarLevel}
                                  </span>
                                )}
                                {item.customizations.iceLevel && (
                                  <span className="inline-flex items-center rounded-md bg-white px-2.5 py-1 text-xs font-medium text-gray-700 ring-1 ring-inset ring-gray-200">
                                    Ice: {item.customizations.iceLevel}
                                  </span>
                                )}
                              </div>
                            )}

                            {/* Toppings with Prices */}
                            {item.customizations.toppings && item.customizations.toppings.length > 0 && (
                              <div className="flex flex-col gap-1.5">
                                {item.customizations.toppings.map((toppingName) => {
                                  const topping = availableToppings.find(t => t.name === toppingName);
                                  const price = topping?.price || 0;
                                  return (
                                    <div key={toppingName} className="flex items-center justify-between">
                                      <span className="inline-flex items-center rounded-md bg-white px-2.5 py-1 text-xs font-medium text-gray-700 ring-1 ring-inset ring-gray-200">
                                        {toppingName}
                                      </span>
                                      <span className="text-xs font-medium text-gray-600">+₱{price.toFixed(2)}</span>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Footer: Quantity & Total */}
                        <div className="mt-auto pt-3 flex items-center justify-between">
                          <div className="flex items-center rounded-full border border-gray-200 bg-white shadow-sm">
                            <button
                              onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                              disabled={item.quantity === 1}
                              className="flex h-8 w-8 items-center justify-center rounded-l-full text-gray-500 transition hover:bg-gray-50 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
                              aria-label={`Decrease quantity of ${displayName}`}
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </button>
                            <span className="w-8 text-center text-sm font-semibold text-gray-900" aria-live="polite">{item.quantity}</span>
                            <button
                              onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                              className="flex h-8 w-8 items-center justify-center rounded-r-full text-gray-500 transition hover:bg-gray-50 hover:text-gray-700"
                              aria-label={`Increase quantity of ${displayName}`}
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>
                          <p className="font-bold text-lg text-gray-900">₱{(unitPrice * item.quantity).toFixed(2)}</p>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {/* Footer */}
          {cartItems.length > 0 && (
            <footer className="mt-auto border-t border-gray-200 p-6 bg-gray-50/50">
              <div className="flex items-center justify-between">
                <span className="text-base font-medium text-gray-600">Subtotal</span>
                <span className="text-xl font-bold text-gray-900">₱{subtotal.toFixed(2)}</span>
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
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary-600 px-6 py-3.5 text-base font-bold text-white shadow-lg shadow-primary-600/20 transition-all hover:bg-primary-700 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-gray-400 disabled:opacity-50 disabled:shadow-none disabled:scale-100"
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
