
import React, { useState } from 'react';
import { X, Plus, Save, RefreshCw } from 'lucide-react';
import { Ingredient } from '../../pages/Admin/AdminInventoryPage';

interface UpdateStockModalProps {
    ingredient: Ingredient;
    onClose: () => void;
    onUpdate: (ingredientId: string, amount: number, type: 'add' | 'set') => void;
}

const UpdateStockModal: React.FC<UpdateStockModalProps> = ({ ingredient, onClose, onUpdate }) => {
    const [updateType, setUpdateType] = useState<'add' | 'set'>('add');
    const [amount, setAmount] = useState<number | ''>('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (typeof amount === 'number' && amount >= 0) {
            onUpdate(ingredient.id, amount, updateType);
        }
    };

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
            onClick={onClose}
        >
            <div 
                className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center justify-between">
                    <h2 className="font-display text-xl font-bold text-gray-800">Update Stock: {ingredient.name}</h2>
                    <button onClick={onClose} className="rounded-full p-1 text-gray-500 hover:bg-gray-100"><X /></button>
                </div>
                
                <div className="mt-4 text-sm">
                    <p>Current Stock: <span className="font-bold">{ingredient.stock.toLocaleString()} {ingredient.unit}</span></p>
                </div>
                
                <form onSubmit={handleSubmit} className="mt-6">
                    <div className="flex gap-2 rounded-full bg-gray-100 p-1">
                        <button type="button" onClick={() => setUpdateType('add')} className={`w-full rounded-full py-2 text-sm font-semibold transition-colors ${updateType === 'add' ? 'bg-primary-600 text-white shadow' : 'text-gray-600 hover:bg-primary-50'}`}>
                            Add Stock
                        </button>
                        <button type="button" onClick={() => setUpdateType('set')} className={`w-full rounded-full py-2 text-sm font-semibold transition-colors ${updateType === 'set' ? 'bg-primary-600 text-white shadow' : 'text-gray-600 hover:bg-primary-50'}`}>
                            Set New Total
                        </button>
                    </div>

                    <div className="mt-4">
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
                            required
                            autoFocus
                        />
                    </div>
                    
                    <div className="mt-6 flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="rounded-full bg-gray-200 px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-300">Cancel</button>
                        <button type="submit" className="flex items-center gap-2 rounded-full bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-700 disabled:bg-primary-400" disabled={amount === '' || amount < 0}>
                            <Save className="h-4 w-4" />
                            Update Stock
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UpdateStockModal;
