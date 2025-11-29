import React, { useState } from 'react';
import { X, Save } from 'lucide-react';
import Modal from '../ui/Modal';
import { Ingredient } from '../../pages/Admin/AdminInventoryPage';

interface UpdateStockModalProps {
    ingredient: Ingredient;
    onClose: () => void;
    onUpdate: (ingredientId: string, amount: number, type: 'add' | 'set', expirationDate?: string) => void;
}

const UpdateStockModal: React.FC<UpdateStockModalProps> = ({ ingredient, onClose, onUpdate }) => {
    const [updateType, setUpdateType] = useState<'add' | 'set'>('add');
    const [amount, setAmount] = useState<number | ''>('');
    const [expirationDate, setExpirationDate] = useState<string>(ingredient.expirationDate || '');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Allow update if either amount is provided OR expiration date is changed
        if (typeof amount === 'number' && amount >= 0) {
            onUpdate(ingredient.id, amount, updateType, expirationDate);
        } else if (amount === '' && expirationDate) {
            // Update only expiration date, use 0 amount with 'add' type (no stock change)
            onUpdate(ingredient.id, 0, 'add', expirationDate);
        }
    };

    return (
        <Modal isOpen={true} onClose={onClose} title={`Update Stock: ${ingredient.name}`} size="md">
            <div className="text-sm mb-4">
                <p>Current Stock: <span className="font-bold">{ingredient.stock.toLocaleString()} {ingredient.unit}</span></p>
                {ingredient.expirationDate && (
                    <p className="mt-1 text-gray-500">Current Expiration: {new Date(ingredient.expirationDate).toLocaleDateString()}</p>
                )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex gap-2 rounded-full bg-gray-100 p-1">
                    <button type="button" onClick={() => setUpdateType('add')} className={`w-full rounded-full py-2 text-sm font-semibold transition-colors ${updateType === 'add' ? 'bg-primary-600 text-white shadow' : 'text-gray-600 hover:bg-primary-50'}`}>
                        Add Stock
                    </button>
                    <button type="button" onClick={() => setUpdateType('set')} className={`w-full rounded-full py-2 text-sm font-semibold transition-colors ${updateType === 'set' ? 'bg-primary-600 text-white shadow' : 'text-gray-600 hover:bg-primary-50'}`}>
                        Set New Total
                    </button>
                </div>

                <div>
                    <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                        {updateType === 'add' ? `Amount to Add (${ingredient.unit})` : `New Total Stock (${ingredient.unit})`}
                    </label>
                    <input
                        type="number"
                        id="amount"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
                        min="0"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                        autoFocus
                    />
                </div>

                <div>
                    <label htmlFor="expirationDate" className="block text-sm font-medium text-gray-700">
                        New Expiration Date (Optional)
                    </label>
                    <input
                        type="date"
                        id="expirationDate"
                        value={expirationDate}
                        onChange={(e) => setExpirationDate(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    />
                    <p className="mt-1 text-xs text-gray-500">Update this if the new batch has a different expiration date.</p>
                </div>

                <div className="mt-6 flex justify-end gap-3 pt-4 border-t">
                    <button type="button" onClick={onClose} className="rounded-full bg-gray-200 px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-300">Cancel</button>
                    <button
                        type="submit"
                        className="flex items-center gap-2 rounded-full bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-700 disabled:bg-primary-400 disabled:cursor-not-allowed"
                        disabled={amount === '' && !expirationDate}
                    >
                        <Save className="h-4 w-4" />
                        Update Stock
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default UpdateStockModal;
