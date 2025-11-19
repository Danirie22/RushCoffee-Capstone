import React, { useState, useEffect } from 'react';
// FIX: Use compat import for v8 syntax.
import firebase from 'firebase/compat/app';
import { db } from '../../firebaseConfig';
import { Loader2, Package, AlertTriangle, CheckCircle, XCircle, Plus } from 'lucide-react';
import UpdateStockModal from '../../components/admin/UpdateStockModal';
import AddIngredientModal from '../../components/admin/AddIngredientModal';
import { mockIngredients, IngredientData } from '../../data/mockIngredients';
import { useCart } from '../../context/CartContext';

export interface Ingredient {
    id: string;
    name: string;
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
    const { showToast } = useCart();

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
            await db.collection("ingredients").add(ingredientData);
            showToast(`Ingredient "${ingredientData.name}" added successfully.`);
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

    const getStockStatus = (item: Ingredient) => {
        if (item.stock <= 0) {
            return { text: 'Out of Stock', color: 'text-red-600', Icon: XCircle };
        }
        if (item.stock <= item.lowStockThreshold) {
            return { text: 'Low Stock', color: 'text-yellow-600', Icon: AlertTriangle };
        }
        return { text: 'In Stock', color: 'text-green-600', Icon: CheckCircle };
    };

    if (isLoading) {
        return <div className="flex h-full items-center justify-center"><Loader2 className="h-12 w-12 animate-spin text-primary-600" /></div>;
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="font-display text-3xl font-bold text-gray-800">Inventory Management</h1>
                 <button 
                    onClick={handleOpenAddModal}
                    className="flex items-center gap-2 rounded-full bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-700">
                    <Plus className="h-4 w-4" />
                    Add Ingredient
                </button>
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
                        {ingredients.map((item) => {
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