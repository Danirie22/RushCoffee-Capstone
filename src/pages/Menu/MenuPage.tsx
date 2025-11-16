
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
                <section className="bg-gradient-to-r from-primary-50 to-coffee-50 px-6 py-12 text-center">
                    <div className="container mx-auto max-w-4xl">
                        <h1 className="font-display text-4xl font-bold text-coffee-900 md:text-5xl">Our Menu</h1>
                        <p className="mt-2 text-lg text-gray-600">Discover your perfect cup ☕</p>
                        <div className="mx-auto mt-6 flex max-w-2xl flex-col items-center gap-4 sm:flex-row">
                            <div className="relative w-full flex-grow">
                                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    placeholder="Search for coffee, matcha..."
                                    className="w-full rounded-full border border-gray-300 py-3 pl-12 pr-4 text-gray-700 placeholder:text-gray-400 shadow-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500"
                                />
                            </div>
                           
                            {/* Sort Dropdown */}
                            <div className="relative flex w-full justify-end sm:w-auto sm:justify-start" ref={sortMenuRef}>
                                <button
                                    onClick={() => setIsSortMenuOpen(!isSortMenuOpen)}
                                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-primary-600 bg-white shadow-sm transition-colors hover:bg-primary-50"
                                    aria-haspopup="true"
                                    aria-expanded={isSortMenuOpen}
                                    aria-label="Sort products"
                                >
                                    <ArrowUpDown className="h-5 w-5 text-gray-500" />
                                </button>
                                <div
                                    className={`absolute right-0 top-full z-40 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none transition-all duration-200 ease-out ${
                                        isSortMenuOpen
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
                                                className={`flex w-full items-center justify-between px-4 py-2 text-sm text-left font-medium transition-colors ${
                                                    sortOption === option.value
                                                        ? 'bg-primary-50 text-primary-600'
                                                        : 'text-gray-700 hover:bg-gray-100'
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
                <div className="sticky top-20 z-30 border-b border-gray-200 bg-white/95 py-3 backdrop-blur-sm">
                    <div className="container mx-auto flex max-w-7xl gap-2 overflow-x-auto px-6 pb-2">
                        {categories.map(category => (
                            <button
                                key={category}
                                onClick={() => {
                                    setSelectedCategory(category);
                                    productsSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
                                }}
                                className={`flex-shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                                    selectedCategory === category
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
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
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
                                className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                            >
                                {filteredAndSortedProducts.map(product => (
                                    <motion.div key={product.id} variants={itemVariants} layout className="flex">
                                        <ProductCard
                                            product={product}
                                            onAddToCart={addToCart}
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
        </div>
    );
};

export default MenuPage;