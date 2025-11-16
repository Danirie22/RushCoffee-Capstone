
import React, { useState } from 'react';
import { Settings, Database, Loader2 } from 'lucide-react';
import { collection, setDoc, doc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { mockProducts } from '../../data/mockProducts';
import Card from '../../../components/ui/Card';
import Button from '../../components/ui/Button';
import { useCart } from '../../context/CartContext';

const AdminSettingsPage: React.FC = () => {
    const [isSeeding, setIsSeeding] = useState(false);
    const { showToast } = useCart();

    const handleSeedDatabase = async () => {
        if (!window.confirm("Are you sure you want to seed the database? This will add or overwrite products based on the mock data file.")) {
            return;
        }

        setIsSeeding(true);
        try {
            showToast('Starting database seed... This may take a moment.');
            
            const productsCollectionRef = collection(db, 'products');

            // Use Promise.all to handle all individual document writes.
            // This is more explicit for debugging than a batch write.
            const promises = mockProducts.map(product => {
                const { id, ...productData } = product;
                const docRef = doc(productsCollectionRef, id);
                return setDoc(docRef, productData);
            });

            await Promise.all(promises);
            
            showToast(`✅ Successfully seeded ${mockProducts.length} products!`);

        } catch (error) {
            console.error("Error seeding database:", error);
            const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred. See console for details.';
            showToast(`Error: ${errorMessage}`);
        } finally {
            setIsSeeding(false);
        }
    };

    return (
        <div>
            <h1 className="mb-6 font-display text-3xl font-bold text-gray-800">Shop Settings</h1>
            
            <Card className="border-l-4 border-yellow-500">
                <h2 className="font-display text-xl font-bold text-yellow-700">Data Management</h2>
                <p className="mt-2 text-gray-600">
                    Use these tools for initial setup or data management. These actions can be destructive, so please proceed with caution.
                </p>
                <div className="mt-4 border-t pt-4">
                    <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
                         <div>
                            <h3 className="font-semibold text-gray-800">Seed Products</h3>
                            <p className="text-sm text-gray-500">
                                Populate the Firestore 'products' collection with all items from the local mock data file. This is useful for initial setup.
                            </p>
                        </div>
                        <Button variant="secondary" onClick={handleSeedDatabase} disabled={isSeeding}>
                            {isSeeding ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Seeding...
                                </>
                            ) : (
                                <>
                                    <Database className="mr-2 h-4 w-4" />
                                    Seed Database
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </Card>

            <div className="mt-6 flex flex-col items-center justify-center rounded-lg border-2 border-dashed bg-gray-50 p-12 text-center">
                <Settings className="h-16 w-16 text-gray-400" />
                <h2 className="mt-4 text-xl font-semibold text-gray-700">More Settings Coming Soon</h2>
                <p className="mt-1 text-gray-500">
                    This is where you'll manage your shop's information, hours, and other system settings.
                </p>
            </div>
        </div>
    );
};

export default AdminSettingsPage;
