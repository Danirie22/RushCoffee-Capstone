import * as React from 'react';
import { Search, ArrowUpDown, Check, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import ProductCard from '../../components/menu/ProductCard';
import ProductCardSkeleton from '../../components/menu/ProductCardSkeleton';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useProduct } from '../../context/ProductContext';
import ProductCustomizeModal from '../../components/menu/ProductCustomizeModal';
import { Product, ProductSize } from '../../data/mockProducts';
import { Customizations } from '../../context/CartContext';

const sortOptionsList = [
    { value: 'default', label: 'Default' },
    { value: 'price-asc', label: 'Price: Low to High' },
    { value: 'price-desc', label: 'Price: High to Low' },
    { value: 'name-asc', label: 'Name: A-Z' },
    { value: 'name-desc', label: 'Name: Z-A' },
];

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.05,
        },
    },
};

const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
    },
};

const MenuPage: React.FC = () => {
    const { products, isLoading, error } = useProduct();
    const [selectedCategory, setSelectedCategory] = React.useState('All');
    const [searchQuery, setSearchQuery] = React.useState('');
    const [sortOption, setSortOption] = React.useState('default');
    const [isSortMenuOpen, setIsSortMenuOpen] = React.useState(false);
    const sortMenuRef = React.useRef<HTMLDivElement>(null);
    const productsSectionRef = React.useRef<HTMLElement>(null);

    const { addToCart } = useCart();
    const { currentUser } = useAuth();

    const [isCustomizeModalOpen, setIsCustomizeModalOpen] = React.useState(false);
    const [selectedProduct, setSelectedProduct] = React.useState<Product | null>(null);
    const [selectedSize, setSelectedSize] = React.useState<ProductSize | null>(null);

    const handleAddToCart = (product: Product, size: ProductSize) => {
        // Check if product is a drink (customizable)
        const customizableCategories = ['Coffee Based', 'Non Coffee', 'Refreshments', 'Matcha Series'];
        if (customizableCategories.includes(product.category)) {
            setSelectedProduct(product);
            setSelectedSize(size);
            setIsCustomizeModalOpen(true);
        } else {
            addToCart(product, size);
        }
    };

    const handleConfirmCustomization = (customizations: Customizations, quantity: number) => {
        if (selectedProduct && selectedSize) {
            addToCart(selectedProduct, selectedSize, customizations, quantity);
        }
    };

    const categories = React.useMemo(() => {
        if (products.length === 0) return ['All'];
        const uniqueCategories = [...new Set(products.map(p => p.category))];
        return ['All', ...uniqueCategories.sort()];
    }, [products]);

    // Close sort menu on outside click
    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (sortMenuRef.current && !sortMenuRef.current.contains(event.target as Node)) {
                setIsSortMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const filteredAndSortedProducts = React.useMemo(() => {
        let processedProducts = products.filter(product => {
            const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
            const matchesSearch =
                searchQuery.trim() === '' ||
                product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                product.description.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesCategory && matchesSearch;
        });

        const sorted = [...processedProducts];
        switch (sortOption) {
            case 'price-asc':
                sorted.sort((a, b) => a.sizes[0].price - b.sizes[0].price);
                break;
            case 'price-desc':
                sorted.sort((a, b) => b.sizes[0].price - a.sizes[0].price);
                break;
            case 'name-asc':
                sorted.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'name-desc':
                sorted.sort((a, b) => b.name.localeCompare(a.name));
                break;
            default:
                break;
        }

        return sorted;
    }, [selectedCategory, searchQuery, products, sortOption]);

    return (
        <div className="flex min-h-screen flex-col bg-white">
            <Header />
            <main>
                {/* Hero Section */}
                <section className="relative flex min-h-[40vh] items-center justify-center bg-coffee-900 px-6 py-16 text-center text-white">
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=2574&auto=format&fit=crop')] bg-cover bg-center opacity-20"></div>
                    <div className="absolute inset-0 bg-gradient-to-b from-coffee-900/80 to-coffee-900/90"></div>

                    <div className="container relative z-40 mx-auto max-w-4xl">
                        <h1 className="font-display text-4xl font-bold md:text-5xl">Our Menu</h1>
                        <p className="mt-2 text-lg text-gray-200">Discover your perfect cup ☕</p>

                        <div className="mx-auto mt-8 flex max-w-2xl gap-3">
                            <div className="relative flex-grow">
                                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    placeholder="Search for coffee, matcha..."
                                    className="w-full rounded-full border-0 bg-white/10 py-3 pl-12 pr-4 text-white placeholder:text-gray-400 ring-1 ring-white/20 transition focus:bg-white/20 focus:ring-2 focus:ring-primary-500"
                                />
                            </div>

                            {/* Sort Dropdown */}
                            <div className="relative shrink-0" ref={sortMenuRef}>
                                <button
                                    onClick={() => setIsSortMenuOpen(!isSortMenuOpen)}
                                    className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm ring-1 ring-white/20 transition hover:bg-white/20"
                                    aria-haspopup="true"
                                    aria-expanded={isSortMenuOpen}
                                    aria-label="Sort products"
                                >
                                    <ArrowUpDown className="h-5 w-5" />
                                </button>
                                <div
                                    className={`absolute right-0 top-full z-[100] mt-2 w-56 origin-top-right rounded-xl border border-gray-100 bg-white p-1 shadow-xl ring-1 ring-black ring-opacity-5 transition-all duration-200 ease-out ${isSortMenuOpen
                                        ? 'opacity-100 scale-100'
                                        : 'opacity-0 scale-95 pointer-events-none'
                                        }`}
                                    role="menu"
                                    aria-orientation="vertical"
                                >
                                    <div className="py-1" role="none">
                                        {sortOptionsList.map((option) => (
                                            <button
                                                key={option.value}
                                                onClick={() => {
                                                    setSortOption(option.value);
                                                    setIsSortMenuOpen(false);
                                                }}
                                                className={`flex w-full items-center justify-between rounded-lg px-4 py-2.5 text-sm text-left font-medium transition-colors ${sortOption === option.value
                                                    ? 'bg-primary-50 text-primary-700'
                                                    : 'text-gray-700 hover:bg-gray-50'
                                                    }`}
                                                role="menuitem"
                                            >
                                                <span>{option.label}</span>
                                                {sortOption === option.value && (
                                                    <Check className="h-4 w-4" />
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Category Filters */}
                <div className="sticky top-16 z-20 border-b border-gray-200 bg-white/95 py-3 backdrop-blur-sm sm:top-20">
                    <div className="container mx-auto flex max-w-7xl gap-2 overflow-x-auto px-6 pb-2">
                        {categories.map(category => (
                            <button
                                key={category}
                                onClick={() => {
                                    setSelectedCategory(category);
                                    productsSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
                                }}
                                className={`flex-shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${selectedCategory === category
                                    ? 'bg-primary-600 text-white shadow'
                                    : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-100'
                                    }`}
                            >
                                {category}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Products Grid */}
                <section ref={productsSectionRef} className="bg-gray-50 px-6 py-8 scroll-mt-36">
                    <div className="container mx-auto max-w-7xl">
                        {isLoading ? (
                            <div className="grid grid-cols-2 gap-4 sm:gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                                {Array.from({ length: 8 }).map((_, index) => (
                                    <ProductCardSkeleton key={index} />
                                ))}
                            </div>
                        ) : error ? (
                            <div className="flex flex-col items-center justify-center rounded-lg border border-red-200 bg-red-50 py-20 text-center text-red-700">
                                <AlertCircle className="h-16 w-16" />
                                <h3 className="mt-4 text-xl font-semibold">Oops! Something went wrong.</h3>
                                <p className="mt-2">{error}</p>
                            </div>
                        ) : filteredAndSortedProducts.length > 0 ? (
                            <motion.div
                                className="grid grid-cols-2 gap-4 sm:gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                            >
                                {filteredAndSortedProducts.map(product => (
                                    <motion.div key={product.id} variants={itemVariants} layout className="flex">
                                        <ProductCard
                                            product={product}
                                            onAddToCart={handleAddToCart}
                                            onProductClick={(product, size) => {
                                                setSelectedProduct(product);
                                                setSelectedSize(size);
                                                setIsCustomizeModalOpen(true);
                                            }}
                                            isLoggedIn={!!currentUser}
                                        />
                                    </motion.div>
                                ))}
                            </motion.div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 text-center">
                                <Search className="h-24 w-24 text-gray-300" />
                                <h3 className="mt-4 text-xl font-semibold text-gray-800">No products found</h3>
                                <p className="mt-2 text-gray-500">Try adjusting your filters or search query.</p>
                            </div>
                        )}
                    </div>
                </section>
            </main>

            <Footer />
            {selectedProduct && selectedSize && (
                <ProductCustomizeModal
                    product={selectedProduct}
                    selectedSize={selectedSize}
                    isOpen={isCustomizeModalOpen}
                    onClose={() => setIsCustomizeModalOpen(false)}
                    onConfirm={handleConfirmCustomization}
                />
            )}
        </div>
    );
};

export default MenuPage;