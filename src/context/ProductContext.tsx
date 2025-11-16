
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { collection, getDocs, query, orderBy, setDoc, doc, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
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
            const productsCollectionRef = collection(db, 'products');
            const q = query(productsCollectionRef, orderBy('displayOrder', 'asc'));
            const productSnapshot = await getDocs(q);

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
            const productsCollectionRef = collection(db, 'products');
            const initialSnapshot = await getDocs(query(productsCollectionRef));
            if (initialSnapshot.empty) {
                console.log("Products collection is empty. Seeding database...");
                try {
                    const promises = mockProducts.map(product => {
                        const { id, ...productData } = product;
                        const docRef = doc(productsCollectionRef, id);
                        return setDoc(docRef, productData);
                    });
                    await Promise.all(promises);
                    console.log("Seeding complete.");
                } catch (seedError) {
                    console.error("Error seeding products:", seedError);
                    setError("Failed to seed the database.");
                    setIsLoading(false);
                    return;
                }
            }
            await fetchProducts();
        };

        seedAndFetchProducts();
    }, [fetchProducts]);

    const addProduct = async (productData: ProductFormData) => {
        try {
            await addDoc(collection(db, 'products'), productData);
            await fetchProducts();
        } catch (e) {
            console.error("Error adding product: ", e);
            throw new Error("Failed to add product.");
        }
    };

    const updateProduct = async (productId: string, productData: Partial<ProductFormData>) => {
        try {
            const productDocRef = doc(db, 'products', productId);
            await updateDoc(productDocRef, productData);
            await fetchProducts();
        } catch (e) {
            console.error("Error updating product: ", e);
            throw new Error("Failed to update product.");
        }
    };

    const deleteProduct = async (productId: string) => {
        try {
            const productDocRef = doc(db, 'products', productId);
            await deleteDoc(productDocRef);
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
