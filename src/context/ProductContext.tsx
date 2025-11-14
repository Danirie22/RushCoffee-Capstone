import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { Product } from '../data/mockProducts';

interface ProductContextType {
    products: Product[];
    isLoading: boolean;
    error: string | null;
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

    useEffect(() => {
        const fetchProducts = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const productsCollection = collection(db, 'products');
                const q = query(productsCollection, orderBy('displayOrder', 'asc'));
                const productSnapshot = await getDocs(q);
                const productList = productSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as Product[];
                setProducts(productList);
            } catch (err) {
                console.error("Error fetching products: ", err);
                setError("Failed to load products from the database.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchProducts();
    }, []);
    
    const value = { products, isLoading, error };

    return (
        <ProductContext.Provider value={value}>
            {children}
        </ProductContext.Provider>
    );
};
