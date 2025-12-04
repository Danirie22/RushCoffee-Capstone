import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { db } from '../firebaseConfig';
import { Product, mockProducts } from '../data/mockProducts';

export type ProductFormData = Omit<Product, 'id'>;

interface ProductContextType {
    products: Product[];
    isLoading: boolean;
    error: string | null;
    addProduct: (productData: ProductFormData) => Promise<void>;
    updateProduct: (productId: string, productData: Partial<ProductFormData>) => Promise<void>;
    deleteProduct: (productId: string) => Promise<void>;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const useProduct = () => {
    const context = useContext(ProductContext);
    if (!context) {
        throw new Error('useProduct must be used within a ProductProvider');
    }
    return context;
};

interface ProductProviderProps {
    children: ReactNode;
}

export const ProductProvider: React.FC<ProductProviderProps> = ({ children }) => {
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchProducts = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const productsCollectionRef = db.collection('products');
            const q = productsCollectionRef.orderBy('displayOrder', 'asc');
            const productSnapshot = await q.get();

            // Auto-seed products if collection is empty
            if (productSnapshot.empty) {
                console.log("Products collection is empty. Seeding products with specific IDs...");
                const batch = db.batch();

                mockProducts.forEach(product => {
                    const { id, ...productData } = product;
                    const docRef = productsCollectionRef.doc(id); // Use product ID as document ID
                    batch.set(docRef, productData);
                });

                await batch.commit();
                console.log(`Successfully seeded ${mockProducts.length} products to Firestore!`);

                // Fetch again after seeding
                const newSnapshot = await q.get();
                const productList = newSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as Product[];

                setProducts(productList);
                return;
            }

            const productList = productSnapshot.docs.map(doc => {
                const data = doc.data();
                const mockProduct = mockProducts.find(p => p.id === doc.id);

                // Always use the latest aliases and recipe from code (mockProducts)
                // This ensures search and ingredients are always up to date without waiting for DB sync
                if (mockProduct) {
                    return {
                        id: doc.id,
                        ...data,
                        aliases: mockProduct.aliases,
                        recipe: mockProduct.recipe
                    };
                }

                return {
                    id: doc.id,
                    ...data
                };
            }) as Product[];

            setProducts(productList);

            // Auto-sync recipes from code to Firestore
            // This ensures that any changes to recipes in mockProducts.ts are reflected in Firestore
            // We do this silently in the background
            const batch = db.batch();
            let hasUpdates = false;

            mockProducts.forEach(mockProduct => {
                const firestoreProduct = productList.find(p => p.id === mockProduct.id);
                if (firestoreProduct) {
                    // Check if recipe or aliases are different
                    const currentRecipe = JSON.stringify(firestoreProduct.recipe || []);
                    const newRecipe = JSON.stringify(mockProduct.recipe || []);

                    const currentAliases = JSON.stringify(firestoreProduct.aliases || []);
                    const newAliases = JSON.stringify(mockProduct.aliases || []);

                    const updates: any = {};
                    if (currentRecipe !== newRecipe) {
                        updates.recipe = mockProduct.recipe;
                    }
                    if (currentAliases !== newAliases) {
                        updates.aliases = mockProduct.aliases;
                    }

                    if (Object.keys(updates).length > 0) {
                        const ref = productsCollectionRef.doc(mockProduct.id);
                        batch.update(ref, updates);
                        hasUpdates = true;
                        console.log(`Syncing updates for ${mockProduct.name}`);
                    }
                }
            });

            if (hasUpdates) {
                await batch.commit();
                console.log('✅ Recipes synced from code to Firestore');
            }

        } catch (err: any) {
            if (err.code === 'permission-denied') {
                console.info("Firestore permission denied. This is expected if security rules are not yet configured or if you are offline. Falling back to mock data for demonstration.");
            } else {
                console.warn("Error fetching products from Firestore. Falling back to mock data.", err);
            }
            // Fallback to mock data so the app is usable
            setProducts(mockProducts);
            // Clear error so the UI doesn't show the blocking error state
            setError(null);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const addProduct = async (productData: ProductFormData) => {
        try {
            await db.collection('products').add(productData);
            await fetchProducts();
        } catch (e) {
            console.error("Error adding product: ", e);
            throw new Error("Failed to add product.");
        }
    };

    const updateProduct = async (productId: string, productData: Partial<ProductFormData>) => {
        try {
            const productDocRef = db.collection('products').doc(productId);
            await productDocRef.update(productData);
            await fetchProducts();
        } catch (e) {
            console.error("Error updating product: ", e);
            throw new Error("Failed to update product.");
        }
    };

    const deleteProduct = async (productId: string) => {
        try {
            const productDocRef = db.collection('products').doc(productId);
            await productDocRef.delete();
            await fetchProducts();
        } catch (e) {
            console.error("Error deleting product: ", e);
            throw new Error("Failed to delete product.");
        }
    };

    const value = { products, isLoading, error, addProduct, updateProduct, deleteProduct };

    return (
        <ProductContext.Provider value={value}>
            {children}
        </ProductContext.Provider>
    );
};
