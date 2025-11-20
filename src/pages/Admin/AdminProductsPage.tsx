import React, { useState, useMemo } from 'react';
import { useProduct } from '../../context/ProductContext';
import { Loader2, Plus, Edit, Trash2, AlertCircle, Search, Coffee, Snowflake, Leaf, Apple, UtensilsCrossed, Package, AlertTriangle, XCircle, Star } from 'lucide-react';
import ProductFormModal from '../../components/admin/ProductFormModal';
import { Product } from '../../data/mockProducts';
import { useCart } from '../../context/CartContext';
import { div } from 'framer-motion/client';

type ProductCategory = 'All' | 'Coffee Based' | 'Non-Coffee Based' | 'Matcha Series' | 'Refreshments' | 'Meals';

const AdminProductsPage: React.FC = () => {
    const { products, isLoading, error, deleteProduct } = useProduct();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [productToEdit, setProductToEdit] = useState<Product | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<ProductCategory>('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState<'all' | 'lowStock' | 'outOfStock' | 'popular'>('all');
    const { showToast } = useCart();

    // Category metadata
    const categoryMetadata: Record<ProductCategory, { icon: any; color: string; bgColor: string }> = {
        'All': { icon: Package, color: 'text-gray-700', bgColor: 'bg-gray-100' },
        'Coffee Based': { icon: Coffee, color: 'text-amber-700', bgColor: 'bg-amber-50' },
        'Non-Coffee Based': { icon: Snowflake, color: 'text-blue-700', bgColor: 'bg-blue-50' },
        'Matcha Series': { icon: Leaf, color: 'text-green-700', bgColor: 'bg-green-50' },
        'Refreshments': { icon: Apple, color: 'text-pink-700', bgColor: 'bg-pink-50' },
        'Meals': { icon: UtensilsCrossed, color: 'text-orange-700', bgColor: 'bg-orange-50' },
    };

    // Filter products
    const filteredProducts = useMemo(() => {
        let filtered = products;

        // Apply category filter
        if (selectedCategory !== 'All') {
            filtered = filtered.filter(p => p.category === selectedCategory);
        }

        // Apply special filters from stat cards
        if (activeFilter === 'lowStock') {
            filtered = filtered.filter(p => p.stock > 0 && p.stock <= 20);
        } else if (activeFilter === 'outOfStock') {
            filtered = filtered.filter(p => p.stock === 0);
        } else if (activeFilter === 'popular') {
            filtered = filtered.filter(p => p.popular);
        }

        // Apply search filter
        if (searchQuery.trim()) {
            filtered = filtered.filter(p =>
                p.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        return filtered;
    }, [products, selectedCategory, searchQuery, activeFilter]);

    const categories: ProductCategory[] = ['All', 'Coffee Based', 'Non-Coffee Based', 'Matcha Series', 'Refreshments', 'Meals'];

    const getCategoryCount = (category: ProductCategory) => {
        if (category === 'All') return products.length;
        return products.filter(p => p.category === category).length;
    };

    const getLowStockCount = (category: ProductCategory) => {
        const items = category === 'All' ? products : products.filter(p => p.category === category);
        return items.filter(p => p.stock > 0 && p.stock <= 20).length;
    };

    const handleStatCardClick = (filter: 'all' | 'lowStock' | 'outOfStock' | 'popular') => {
        setActiveFilter(filter);
        setSelectedCategory('All'); // Reset category when clicking stat cards
    };

    const handleOpenModal = (product: Product | null = null) => {
        setProductToEdit(product);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setProductToEdit(null);
    };

    const handleDelete = async (productId: string, productName: string) => {
        if (window.confirm(`Are you sure you want to delete "${productName}"?`)) {
            try {
                await deleteProduct(productId);
                showToast(`"${productName}" has been deleted.`);
            } catch (e) {
                showToast(`Failed to delete "${productName}".`);
            }
        }
    };

    if (isLoading) {
        return <div className="flex h-full items-center justify-center"><Loader2 className="h-12 w-12 animate-spin text-primary-600" /></div>;
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center rounded-lg border border-red-200 bg-red-50 py-20 text-center text-red-700">
                <AlertCircle className="h-16 w-16" />
                <h3 className="mt-4 text-xl font-semibold">Oops! Something went wrong.</h3>
                <p className="mt-2">{error}</p>
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
                <h1 className="font-display text-2xl font-bold text-gray-800 sm:text-3xl">Product Management</h1>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center justify-center gap-2 rounded-full bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-700 sm:w-auto"
                >
                    <Plus className="h-4 w-4" />
                    <span>Add New Product</span>
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-4 mb-6 sm:grid-cols-4">
                <button
                    onClick={() => handleStatCardClick('all')}
                    className={`bg-white rounded-lg border p-4 shadow-sm transition-all hover:shadow-md cursor-pointer text-left ${activeFilter === 'all' ? 'ring-2 ring-primary-600' : ''
                        }`}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Products</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">{products.length}</p>
                        </div>
                        <Package className="h-10 w-10 text-primary-600 opacity-75" />
                    </div>
                </button>
                <button
                    onClick={() => handleStatCardClick('lowStock')}
                    className={`bg-white rounded-lg border p-4 shadow-sm transition-all hover:shadow-md cursor-pointer text-left ${activeFilter === 'lowStock' ? 'ring-2 ring-yellow-600' : ''
                        }`}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Low Stock</p>
                            <p className="text-2xl font-bold text-yellow-600 mt-1">{getLowStockCount('All')}</p>
                        </div>
                        <AlertTriangle className="h-10 w-10 text-yellow-600 opacity-75" />
                    </div>
                </button>
                <button
                    onClick={() => handleStatCardClick('outOfStock')}
                    className={`bg-white rounded-lg border p-4 shadow-sm transition-all hover:shadow-md cursor-pointer text-left ${activeFilter === 'outOfStock' ? 'ring-2 ring-red-600' : ''
                        }`}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Out of Stock</p>
                            <p className="text-2xl font-bold text-red-600 mt-1">{products.filter(p => p.stock === 0).length}</p>
                        </div>
                        <XCircle className="h-10 w-10 text-red-600 opacity-75" />
                    </div>
                </button>
                <button
                    onClick={() => handleStatCardClick('popular')}
                    className={`bg-white rounded-lg border p-4 shadow-sm transition-all hover:shadow-md cursor-pointer text-left ${activeFilter === 'popular' ? 'ring-2 ring-green-600' : ''
                        }`}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Popular Items</p>
                            <p className="text-2xl font-bold text-green-600 mt-1">{products.filter(p => p.popular).length}</p>
                        </div>
                        <Star className="h-10 w-10 text-green-600 opacity-75" />
                    </div>
                </button>
            </div>

            {/* Search Bar */}
            <div className="mb-6">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full rounded-lg border bg-white pl-10 pr-4 py-2.5 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500 focus:ring-opacity-20"
                    />
                </div>
            </div>

            {/* Category Tabs */}
            <div className="mb-6 overflow-x-auto py-1">
                <div className="flex gap-2 pb-2 px-1">
                    {categories.map((category) => {
                        const count = getCategoryCount(category);
                        const lowStockCount = getLowStockCount(category);
                        const isActive = selectedCategory === category;
                        const meta = categoryMetadata[category];
                        const CategoryIcon = meta.icon;

                        return (
                            <button
                                key={category}
                                onClick={() => {
                                    setSelectedCategory(category);
                                    setActiveFilter('all'); // Reset stat filter when clicking category
                                }}
                                className={`flex-shrink-0 flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all ${isActive
                                    ? 'bg-primary-600 text-white shadow-md scale-105'
                                    : `${meta.bgColor} ${meta.color} hover:shadow-md hover:scale-102`
                                    }`}
                            >
                                <CategoryIcon className="h-4 w-4" />
                                <span>{category}</span>
                                {count > 0 && (
                                    <span className={`inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-xs font-bold ${isActive ? 'bg-white bg-opacity-25' : 'bg-white bg-opacity-50'
                                        }`}>
                                        {count}
                                    </span>
                                )}
                                {lowStockCount > 0 && (
                                    <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-xs font-bold bg-yellow-500 text-white">
                                        ⚠ {lowStockCount}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-lg border bg-white shadow-sm">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Product</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Category</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Price (G/V)</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Stock</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
                            <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                        {filteredProducts.map((product) => (
                            <tr key={product.id} className="hover:bg-gray-50">
                                <td className="whitespace-nowrap px-6 py-4">
                                    <div className="flex items-center">
                                        <div className="h-10 w-10 flex-shrink-0">
                                            <img className="h-10 w-10 rounded-full object-cover" src={product.imageUrl} alt={product.name} />
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-gray-900 flex items-center gap-2">
                                                {product.name}
                                                {product.popular && <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />}
                                                {product.new && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">NEW</span>}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{product.category}</td>
                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                    ₱{product.sizes[0].price.toFixed(2)} / ₱{product.sizes[1].price.toFixed(2)}
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-sm">
                                    <span className={`font-semibold ${product.stock === 0 ? 'text-red-600' : product.stock <= 20 ? 'text-yellow-600' : 'text-gray-900'}`}>
                                        {product.stock}
                                    </span>
                                </td>
                                <td className="whitespace-nowrap px-6 py-4">
                                    {product.available ? (
                                        <span className="inline-flex rounded-full bg-green-100 px-2 text-xs font-semibold leading-5 text-green-800">Available</span>
                                    ) : (
                                        <span className="inline-flex rounded-full bg-red-100 px-2 text-xs font-semibold leading-5 text-red-800">Unavailable</span>
                                    )}
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                                    <button onClick={() => handleOpenModal(product)} className="p-1 text-primary-600 hover:text-primary-800"><Edit className="h-4 w-4" /></button>
                                    <button onClick={() => handleDelete(product.id, product.name)} className="ml-2 p-1 text-red-600 hover:text-red-800"><Trash2 className="h-4 w-4" /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <ProductFormModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                productToEdit={productToEdit}
            />
        </div>
    );
};

export default AdminProductsPage;
