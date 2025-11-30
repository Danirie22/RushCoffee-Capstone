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
import { useSpeech } from '../../hooks/useSpeech';

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
    const { speak } = useSpeech();

    const [isCustomizeModalOpen, setIsCustomizeModalOpen] = React.useState(false);
    const [selectedProduct, setSelectedProduct] = React.useState<Product | null>(null);
    const [selectedSize, setSelectedSize] = React.useState<ProductSize | null>(null);
    const [initialQuantity, setInitialQuantity] = React.useState(1);

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

    // Helper to parse voice term for quantity, size, and product
    const parseOrderTerm = (term: string) => {
        let lowerTerm = term.toLowerCase();
        let quantity = 1;
        let targetSizeName = '';

        // 1. Parse Quantity
        const numberMap: { [key: string]: number } = {
            'one': 1, 'isa': 1, 'isang': 1,
            'two': 2, 'dalawa': 2, 'dalawang': 2,
            'three': 3, 'tatlo': 3, 'tatlong': 3,
            'four': 4, 'apat': 4, 'apat na': 4,
            'five': 5, 'lima': 5, 'limang': 5,
            'six': 6, 'anim': 6, 'anim na': 6,
            'seven': 7, 'pito': 7, 'pitong': 7,
            'eight': 8, 'walo': 8, 'walong': 8,
            'nine': 9, 'siyam': 9, 'siyam na': 9,
            'ten': 10, 'sampu': 10, 'sampung': 10,
        };

        const digitMatch = lowerTerm.match(/(\d+)/);
        if (digitMatch) {
            quantity = parseInt(digitMatch[0]);
            lowerTerm = lowerTerm.replace(digitMatch[0], '').trim();
        } else {
            for (const [word, val] of Object.entries(numberMap)) {
                const regex = new RegExp(`\\b${word}\\b`, 'i');
                if (regex.test(lowerTerm)) {
                    quantity = val;
                    lowerTerm = lowerTerm.replace(regex, '').trim();
                    break;
                }
            }
        }

        // 2. Parse Size
        if (lowerTerm.match(/\b(venti|large|malaki|22oz|big)\b/)) {
            targetSizeName = 'Venti';
            lowerTerm = lowerTerm.replace(/\b(venti|large|malaki|22oz|big)\b/g, '').trim();
        } else if (lowerTerm.match(/\b(grande|medium|regular|16oz|small|maliit)\b/)) {
            targetSizeName = 'Grande';
            lowerTerm = lowerTerm.replace(/\b(grande|medium|regular|16oz|small|maliit)\b/g, '').trim();
        } else if (lowerTerm.match(/\b(combo|meal|with drink)\b/)) {
            targetSizeName = 'Combo Meal';
            lowerTerm = lowerTerm.replace(/\b(combo|meal|with drink)\b/g, '').trim();
        } else if (lowerTerm.match(/\b(ala carte|solo|fries only)\b/)) {
            targetSizeName = 'Ala Carte';
            lowerTerm = lowerTerm.replace(/\b(ala carte|solo|fries only)\b/g, '').trim();
        }

        // Clean up
        lowerTerm = lowerTerm.replace(/\s+/g, ' ').trim();
        const fillers = ['please', 'paki', 'ng', 'sa', 'ang', 'yung', 'po', 'order', 'want', 'get', 'have', 'ko'];
        const words = lowerTerm.split(' ');
        const filteredWords = words.filter(w => !fillers.includes(w));
        const cleanTerm = filteredWords.join(' ');

        // 3. Find Product
        let foundProduct = products.find(p => p.name.toLowerCase() === cleanTerm);

        if (!foundProduct) {
            foundProduct = products.find(p =>
                p.name.toLowerCase().includes(cleanTerm) ||
                p.aliases?.some(alias => alias.toLowerCase().includes(cleanTerm))
            );
        }

        if (!foundProduct && cleanTerm !== lowerTerm) {
            foundProduct = products.find(p =>
                p.name.toLowerCase().includes(lowerTerm) ||
                p.aliases?.some(alias => alias.toLowerCase().includes(lowerTerm))
            );
        }

        return { foundProduct, quantity, targetSizeName, cleanTerm };
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

        // 1. Check for Category Switching
        const sortedKeys = Object.keys(categoryMap).sort((a, b) => b.length - a.length);
        const matchedCategoryKey = sortedKeys.find(key => lowerTerm.includes(key));
        if (matchedCategoryKey) {
            const categoryName = categoryMap[matchedCategoryKey];
            setSelectedCategory(categoryName);
            setSearchQuery('');
            productsSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
            speak(`Showing ${categoryName} menu.`);
            return;
        }

        // 2. Smart Product Matching with Quantity/Size
        const { foundProduct, quantity, targetSizeName } = parseOrderTerm(term);

        if (foundProduct) {
            setSelectedProduct(foundProduct);

            // Determine size
            let sizeToUse = foundProduct.sizes[0];
            if (targetSizeName) {
                const matchedSize = foundProduct.sizes.find(s => s.name === targetSizeName);
                if (matchedSize) sizeToUse = matchedSize;
            }

            setSelectedSize(sizeToUse);
            setInitialQuantity(quantity);
            setIsCustomizeModalOpen(true);
            setSearchQuery('');
            speak(`I found ${foundProduct.name}. How would you like that?`);
            return;
        }

        // 3. Fallback to Standard Search
        speak(`Searching for ${term}`);
        setSearchQuery(term);
        productsSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleVoiceCommand = (command: string, term: string) => {
        const lowerTerm = term.toLowerCase();
        console.log('Voice command received:', command, 'Term:', lowerTerm);

        // Check for Category Switching
        const sortedKeys = Object.keys(categoryMap).sort((a, b) => b.length - a.length);
        const matchedKey = sortedKeys.find(key => lowerTerm === key || lowerTerm.includes(key));

        if (matchedKey) {
            const categoryName = categoryMap[matchedKey];
            setSelectedCategory(categoryName);
            setSearchQuery('');
            productsSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
            speak(`Here is our ${categoryName} menu.`);
            return;
        }

        if (command === 'order') {
            const { foundProduct, quantity, targetSizeName } = parseOrderTerm(term);

            if (foundProduct) {
                // Determine size
                let sizeToUse = foundProduct.sizes[0];
                if (targetSizeName) {
                    const matchedSize = foundProduct.sizes.find(s => s.name === targetSizeName);
                    if (matchedSize) sizeToUse = matchedSize;
                }

                // For customizable items, open modal with pre-filled values
                setSelectedProduct(foundProduct);
                setSelectedSize(sizeToUse);
                setInitialQuantity(quantity);
                setIsCustomizeModalOpen(true);
                setSearchQuery('');
                speak(`I've selected ${quantity} ${foundProduct.name}. You can customize it now.`);
            } else {
                speak(`Sorry, I couldn't find ${term} on the menu.`);
                setSearchQuery(term);
                productsSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
            }
        } else {
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
                    initialQuantity={initialQuantity}
                />
            )}
        </div>
    );
};

export default MenuPage;