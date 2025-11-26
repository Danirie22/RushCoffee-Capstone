import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Search, Plus, Minus, Trash2, User, CreditCard, AlertCircle, ShoppingCart } from 'lucide-react';
import { useProduct } from '../../context/ProductContext';
import { useAuth } from '../../context/AuthContext';
import { Product, ProductSize } from '../../data/mockProducts';
import ProductCustomizeModal from '../../components/menu/ProductCustomizeModal';
import POSProductCard from '../../components/employee/POSProductCard';
import PaymentModal from '../../components/employee/PaymentModal';
import { saveOrder, generateOrderNumber, OrderItem } from '../../services/orderService';

interface CartItem {
    id: string;
    product: Product;
    size: ProductSize;
    quantity: number;
    customizations?: any;
    finalPrice?: number;
}

const POSPage: React.FC = () => {
    const navigate = useNavigate();
    const { products, isLoading } = useProduct();
    const { currentUser } = useAuth();

    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [cart, setCart] = useState<CartItem[]>([]);
    const [customizeModalOpen, setCustomizeModalOpen] = useState(false);
    const [paymentModalOpen, setPaymentModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [selectedSize, setSelectedSize] = useState<ProductSize | null>(null);
    const [showCart, setShowCart] = useState(false);
    const [isSavingOrder, setIsSavingOrder] = useState(false);

    const [discountType, setDiscountType] = useState<'none' | 'senior' | 'pwd'>('none');
    const [discountCardId, setDiscountCardId] = useState('');

    const [editingCartIndex, setEditingCartIndex] = useState<number | null>(null);

    const categories = ['all', 'Coffee Based', 'Non-Coffee Based', 'Matcha Series', 'Refreshments', 'Meals'];

    const filteredProducts = useMemo(() => {
        let result = products;
        if (selectedCategory !== 'all') result = result.filter(p => p.category === selectedCategory);
        if (searchQuery.trim()) result = result.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
        return result;
    }, [products, selectedCategory, searchQuery]);

    const addToCart = (product: Product, size: ProductSize, customizations?: any, quantity: number = 1, finalPrice?: number) => {
        const itemPrice = finalPrice || size.price; // Use calculated price or base price

        setCart(prev => {
            // If editing, replace the item at the specific index
            if (editingCartIndex !== null) {
                const updated = [...prev];
                updated[editingCartIndex] = { ...updated[editingCartIndex], product, size, quantity, customizations, finalPrice: itemPrice };
                return updated;
            }

            // Otherwise, check for duplicates or add new
            const existingIndex = prev.findIndex(item => item.product.id === product.id && item.size.name === size.name && JSON.stringify(item.customizations) === JSON.stringify(customizations));
            if (existingIndex >= 0) {
                const updated = [...prev];
                updated[existingIndex].quantity += quantity;
                // Update price if it changed (though usually same customizations mean same price)
                updated[existingIndex].finalPrice = itemPrice;
                return updated;
            }
            return [...prev, {
                id: `cart-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                product,
                size,
                quantity,
                customizations,
                finalPrice: itemPrice
            }];
        });
        setEditingCartIndex(null); // Reset edit mode
        setSelectedSize(null);
    };

    const handleEditCartItem = (index: number) => {
        const item = cart[index];
        setSelectedProduct(item.product);
        setSelectedSize(item.size); // Set the size from the cart item
        setEditingCartIndex(index);
        setCustomizeModalOpen(true);
    };

    const updateCartQuantity = (index: number, delta: number) => {
        setCart(prev => {
            const updated = [...prev];
            updated[index].quantity += delta;
            if (updated[index].quantity <= 0) updated.splice(index, 1);
            return updated;
        });
    };

    const removeFromCart = (index: number) => setCart(prev => prev.filter((_, i) => i !== index));
    const clearCart = () => {
        setCart([]);
        setDiscountType('none');
        setDiscountCardId('');
        setEditingCartIndex(null);
        setSelectedProduct(null);
        setSelectedSize(null);
    };

    const subtotal = cart.reduce((sum, item) => sum + ((item.finalPrice || item.size.price) * item.quantity), 0);
    const discountPercentage = discountType === 'none' ? 0 : 0.20; // 20% discount
    const discountAmount = subtotal * discountPercentage;
    const totalAmount = subtotal - discountAmount;

    const handleConfirmCustomization = (customizations: any, quantity: number, totalPrice?: number) => {
        if (selectedProduct) {
            // If we have a selected size (from edit or new), use it. Otherwise default to first size.
            const sizeToUse = selectedSize || selectedProduct.sizes[0];
            addToCart(selectedProduct, sizeToUse, customizations, quantity, totalPrice);
            setCustomizeModalOpen(false);
        }
    };

    const handleCheckout = () => { if (cart.length > 0) setPaymentModalOpen(true); };

    const handlePaymentComplete = async (paymentDetails: any) => {
        setIsSavingOrder(true);
        try {
            const orderNumber = await generateOrderNumber();
            await saveOrder({
                orderNumber,
                orderItems: cart.map(item => ({
                    productId: item.product.id,
                    productName: item.product.name,
                    category: item.product.category,
                    size: item.size.name,
                    sizeLabel: item.size.size,
                    price: item.finalPrice || item.size.price,
                    quantity: item.quantity,
                    customizations: item.customizations,
                })),
                subtotal: totalAmount,
                paymentMethod: paymentDetails.method as 'cash' | 'gcash',
                paymentDetails: {
                    amountReceived: paymentDetails.amountReceived,
                    change: paymentDetails.change,
                    referenceNumber: paymentDetails.referenceNumber || null,
                },
                discount: discountType !== 'none' ? {
                    type: discountType,
                    amount: discountAmount,
                    percentage: discountPercentage * 100,
                    cardId: discountCardId || null
                } : null,
                status: 'waiting' as const,
                employeeId: currentUser?.uid || 'unknown',
                employeeName: currentUser?.displayName || currentUser?.email || 'Employee',
                orderType: 'walk-in',
            });

            setCart([]);
            setDiscountType('none');
            setDiscountCardId('');
            setPaymentModalOpen(false);
            setShowCart(false);
            alert(`✅ Payment Successful!\n\nOrder Number: ${orderNumber}\nChange: ₱${paymentDetails.change.toFixed(2)}\n\nOrder has been sent to the queue!`);
        } catch (error) {
            console.error('❌ Error saving order:', error);
            alert('⚠️ Payment received but failed to save order.');
        } finally {
            setIsSavingOrder(false);
        }
    };

    return (
        <div className="h-screen bg-gray-50 flex flex-col font-sans overflow-hidden">
            <div className="bg-coffee-700 text-white shadow-xl z-30 shrink-0">
                <div className="px-4 md:px-6 py-3 md:py-4 flex items-center gap-3 md:gap-4 border-b border-white/10 bg-coffee-800/50">
                    <button onClick={() => navigate('/employee')} className="h-11 w-11 md:h-12 md:w-12 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all hover:scale-105 active:scale-95 shrink-0" title="Exit POS">
                        <X className="h-5 w-5 md:h-6 md:w-6" />
                    </button>
                    <div className="shrink-0">
                        <h1 className="text-base md:text-xl lg:text-2xl font-bold">Point of Sale</h1>
                        <div className="flex items-center gap-2">
                            <span className="h-2 w-2 md:h-2.5 md:w-2.5 rounded-full bg-green-400 animate-pulse"></span>
                            <p className="text-coffee-100 text-xs md:text-sm font-medium">Walk-in Customer</p>
                        </div>
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="relative">
                            <Search className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 h-4 w-4 md:h-5 md:w-5 text-white/40" />
                            <input type="text" placeholder="Search products..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 md:pl-12 pr-3 md:pr-4 py-2.5 md:py-3 text-sm md:text-base rounded-xl border border-white/10 bg-white/5 text-white placeholder:text-white/40 focus:bg-white/10 focus:border-white/20" />
                        </div>
                    </div>
                    <button onClick={() => setShowCart(!showCart)} className="xl:hidden relative h-11 w-11 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all shrink-0">
                        <ShoppingCart className="h-5 w-5" />
                        {cart.length > 0 && <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold border-2 border-coffee-700">{cart.length}</span>}
                    </button>
                </div>
                <div className="px-4 md:px-6 py-3 md:py-4 overflow-x-auto bg-coffee-700/95">
                    <div className="flex gap-2 md:gap-3 min-w-max">
                        {categories.map(cat => (
                            <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-4 md:px-6 lg:px-7 py-2.5 md:py-3 lg:py-3.5 rounded-full font-semibold text-sm md:text-base transition-all ${selectedCategory === cat ? 'bg-white text-coffee-700 shadow-lg scale-105 ring-2 ring-white/50' : 'bg-white/5 text-coffee-100 hover:bg-white/10 border border-white/5'}`}>
                                {cat === 'all' ? 'All Products' : cat}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
            <div className="flex-1 flex overflow-hidden">
                <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-64"><div className="animate-spin h-16 w-16 border-4 border-coffee-600 border-t-transparent rounded-full"></div></div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-5 lg:gap-6 pb-6">
                            {filteredProducts.map(product => (
                                <POSProductCard
                                    key={product.id}
                                    product={product}
                                    onSelect={(product, selectedSize) => {
                                        setSelectedProduct(product);
                                        setSelectedSize(selectedSize); // Set the size selected from the card
                                        setCustomizeModalOpen(true);
                                    }}
                                />
                            ))}
                        </div>
                    )}
                </div>
                {showCart && <div className="fixed inset-0 bg-black/50 z-30 xl:hidden" onClick={() => setShowCart(false)} />}
                <div className={`fixed inset-y-0 right-0 z-40 w-full sm:w-96 xl:w-96 bg-white shadow-2xl transform transition-transform flex flex-col xl:relative xl:translate-x-0 xl:shadow-lg xl:border-l ${showCart ? 'translate-x-0' : 'translate-x-full xl:translate-x-0'}`}>
                    <div className="p-5 border-b bg-gray-50/50 shrink-0">
                        <div className="flex items-center justify-between mb-1">
                            <h2 className="font-bold text-gray-900 text-xl">Current Order</h2>
                            <div className="flex gap-2">
                                {cart.length > 0 && <button onClick={clearCart} className="text-red-500 text-xs font-bold uppercase px-2 py-1 rounded hover:bg-red-50">Clear</button>}
                                <button onClick={() => setShowCart(false)} className="xl:hidden h-8 w-8 rounded-lg hover:bg-gray-100 flex items-center justify-center"><X className="h-5 w-5" /></button>
                            </div>
                        </div>
                        <p className="text-sm text-gray-500">{cart.length} items</p>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {cart.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full py-12 opacity-60">
                                <AlertCircle className="h-10 w-10 text-gray-400 mb-4" />
                                <p className="text-gray-900 font-semibold">Cart is empty</p>
                            </div>
                        ) : cart.map((item, i) => (
                            <div
                                key={item.id}
                                onClick={() => handleEditCartItem(i)}
                                className="bg-white rounded-2xl p-3 border shadow-sm group hover:border-coffee-500 hover:shadow-md transition-all cursor-pointer relative"
                            >
                                <div className="flex gap-3">
                                    <img src={item.product.imageUrl} alt={item.product.name} className="h-16 w-16 rounded-xl object-cover" />
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-sm mb-1">{item.product.name}</h3>
                                        <div className="flex gap-2 text-xs text-gray-500 mb-2">
                                            <span className="bg-gray-100 px-2 py-0.5 rounded">{item.size.name}</span>
                                            <span>{item.size.size}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm font-bold text-coffee-700">₱{((item.finalPrice || item.size.price) * item.quantity).toFixed(2)}</p>
                                            <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-1" onClick={(e) => e.stopPropagation()}>
                                                <button onClick={() => updateCartQuantity(i, -1)} className="h-6 w-6 rounded bg-white shadow-sm flex items-center justify-center"><Minus className="h-3 w-3" /></button>
                                                <span className="text-sm font-bold">{item.quantity}</span>
                                                <button onClick={() => updateCartQuantity(i, 1)} className="h-6 w-6 rounded bg-coffee-600 text-white flex items-center justify-center"><Plus className="h-3 w-3" /></button>
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); removeFromCart(i); }}
                                        className="h-7 w-7 rounded text-gray-400 hover:bg-red-50 hover:text-red-500 flex items-center justify-center opacity-0 group-hover:opacity-100 absolute top-2 right-2"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                    {cart.length > 0 && (
                        <div className="p-5 border-t bg-gray-50 space-y-4 shrink-0">
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm text-gray-600">
                                    <span>Subtotal</span>
                                    <span>₱{subtotal.toFixed(2)}</span>
                                </div>
                                {discountType !== 'none' && (
                                    <div className="flex justify-between text-sm text-green-600 font-medium">
                                        <span>Discount ({discountType === 'senior' ? 'Senior' : 'PWD'} 20%)</span>
                                        <span>-₱{discountAmount.toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between font-bold text-xl pt-2 border-t border-dashed border-gray-300">
                                    <span>Total</span>
                                    <span>₱{totalAmount.toFixed(2)}</span>
                                </div>
                            </div>

                            {/* Discount Buttons */}
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    onClick={() => {
                                        setDiscountType(discountType === 'senior' ? 'none' : 'senior');
                                        if (discountType !== 'senior') setDiscountCardId(''); // Reset ID if switching
                                    }}
                                    className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all ${discountType === 'senior'
                                        ? 'bg-coffee-100 border-coffee-500 text-coffee-700'
                                        : 'bg-white border-gray-200 text-gray-500 hover:border-coffee-300 hover:text-coffee-600'
                                        }`}
                                >
                                    👴 Senior Citizen
                                </button>
                                <button
                                    onClick={() => {
                                        setDiscountType(discountType === 'pwd' ? 'none' : 'pwd');
                                        if (discountType !== 'pwd') setDiscountCardId(''); // Reset ID if switching
                                    }}
                                    className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all ${discountType === 'pwd'
                                        ? 'bg-coffee-100 border-coffee-500 text-coffee-700'
                                        : 'bg-white border-gray-200 text-gray-500 hover:border-coffee-300 hover:text-coffee-600'
                                        }`}
                                >
                                    ♿ PWD
                                </button>
                            </div>

                            {/* Card ID Input - Only visible if discount selected */}
                            {discountType !== 'none' && (
                                <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                                    <label className="block text-xs font-bold text-gray-700 mb-1">
                                        {discountType === 'senior' ? 'Senior Citizen' : 'PWD'} ID Number <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={discountCardId}
                                        onChange={(e) => setDiscountCardId(e.target.value)}
                                        placeholder="Enter ID Number"
                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-coffee-500 focus:border-coffee-500"
                                    />
                                </div>
                            )}

                            <button className="w-full py-3 border border-dashed rounded-xl hover:border-coffee-500 text-sm font-semibold text-gray-500 hover:text-coffee-700 flex items-center justify-center gap-2">
                                <User className="h-4 w-4" /> Link Customer
                            </button>
                            <button
                                onClick={handleCheckout}
                                disabled={isSavingOrder || (discountType !== 'none' && !discountCardId.trim())}
                                className="w-full py-4 bg-gradient-to-r from-coffee-600 to-coffee-800 hover:from-coffee-700 hover:to-coffee-900 text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <CreditCard className="h-5 w-5" /> <span className="text-lg">Pay ₱{totalAmount.toFixed(2)}</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
            {selectedProduct && (
                <ProductCustomizeModal
                    product={selectedProduct}
                    selectedSize={selectedSize || selectedProduct.sizes[0]}
                    isOpen={customizeModalOpen}
                    onClose={() => setCustomizeModalOpen(false)}
                    onConfirm={handleConfirmCustomization}
                    initialCustomizations={(editingCartIndex !== null && cart[editingCartIndex]) ? cart[editingCartIndex].customizations : undefined}
                    initialQuantity={(editingCartIndex !== null && cart[editingCartIndex]) ? cart[editingCartIndex].quantity : 1}
                />
            )}
            <PaymentModal isOpen={paymentModalOpen} onClose={() => setPaymentModalOpen(false)} totalAmount={totalAmount} onPaymentComplete={handlePaymentComplete} />
        </div>
    );
};

export default POSPage;
