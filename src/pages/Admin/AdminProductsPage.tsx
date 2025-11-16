
import React, { useState } from 'react';
import { useProduct } from '../../context/ProductContext';
import { Loader2, Plus, Edit, Trash2, AlertCircle } from 'lucide-react';
import ProductFormModal from '../../components/admin/ProductFormModal';
import { Product } from '../../data/mockProducts';
import { useCart } from '../../context/CartContext';

const AdminProductsPage: React.FC = () => {
    const { products, isLoading, error, deleteProduct } = useProduct();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [productToEdit, setProductToEdit] = useState<Product | null>(null);
    const { showToast } = useCart();

    const handleOpenModal = (product: Product | null = null) => {
        setProductToEdit(product);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setProductToEdit(null);
    };

    const handleDelete = async (productId: string, productName: string) => {
        if (window.confirm(`Are you sure you want to delete "${productName}"? This action cannot be undone.`)) {
            try {
                await deleteProduct(productId);
                showToast(`"${productName}" has been deleted.`);
            } catch (e) {
                showToast(`Failed to delete "${productName}".`);
            }
        }
    };

    if (isLoading) {
        return <div className="flex h-full items-center justify-center"><Loader2 className="h-12 w-12 animate-spin text-primary-600" /></div>;
    }
    
    if (error) {
        return (
            <div className="flex flex-col items-center justify-center rounded-lg border border-red-200 bg-red-50 py-20 text-center text-red-700">
                <AlertCircle className="h-16 w-16" />
                <h3 className="mt-4 text-xl font-semibold">Oops! Something went wrong.</h3>
                <p className="mt-2">{error}</p>
            </div>
        );
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="font-display text-3xl font-bold text-gray-800">Product Management</h1>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 rounded-full bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-700"
                >
                    <Plus className="h-4 w-4" />
                    Add New Product
                </button>
            </div>
            
            <div className="overflow-x-auto rounded-lg border bg-white shadow-sm">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Product</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Category</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Price (G/V)</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Stock</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
                            <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                        {products.map((product) => (
                            <tr key={product.id} className="hover:bg-gray-50">
                                <td className="whitespace-nowrap px-6 py-4">
                                    <div className="flex items-center">
                                        <div className="h-10 w-10 flex-shrink-0">
                                            <img className="h-10 w-10 rounded-full object-cover" src={product.imageUrl} alt={product.name} />
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-gray-900">{product.name}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{product.category}</td>
                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                    ₱{product.sizes[0].price.toFixed(2)} / ₱{product.sizes[1].price.toFixed(2)}
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{product.stock}</td>
                                <td className="whitespace-nowrap px-6 py-4">
                                    {product.available ? (
                                        <span className="inline-flex rounded-full bg-green-100 px-2 text-xs font-semibold leading-5 text-green-800">Available</span>
                                    ) : (
                                        <span className="inline-flex rounded-full bg-red-100 px-2 text-xs font-semibold leading-5 text-red-800">Unavailable</span>
                                    )}
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                                    <button onClick={() => handleOpenModal(product)} className="p-1 text-primary-600 hover:text-primary-800"><Edit className="h-4 w-4" /></button>
                                    <button onClick={() => handleDelete(product.id, product.name)} className="ml-2 p-1 text-red-600 hover:text-red-800"><Trash2 className="h-4 w-4" /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <ProductFormModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                productToEdit={productToEdit}
            />
        </div>
    );
};

export default AdminProductsPage;
