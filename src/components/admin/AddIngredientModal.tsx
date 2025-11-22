import React, { useState, FormEvent } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { Loader2, Save } from 'lucide-react';
import { IngredientData, IngredientCategory } from '../../data/mockIngredients';

interface AddIngredientModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (ingredient: IngredientData) => Promise<void>;
}

const AddIngredientModal: React.FC<AddIngredientModalProps> = ({ isOpen, onClose, onAdd }) => {
    const [formData, setFormData] = useState<Omit<IngredientData, 'id'>>({
        name: '',
        category: 'Coffee & Beans',
        stock: 0,
        unit: 'g',
        lowStockThreshold: 10,
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? Math.max(0, Number(value)) : value,
        }));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!formData.name.trim()) {
            return;
        }
        setIsSubmitting(true);
        try {
            // Cast to IngredientData since handleAddIngredient will generate the id
            await onAdd(formData as IngredientData);
        } catch (error) {
            console.error("Failed to add ingredient", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Add New Ingredient">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">Ingredient Name</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                        required
                        autoFocus
                    />
                </div>
                <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
                    <select
                        id="category"
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                        required
                    >
                        <option value="Coffee & Beans">Coffee & Beans</option>
                        <option value="Dairy">Dairy</option>
                        <option value="Sauces">Sauces</option>
                        <option value="Syrups">Syrups</option>
                        <option value="Specialty">Specialty</option>
                        <option value="Matcha & Tea">Matcha & Tea</option>
                        <option value="Fruits & Purees">Fruits & Purees</option>
                        <option value="Beverages">Beverages</option>
                        <option value="Frozen">Frozen</option>
                        <option value="Proteins">Proteins</option>
                        <option value="Dry Goods">Dry Goods</option>
                    </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="stock" className="block text-sm font-medium text-gray-700">Initial Stock</label>
                        <input
                            type="number"
                            id="stock"
                            name="stock"
                            value={formData.stock}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                            required
                            min="0"
                        />
                    </div>
                    <div>
                        <label htmlFor="unit" className="block text-sm font-medium text-gray-700">Unit</label>
                        <select
                            id="unit"
                            name="unit"
                            value={formData.unit}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                        >
                            <option value="g">Grams (g)</option>
                            <option value="ml">Milliliters (ml)</option>
                            <option value="pcs">Pieces (pcs)</option>
                        </select>
                    </div>
                </div>
                <div>
                    <label htmlFor="lowStockThreshold" className="block text-sm font-medium text-gray-700">Low Stock Threshold</label>
                    <input
                        type="number"
                        id="lowStockThreshold"
                        name="lowStockThreshold"
                        value={formData.lowStockThreshold}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                        required
                        min="0"
                    />
                </div>
                <div>
                    <label htmlFor="expirationDate" className="block text-sm font-medium text-gray-700">Expiration Date</label>
                    <input
                        type="date"
                        id="expirationDate"
                        name="expirationDate"
                        value={formData.expirationDate || ''}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    />
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t">
                    <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        Save Ingredient
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default AddIngredientModal;