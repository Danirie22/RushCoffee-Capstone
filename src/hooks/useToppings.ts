import { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { IngredientData } from '../data/mockIngredients';

export interface Topping {
    id: string;
    name: string;
    price: number;
    stock: number;
    portionSize: number;
}

/**
 * Custom hook to fetch available toppings from Firestore
 * Filters ingredients where isTopping = true and stock > 0
 */
export const useToppings = () => {
    const [toppings, setToppings] = useState<Topping[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchToppings = async () => {
            try {
                setIsLoading(true);
                const ingredientsRef = db.collection('ingredients');

                // Query for ingredients where isTopping = true
                const snapshot = await ingredientsRef.where('isTopping', '==', true).get();

                const toppingsList: Topping[] = [];
                snapshot.forEach((doc) => {
                    const data = doc.data() as IngredientData;

                    // Only include toppings with stock available
                    if (data.stock > 0 && data.toppingPrice !== undefined && data.portionSize !== undefined) {
                        toppingsList.push({
                            id: doc.id,
                            name: data.name,
                            price: data.toppingPrice,
                            stock: data.stock,
                            portionSize: data.portionSize,
                        });
                    }
                });

                // Sort by name
                toppingsList.sort((a, b) => a.name.localeCompare(b.name));

                setToppings(toppingsList);
                setError(null);
            } catch (err) {
                console.error('Error fetching toppings:', err);
                setError('Failed to load toppings');

                // Fallback to hardcoded toppings if Firestore fails
                setToppings([
                    { id: 'pearls', name: 'Pearls', price: 10, stock: 3000, portionSize: 30 },
                    { id: 'pudding', name: 'Pudding', price: 15, stock: 2000, portionSize: 40 },
                    { id: 'grass-jelly', name: 'Grass Jelly', price: 15, stock: 2500, portionSize: 35 },
                ]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchToppings();
    }, []);

    return { toppings, isLoading, error };
};
