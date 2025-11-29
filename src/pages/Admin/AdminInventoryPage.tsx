import React, { useState, useEffect } from 'react';
// FIX: Use compat import for v8 syntax.
import firebase from 'firebase/compat/app';
import { db } from '../../firebaseConfig';
import { Loader2, Package, AlertTriangle, CheckCircle, XCircle, Plus, Search, Coffee, Milk, Droplet, Sparkles, Cookie, Leaf, Apple, Beer, Snowflake, Drumstick, Box, Calendar, Package2, RefreshCw } from 'lucide-react';
import UpdateStockModal from '../../components/admin/UpdateStockModal';
import AddIngredientModal from '../../components/admin/AddIngredientModal';
import { mockIngredients, IngredientData, IngredientCategory } from '../../data/mockIngredients';
import { useCart } from '../../context/CartContext';
import { seedCustomizationOptions } from '../../utils/seedCustomizationOptions';
import { useAuth } from '../../context/AuthContext';

export interface Ingredient {
    id: string;
    name: string;
    category: IngredientCategory;
    stock: number;
    unit: string;
    lowStockThreshold: number;
    // Enhanced fields for customization system
    isTopping?: boolean;
    toppingPrice?: number;
    portionSize?: number;
    expirationDate?: string;
    createdAt?: string;
}

const AdminInventoryPage: React.FC = () => {
    const [ingredients, setIngredients] = useState<Ingredient[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedIngredient, setSelectedIngredient] = useState<Ingredient | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<IngredientCategory | 'All'>('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState<'all' | 'lowStock' | 'outOfStock' | 'newAdded'>('all');
    const { showToast } = useCart();
    const { currentUser } = useAuth();
    const isAdmin = currentUser?.role === 'admin';

    // Category metadata with icons and colors
    const categoryMetadata: Record<IngredientCategory | 'All', { icon: any; color: string; bgColor: string }> = {
        'All': { icon: Package, color: 'text-gray-700', bgColor: 'bg-gray-100' },
        'Coffee & Beans': { icon: Coffee, color: 'text-amber-700', bgColor: 'bg-amber-50' },
        'Dairy': { icon: Milk, color: 'text-blue-700', bgColor: 'bg-blue-50' },
        'Sauces': { icon: Droplet, color: 'text-red-700', bgColor: 'bg-red-50' },
        'Syrups': { icon: Droplet, color: 'text-purple-700', bgColor: 'bg-purple-50' },
        'Specialty': { icon: Sparkles, color: 'text-yellow-700', bgColor: 'bg-yellow-50' },
        'Matcha & Tea': { icon: Leaf, color: 'text-green-700', bgColor: 'bg-green-50' },
        'Fruits & Purees': { icon: Apple, color: 'text-pink-700', bgColor: 'bg-pink-50' },
        'Beverages': { icon: Beer, color: 'text-cyan-700', bgColor: 'bg-cyan-50' },
        'Frozen': { icon: Snowflake, color: 'text-blue-600', bgColor: 'bg-blue-50' },
        'Proteins': { icon: Drumstick, color: 'text-orange-700', bgColor: 'bg-orange-50' },
        'Dry Goods': { icon: Box, color: 'text-stone-700', bgColor: 'bg-stone-50' },
        'Supplies & Packaging': { icon: Package2, color: 'text-indigo-700', bgColor: 'bg-indigo-50' },
    };

    // Filter ingredients by category and search
    const filteredIngredients = React.useMemo(() => {
        let filtered = ingredients;

        // Filter by category
        if (selectedCategory !== 'All') {
            filtered = filtered.filter(ing => ing.category === selectedCategory);
        }

        // Apply special filters from stat cards
        if (activeFilter === 'lowStock') {
            filtered = filtered.filter(ing => ing.stock > 0 && ing.stock <= ing.lowStockThreshold);
        } else if (activeFilter === 'outOfStock') {
            filtered = filtered.filter(ing => ing.stock === 0);
        } else if (activeFilter === 'newAdded') {
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            filtered = filtered.filter(ing => ing.createdAt && new Date(ing.createdAt) >= sevenDaysAgo);
        }

        // Filter by search query
        if (searchQuery.trim()) {
            filtered = filtered.filter(ing =>
                ing.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        return filtered;
    }, [ingredients, selectedCategory, searchQuery, activeFilter]);

    // Get category stats
    const categories: Array<IngredientCategory | 'All'> = [
        'All',
        'Coffee & Beans',
        'Dairy',
        'Sauces',
        'Syrups',
        'Specialty',
        'Matcha & Tea',
        'Fruits & Purees',
        'Beverages',
        'Frozen',
        'Proteins',
        'Dry Goods',
        'Supplies & Packaging',
    ];

    const getCategoryCount = (category: IngredientCategory | 'All') => {
        if (category === 'All') return ingredients.length;
        return ingredients.filter(ing => ing.category === category).length;
    };

    const getLowStockCount = (category: IngredientCategory | 'All') => {
        const categoryItems = category === 'All'
            ? ingredients
            : ingredients.filter(ing => ing.category === category);
        return categoryItems.filter(ing => ing.stock > 0 && ing.stock <= ing.lowStockThreshold).length;
    };

    const handleStatCardClick = (filter: 'all' | 'lowStock' | 'outOfStock' | 'newAdded') => {
        setActiveFilter(filter);
        setSelectedCategory('All'); // Reset category when clicking stat cards
    };

    const getStockStatus = (item: Ingredient) => {
        if (item.stock === 0) {
            return { text: 'Out of Stock', color: 'text-red-600', Icon: XCircle };
        } else if (item.stock <= item.lowStockThreshold) {
            return { text: 'Low Stock', color: 'text-yellow-600', Icon: AlertTriangle };
        } else {
            return { text: 'In Stock', color: 'text-green-600', Icon: CheckCircle };
        }
    };

    // Check for expiring ingredients (within 7 days)
    const expiringIngredients = ingredients.filter(ing => {
        if (!ing.expirationDate) return false;
        const today = new Date();
        const expDate = new Date(ing.expirationDate);
        const diffTime = expDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 7; // Include expired items (negative days)
    });

    // Check for low stock ingredients
    const lowStockIngredients = ingredients.filter(ing => ing.stock > 0 && ing.stock <= ing.lowStockThreshold);

    // Check for out of stock ingredients
    const outOfStockIngredients = ingredients.filter(ing => ing.stock === 0);

    // Check for new ingredients (added in last 7 days)
    const newIngredients = ingredients.filter(ing => {
        if (!ing.createdAt) return false;
        const date = new Date(ing.createdAt);
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        return date >= sevenDaysAgo;
    });

    useEffect(() => {
        const seedAndFetch = async () => {
            const ingredientsCollectionRef = db.collection("ingredients");
            const initialSnapshot = await ingredientsCollectionRef.get();

            // Check for missing ingredients and seed them
            const existingIds = new Set(initialSnapshot.docs.map(doc => doc.id));
            const batch = db.batch();
            let hasUpdates = false;

            // Seed missing ingredients
            mockIngredients.forEach(ingredient => {
                if (!existingIds.has(ingredient.id)) {
                    console.log(`Seeding missing ingredient: ${ingredient.name}`);
                    const { id, ...data } = ingredient; // Destructure to separate id from data
                    const docRef = ingredientsCollectionRef.doc(id); // Use the specified id
                    batch.set(docRef, data);
                    hasUpdates = true;
                }
            });

            // Backfill expiration dates and createdAt for existing ingredients if missing
            initialSnapshot.docs.forEach(doc => {
                const data = doc.data();
                const updates: any = {};

                if (!data.expirationDate) {
                    // Set default expiration to 30 days from now
                    const defaultExpiration = new Date();
                    defaultExpiration.setDate(defaultExpiration.getDate() + 30);
                    updates.expirationDate = defaultExpiration.toISOString().split('T')[0];
                }

                if (!data.createdAt) {
                    // Backfill createdAt to today for existing items
                    updates.createdAt = new Date().toISOString();
                }

                if (Object.keys(updates).length > 0) {
                    batch.update(doc.ref, updates);
                    hasUpdates = true;
                }
            });

            if (hasUpdates) {
                await batch.commit();
                console.log("Ingredients seeded/updated successfully.");
            }

            // Seed customization options (sugar/ice levels)
            try {
                await seedCustomizationOptions();
            } catch (error) {
                console.error("Error seeding customization options:", error);
            }

            const q = db.collection("ingredients").orderBy("name", "asc");
            const unsubscribe = q.onSnapshot((querySnapshot) => {
                const ingredientsList: Ingredient[] = [];
                querySnapshot.forEach((doc) => {
                    ingredientsList.push({ id: doc.id, ...doc.data() } as Ingredient);
                });
                console.log('📦 Fetched Ingredients:', ingredientsList.map(i => `${i.name} (${i.id})`));
                setIngredients(ingredientsList);
                setIsLoading(false);
            }, (error) => {
                console.error("Error fetching inventory: ", error);
                setIsLoading(false);
            });
            return unsubscribe;
        };

        let unsubscribe: () => void;
        seedAndFetch().then(unsub => {
            if (unsub) unsubscribe = unsub;
        });

        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, []);

    const handleOpenUpdateModal = (ingredient: Ingredient) => {
        setSelectedIngredient(ingredient);
        setIsUpdateModalOpen(true);
    };

    const handleCloseUpdateModal = () => {
        setIsUpdateModalOpen(false);
        setSelectedIngredient(null);
    };

    const handleOpenAddModal = () => {
        setIsAddModalOpen(true);
    };

    const handleCloseAddModal = () => {
        setIsAddModalOpen(false);
    };

    const handleAddIngredient = async (ingredientData: IngredientData) => {
        try {
            // Generate a clean ID from the ingredient name
            // Example: "Nata de Coco" -> "nata-de-coco"
            const generatedId = ingredientData.name
                .toLowerCase()
                .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
                .replace(/\s+/g, '-') // Replace spaces with hyphens
                .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
                .trim();

            // Check if ingredient with this ID already exists
            const existingDoc = await db.collection("ingredients").doc(generatedId).get();
            if (existingDoc.exists) {
                showToast(`Ingredient with name "${ingredientData.name}" already exists!`);
                return;
            }

            // Remove id from data (we'll use it as document ID)
            const { id, ...data } = ingredientData;

            // Add with specific ID (not random)
            const ingredientWithDate = {
                ...data,
                createdAt: new Date().toISOString()
            };
            await db.collection("ingredients").doc(generatedId).set(ingredientWithDate);
            showToast(`Ingredient "${ingredientData.name}" added successfully with ID: ${generatedId}`);
            handleCloseAddModal();
        } catch (error) {
            console.error("Error adding ingredient: ", error);
            showToast("Failed to add ingredient.");
            throw error;
        }
    };

    const handleUpdateStock = async (ingredientId: string, amount: number, type: 'add' | 'set', expirationDate?: string) => {
        const ingredientRef = db.collection("ingredients").doc(ingredientId);
        try {
            const updateData: any = {};

            if (type === 'add') {
                updateData.stock = firebase.firestore.FieldValue.increment(amount);
            } else {
                updateData.stock = amount;
            }

            if (expirationDate) {
                updateData.expirationDate = expirationDate;
            }

            await ingredientRef.update(updateData);
            handleCloseUpdateModal();
        } catch (error) {
            console.error("Error updating stock: ", error);
        }
    };

    const handleReseedIngredients = async () => {
        try {
            setIsLoading(true);
            const batch = db.batch();
            const ingredientsCollectionRef = db.collection("ingredients");

            // Get all existing documents to preserve expiration dates and createdAt
            const snapshot = await ingredientsCollectionRef.get();
            const existingData = new Map();
            snapshot.docs.forEach(doc => {
                existingData.set(doc.id, doc.data());
            });

            // Update all ingredients with mock data while preserving expiration dates and createdAt
            mockIngredients.forEach(ingredient => {
                const { id, ...data } = ingredient;
                const docRef = ingredientsCollectionRef.doc(id);
                const existing = existingData.get(id);

                // Merge new data with preserved fields
                const mergedData = {
                    ...data,
                    // Preserve expiration date if it exists
                    expirationDate: existing?.expirationDate || data.expirationDate,
                    // Preserve createdAt if it exists, otherwise use current time
                    createdAt: existing?.createdAt || new Date().toISOString()
                };

                batch.set(docRef, mergedData);
            });

            await batch.commit();
            showToast("Ingredients re-seeded successfully!");
            console.log("Ingredients re-seeded from mockIngredients.ts");
        } catch (error) {
            console.error("Error re-seeding ingredients: ", error);
            showToast("Failed to re-seed ingredients.");
        } finally {
            setIsLoading(false);
        }
    };


    if (isLoading) {
        return <div className="flex h-full items-center justify-center"><Loader2 className="h-12 w-12 animate-spin text-primary-600" /></div>;
    }

    return (
        <div>
            {/* Header */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
                <h1 className="font-display text-2xl font-bold text-gray-800 sm:text-3xl">Inventory Management</h1>
                {isAdmin && (
                    <button
                        onClick={handleOpenAddModal}
                        className="flex w-full items-center justify-center gap-2 rounded-full bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-700 sm:w-auto">
                        <Plus className="h-4 w-4" />
                        <span>Add Ingredient</span>
                    </button>
                )}
            </div>

            {/* Alerts Section */}
            <div className="space-y-4 mb-6">
                {/* Out of Stock Alert */}
                {outOfStockIngredients.length > 0 && (
                    <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                        <div className="flex items-start gap-3">
                            <div className="rounded-full bg-red-100 p-2 text-red-600">
                                <XCircle className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-red-900">Critical: {outOfStockIngredients.length} Items Out of Stock</h3>
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {outOfStockIngredients.map(ing => (
                                        <span key={ing.id} className="inline-flex items-center rounded-md bg-white px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/20">
                                            {ing.name}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Low Stock Alert */}
                {lowStockIngredients.length > 0 && (
                    <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4">
                        <div className="flex items-start gap-3">
                            <div className="rounded-full bg-yellow-100 p-2 text-yellow-600">
                                <AlertTriangle className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-yellow-900">Warning: {lowStockIngredients.length} Items Low on Stock</h3>
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {lowStockIngredients.map(ing => (
                                        <span key={ing.id} className="inline-flex items-center rounded-md bg-white px-2 py-1 text-xs font-medium text-yellow-700 ring-1 ring-inset ring-yellow-600/20">
                                            {ing.name} ({ing.stock} {ing.unit})
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Expiration Alert */}
                {expiringIngredients.length > 0 && (
                    <div className="rounded-xl border border-orange-200 bg-orange-50 p-4">
                        <div className="flex items-start gap-3">
                            <div className="rounded-full bg-orange-100 p-2 text-orange-600">
                                <Calendar className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-orange-900">Attention Needed: {expiringIngredients.length} Items Expiring Soon</h3>
                                <p className="mt-1 text-sm text-orange-700">
                                    The following items are expiring within 7 days or have already expired:
                                </p>
                                <div className="mt-3 flex flex-wrap gap-2">
                                    {expiringIngredients.map(ing => (
                                        <span key={ing.id} className="inline-flex items-center rounded-md bg-white px-2 py-1 text-xs font-medium text-orange-700 ring-1 ring-inset ring-orange-600/20">
                                            {ing.name} ({new Date(ing.expirationDate!).toLocaleDateString()})
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 gap-4 mb-6 sm:grid-cols-2 lg:grid-cols-4">
                <button
                    onClick={() => handleStatCardClick('all')}
                    className={`flex items-center justify-between p-5 bg-white rounded-xl border border-gray-100 shadow-sm transition-all hover:shadow-md cursor-pointer text-left group ${activeFilter === 'all' ? 'ring-2 ring-primary-600 ring-offset-1' : ''
                        }`}
                >
                    <div>
                        <p className="text-sm font-medium text-gray-500 group-hover:text-primary-600 transition-colors">Total Ingredients</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">{ingredients.length}</p>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 text-gray-600 group-hover:bg-primary-50 group-hover:text-primary-600 transition-colors">
                        <Package className="h-6 w-6" />
                    </div>
                </button>
                <button
                    onClick={() => handleStatCardClick('lowStock')}
                    className={`flex items-center justify-between p-5 bg-white rounded-xl border border-gray-100 shadow-sm transition-all hover:shadow-md cursor-pointer text-left group ${activeFilter === 'lowStock' ? 'ring-2 ring-yellow-500 ring-offset-1' : ''
                        }`}
                >
                    <div>
                        <p className="text-sm font-medium text-gray-500 group-hover:text-yellow-600 transition-colors">Low Stock Items</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">{getLowStockCount('All')}</p>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-yellow-50 text-yellow-600 group-hover:bg-yellow-100 transition-colors">
                        <AlertTriangle className="h-6 w-6" />
                    </div>
                </button>
                <button
                    onClick={() => handleStatCardClick('outOfStock')}
                    className={`flex items-center justify-between p-5 bg-white rounded-xl border border-gray-100 shadow-sm transition-all hover:shadow-md cursor-pointer text-left group ${activeFilter === 'outOfStock' ? 'ring-2 ring-red-500 ring-offset-1' : ''
                        }`}
                >
                    <div>
                        <p className="text-sm font-medium text-gray-500 group-hover:text-red-600 transition-colors">Out of Stock</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">{ingredients.filter(i => i.stock === 0).length}</p>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600 group-hover:bg-red-100 transition-colors">
                        <XCircle className="h-6 w-6" />
                    </div>
                </button>
                <button
                    onClick={() => handleStatCardClick('newAdded')}
                    className={`flex items-center justify-between p-5 bg-white rounded-xl border border-gray-100 shadow-sm transition-all hover:shadow-md cursor-pointer text-left group ${activeFilter === 'newAdded' ? 'ring-2 ring-blue-500 ring-offset-1' : ''
                        }`}
                >
                    <div>
                        <p className="text-sm font-medium text-gray-500 group-hover:text-blue-600 transition-colors">New Ingredients</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">{newIngredients.length}</p>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 group-hover:bg-blue-100 transition-colors">
                        <Sparkles className="h-6 w-6" />
                    </div>
                </button>
            </div>

            {/* Search Bar */}
            <div className="mb-6">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search ingredients..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full rounded-lg border bg-white pl-10 pr-4 py-2.5 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500 focus:ring-opacity-20"
                    />
                </div>
            </div>

            {/* Category Filter Tabs with Icons */}
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

            {/* Mobile List View */}
            <div className="grid grid-cols-1 gap-3 md:hidden">
                {filteredIngredients.map((item) => {
                    const status = getStockStatus(item);
                    return (
                        <div key={item.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col gap-3">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-semibold text-gray-900">{item.name}</h3>
                                    <p className="text-xs text-gray-500">{item.category}</p>
                                </div>
                                <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${status.color === 'text-red-600' ? 'bg-red-50 text-red-700' : status.color === 'text-yellow-600' ? 'bg-yellow-50 text-yellow-700' : 'bg-green-50 text-green-700'}`}>
                                    <status.Icon className="h-3 w-3" />
                                    {status.text}
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                                <div>
                                    <p className="text-xs text-gray-500">Current Stock</p>
                                    <p className="font-medium text-gray-900">
                                        {item.stock.toLocaleString()} <span className="text-gray-400 text-xs">{item.unit}</span>
                                    </p>
                                </div>
                                {item.expirationDate && (
                                    <div>
                                        <p className="text-xs text-gray-500">Expires</p>
                                        <p className={`font-medium ${new Date(item.expirationDate) < new Date() ? 'text-red-600' : 'text-gray-900'}`}>
                                            {new Date(item.expirationDate).toLocaleDateString()}
                                        </p>
                                    </div>
                                )}
                                <button
                                    onClick={() => handleOpenUpdateModal(item)}
                                    className="px-3 py-1.5 bg-primary-50 text-primary-700 text-xs font-semibold rounded-lg hover:bg-primary-100 transition-colors"
                                >
                                    Update
                                </button>
                            </div>
                        </div>
                    );
                })}
                {filteredIngredients.length === 0 && (
                    <div className="text-center py-8 text-gray-500">No ingredients found.</div>
                )}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto rounded-lg border bg-white shadow-sm">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Ingredient</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Current Stock</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Expiration</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
                            <th scope="col" className="relative px-6 py-3"><span className="sr-only">Edit</span></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                        {filteredIngredients.map((item) => {
                            const status = getStockStatus(item);
                            return (
                                <tr
                                    key={item.id}
                                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                                    onClick={() => handleOpenUpdateModal(item)}
                                >
                                    <td className="whitespace-nowrap px-6 py-4">
                                        <div className="text-sm font-medium text-gray-900">{item.name}</div>
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4">
                                        <div className="text-sm text-gray-900">{item.stock.toLocaleString()} <span className="text-gray-500">{item.unit}</span></div>
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4">
                                        <div className={`text-sm ${item.expirationDate && new Date(item.expirationDate) < new Date() ? 'text-red-600 font-medium' : 'text-gray-900'}`}>
                                            {item.expirationDate ? new Date(item.expirationDate).toLocaleDateString() : '-'}
                                        </div>
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4">
                                        <div className={`inline-flex items-center gap-1 text-sm font-semibold ${status.color}`}>
                                            <status.Icon className="h-4 w-4" />
                                            {status.text}
                                        </div>
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleOpenUpdateModal(item);
                                            }}
                                            className="text-primary-600 hover:text-primary-800"
                                        >
                                            Update Stock
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {isUpdateModalOpen && selectedIngredient && (
                <UpdateStockModal
                    ingredient={selectedIngredient}
                    onClose={handleCloseUpdateModal}
                    onUpdate={handleUpdateStock}
                />
            )}

            <AddIngredientModal
                isOpen={isAddModalOpen}
                onClose={handleCloseAddModal}
                onAdd={handleAddIngredient}
            />
        </div>
    );
};

export default AdminInventoryPage;

