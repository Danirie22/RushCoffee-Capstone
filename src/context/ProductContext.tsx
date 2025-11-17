
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
        try {
            const productsCollectionRef = db.collection('products');
            const q = productsCollectionRef.orderBy('displayOrder', 'asc');
            const productSnapshot = await q.get();

            const productList = productSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Product[];
            
            setProducts(productList);
        } catch (err) {
            console.error("Error fetching products from Firestore: ", err);
            setError("Could not connect to the database. Please check your connection and try again.");
            setProducts([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        const seedAndFetchProducts = async () => {
            const productsCollectionRef = db.collection('products');
            const initialSnapshot = await productsCollectionRef.get();
            if (initialSnapshot.empty) {
                console.log("Products collection is empty. Seeding database...");
                try {
                    const batch = db.batch();
                    mockProducts.forEach(product => {
                        const { id, ...productData } = product;
                        const docRef = productsCollectionRef.doc(id);
                        batch.set(docRef, productData);
                    });
                    await batch.commit();
                    console.log("Seeding complete.");
                } catch (seedError) {
                    console.error("Error seeding products:", seedError);
                    setError("Failed to seed the database.");
                    setIsLoading(false);
                    return;
                }
            } else {
                // Non-destructive migration: Add missing products from the mock list
                const existingProductIds = new Set(initialSnapshot.docs.map(doc => doc.id));
                const missingProducts = mockProducts.filter(p => !existingProductIds.has(p.id));

                if (missingProducts.length > 0) {
                    console.log(`Found ${missingProducts.length} missing products. Adding them now...`);
                    try {
                        const batch = db.batch();
                        missingProducts.forEach(product => {
                            const { id, ...productData } = product;
                            const docRef = productsCollectionRef.doc(id);
                            batch.set(docRef, productData);
                        });
                        await batch.commit();
                        console.log("Missing products added successfully.");
                    } catch (migrationError) {
                        console.error("Error adding missing products:", migrationError);
                        // Don't block the app, just log the error. The fetch below will proceed.
                    }
                }
            }
            await fetchProducts();
        };

        seedAndFetchProducts();
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