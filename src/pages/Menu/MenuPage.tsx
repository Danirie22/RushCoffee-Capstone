import * as React from 'react';
import { Search, ArrowUpDown, Check, AlertCircle, X } from 'lucide-react';
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
import VoiceSearch from '../../components/common/VoiceSearch';

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
    visible: { y: 0, opacity: 1 },
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

    const handleConfirmCustomization = (customizations: Customizations, quantity: number, totalPrice?: number, size?: ProductSize) => {
        if (selectedProduct && (size || selectedSize)) {
            // Use the size from the modal if available, otherwise fallback to the initially selected size
            const finalSize = size || selectedSize;
            if (finalSize) {
                addToCart(selectedProduct, finalSize, customizations, quantity);
            }
        }
    };

    // Shared Category Map
    const categoryMap: { [key: string]: string } = {
        'all': 'All',
        'lahat': 'All', // Tagalog
        'everything': 'All',
        'coffee': 'Coffee Based',
        'coffee based': 'Coffee Based',
        'kape': 'Coffee Based', // Tagalog
        'non coffee': 'Non-Coffee Based',
        'non-coffee': 'Non-Coffee Based',
        'non coffee based': 'Non-Coffee Based',
        'noncoffee': 'Non-Coffee Based',
        'hindi kape': 'Non-Coffee Based', // Tagalog
        'matcha': 'Matcha Series',
        'matcha series': 'Matcha Series',
        'refreshment': 'Refreshments',
        'refreshments': 'Refreshments',
        'inumin': 'Refreshments', // Tagalog
        'pampalamig': 'Refreshments', // Tagalog
        'meal': 'Meals',
        'meals': 'Meals',
        'food': 'Meals',
        'snack': 'Meals',
        'pagkain': 'Meals', // Tagalog
        'meryenda': 'Meals', // Tagalog
    };

    const handleVoiceSearch = (term: string) => {
        const lowerTerm = term.toLowerCase();

        // 1. Check for Category Switching (Exact or Partial Match)
        // We check if any category key is present in the sentence
        // Sort keys by length (longest first) to match more specific terms first
        const sortedKeys = Object.keys(categoryMap).sort((a, b) => b.length - a.length);
        const matchedCategoryKey = sortedKeys.find(key => lowerTerm.includes(key));
        if (matchedCategoryKey) {
            setSelectedCategory(categoryMap[matchedCategoryKey]);
            setSearchQuery('');
            productsSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
            return;
        }

        // 2. Check for Product Match (Smart Matching)
        // Check if any product name or alias is present in the sentence
        const foundProduct = products.find(p =>
            lowerTerm.includes(p.name.toLowerCase()) ||
            p.aliases?.some(alias => lowerTerm.includes(alias.toLowerCase()))
        );

        if (foundProduct) {
            setSelectedProduct(foundProduct);
            setSelectedSize(foundProduct.sizes[0]);
            setIsCustomizeModalOpen(true);
            setSearchQuery('');
            return;
        }

        // 3. Fallback to Standard Search
        setSearchQuery(term);
        productsSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleVoiceCommand = (command: string, term: string) => {
        const lowerTerm = term.toLowerCase();
        console.log('Voice command received:', command, 'Term:', lowerTerm);

        // Check for Category Switching using sorted keys (longest first)
        const sortedKeys = Object.keys(categoryMap).sort((a, b) => b.length - a.length);
        const matchedKey = sortedKeys.find(key => lowerTerm === key || lowerTerm.includes(key));

        if (matchedKey) {
            console.log('Matched category key:', matchedKey, '-> Category:', categoryMap[matchedKey]);
            setSelectedCategory(categoryMap[matchedKey]);
            setSearchQuery('');
            productsSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
            return;
        }

        if (command === 'order') {
            // Find the product
            const foundProduct = products.find(p =>
                p.name.toLowerCase().includes(lowerTerm) ||
                p.aliases?.some(alias => alias.toLowerCase().includes(lowerTerm))
            );

            if (foundProduct) {
                // Use handleAddToCart logic to determine if we should open modal or add directly
                // Default size to first available size if adding directly
                handleAddToCart(foundProduct, foundProduct.sizes[0]);
                setSearchQuery(''); // Clear search
            } else {
                // If not found, just search for it
                setSearchQuery(term);
                productsSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
            }
        } else {
            // Default search behavior if not an explicit "order" command but passed here
            setSearchQuery(term);
            productsSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
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
                product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                product.aliases?.some(alias => alias.toLowerCase().includes(searchQuery.toLowerCase()));
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
                <section className="relative flex min-h-[40vh] items-center justify-center bg-primary-900 px-6 py-16 text-center text-white">
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=2574&auto=format&fit=crop')] bg-cover bg-center opacity-20"></div>
                    <div className="absolute inset-0 bg-gradient-to-b from-primary-900/80 to-primary-900/90"></div>

                    <div className="container relative z-40 mx-auto max-w-4xl animate-fade-in-up">
                        <h1 className="font-display text-4xl font-bold md:text-5xl">Our Menu</h1>
                        <p className="mt-2 text-lg text-gray-200">Discover your perfect cup ☕</p>

                        <div className="mx-auto mt-8 flex max-w-2xl gap-3 items-center">
                            <div className="relative flex-grow">
                                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    placeholder="Search for coffee, matcha..."
                                    className="w-full rounded-full border-0 bg-white/10 py-3 pl-12 pr-10 text-white placeholder:text-gray-400 ring-1 ring-white/20 transition focus:bg-white/20 focus:ring-2 focus:ring-primary-500"
                                />
                                {searchQuery && (
                                    <button
                                        onClick={() => setSearchQuery('')}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-gray-400 hover:bg-white/10 hover:text-white"
                                        title="Clear search"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                )}
                            </div>

                            {/* Voice Search */}
                            <VoiceSearch
                                onSearch={handleVoiceSearch}
                                onCommand={handleVoiceCommand}
                            />

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