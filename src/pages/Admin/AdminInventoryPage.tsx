import React, { useState, useEffect } from 'react';
// FIX: Use compat import for v8 syntax.
import firebase from 'firebase/compat/app';
import { db } from '../../firebaseConfig';
import { Loader2, Package, AlertTriangle, CheckCircle, XCircle, Plus, Search, Coffee, Milk, Droplet, Sparkles, Cookie, Leaf, Apple, Beer, Snowflake, Drumstick, Box } from 'lucide-react';
import UpdateStockModal from '../../components/admin/UpdateStockModal';
import AddIngredientModal from '../../components/admin/AddIngredientModal';
import { mockIngredients, IngredientData, IngredientCategory } from '../../data/mockIngredients';
import { useCart } from '../../context/CartContext';

export interface Ingredient {
    id: string;
    name: string;
    category: IngredientCategory;
    stock: number;
    unit: string;
    lowStockThreshold: number;
}

const AdminInventoryPage: React.FC = () => {
    const [ingredients, setIngredients] = useState<Ingredient[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedIngredient, setSelectedIngredient] = useState<Ingredient | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<IngredientCategory | 'All'>('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState<'all' | 'lowStock' | 'outOfStock'>('all');
    const { showToast } = useCart();

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

    const handleStatCardClick = (filter: 'all' | 'lowStock' | 'outOfStock') => {
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

    useEffect(() => {
        const seedAndFetch = async () => {
            const ingredientsCollectionRef = db.collection("ingredients");
            const initialSnapshot = await ingredientsCollectionRef.get();

            if (initialSnapshot.empty) {
                console.log("Seeding ingredients with specific IDs...");
                const batch = db.batch();
                mockIngredients.forEach(ingredient => {
                    const { id, ...data } = ingredient; // Destructure to separate id from data
                    const docRef = ingredientsCollectionRef.doc(id); // Use the specified id
                    batch.set(docRef, data);
                });
                await batch.commit();
            }

            const q = db.collection("ingredients").orderBy("name", "asc");
            const unsubscribe = q.onSnapshot((querySnapshot) => {
                const ingredientsList: Ingredient[] = [];
                querySnapshot.forEach((doc) => {
                    ingredientsList.push({ id: doc.id, ...doc.data() } as Ingredient);
                });
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
            await db.collection("ingredients").doc(generatedId).set(data);
            showToast(`Ingredient "${ingredientData.name}" added successfully with ID: ${generatedId}`);
            handleCloseAddModal();
        } catch (error) {
            console.error("Error adding ingredient: ", error);
            showToast("Failed to add ingredient.");
            throw error;
        }
    };

    const handleUpdateStock = async (ingredientId: string, amount: number, type: 'add' | 'set') => {
        const ingredientRef = db.collection("ingredients").doc(ingredientId);
        try {
            if (type === 'add') {
                await ingredientRef.update({ stock: firebase.firestore.FieldValue.increment(amount) });
            } else {
                await ingredientRef.update({ stock: amount });
            }
            handleCloseUpdateModal();
        } catch (error) {
            console.error("Error updating stock: ", error);
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
                <button
                    onClick={handleOpenAddModal}
                    className="flex items-center justify-center gap-2 rounded-full bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-700 sm:w-auto">
                    <Plus className="h-4 w-4" />
                    <span>Add Ingredient</span>
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-4 mb-6 sm:grid-cols-3">
                <button
                    onClick={() => handleStatCardClick('all')}
                    className={`bg-white rounded-lg border p-4 shadow-sm transition-all hover:shadow-md cursor-pointer text-left ${activeFilter === 'all' ? 'ring-2 ring-primary-600' : ''
                        }`}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Ingredients</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">{ingredients.length}</p>
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
                            <p className="text-sm font-medium text-gray-600">Low Stock Items</p>
                            <p className="text-2xl font-bold text-yellow-600 mt-1">{getLowStockCount('All')}</p>
                        </div>
                        <AlertTriangle className="h-10 w-10 text-yellow-600 opacity-75" />
                    </div>
                </button>
                <button
                    onClick={() => handleStatCardClick('outOfStock')}
                    className={`bg-white rounded-lg border p-4 shadow-sm transition-all hover:shadow-md cursor-pointer text-left col-span-2 sm:col-span-1 w-[calc(50%-0.5rem)] mx-auto sm:w-full ${activeFilter === 'outOfStock' ? 'ring-2 ring-red-600' : ''
                        }`}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Out of Stock</p>
                            <p className="text-2xl font-bold text-red-600 mt-1">{ingredients.filter(i => i.stock === 0).length}</p>
                        </div>
                        <XCircle className="h-10 w-10 text-red-600 opacity-75" />
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

            <div className="overflow-x-auto rounded-lg border bg-white shadow-sm">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Ingredient</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Current Stock</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
                            <th scope="col" className="relative px-6 py-3"><span className="sr-only">Edit</span></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                        {filteredIngredients.map((item) => {
                            const status = getStockStatus(item);
                            return (
                                <tr key={item.id} className="hover:bg-gray-50">
                                    <td className="whitespace-nowrap px-6 py-4">
                                        <div className="text-sm font-medium text-gray-900">{item.name}</div>
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4">
                                        <div className="text-sm text-gray-900">{item.stock.toLocaleString()} <span className="text-gray-500">{item.unit}</span></div>
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4">
                                        <div className={`inline-flex items-center gap-1 text-sm font-semibold ${status.color}`}>
                                            <status.Icon className="h-4 w-4" />
                                            {status.text}
                                        </div>
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                                        <button onClick={() => handleOpenUpdateModal(item)} className="text-primary-600 hover:text-primary-800">Update Stock</button>
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