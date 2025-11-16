
import React, { useState, useEffect, FormEvent } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { X, Plus, Trash2, Loader2, Save } from 'lucide-react';

import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { Product } from '../../data/mockProducts';
import { useProduct, ProductFormData } from '../../context/ProductContext';
import { useCart } from '../../context/CartContext';
import { Ingredient } from '../../pages/Admin/AdminInventoryPage';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  productToEdit: Product | null;
}

const initialFormData: ProductFormData = {
  name: '',
  description: '',
  category: 'Coffee Based',
  sizes: [
    { name: 'Grande', size: '16oz', price: 0 },
    { name: 'Venti', size: '22oz', price: 0 },
  ],
  imageUrl: '',
  available: true,
  stock: 0,
  popular: false,
  new: false,
  displayOrder: 99,
  recipe: [],
};

const ProductFormModal: React.FC<ProductFormModalProps> = ({ isOpen, onClose, productToEdit }) => {
  const [formData, setFormData] = useState<ProductFormData>(initialFormData);
  const [ingredients, setIngredients] = useState<(Ingredient & { id: string })[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addProduct, updateProduct } = useProduct();
  const { showToast } = useCart();

  useEffect(() => {
    const fetchIngredients = async () => {
      const querySnapshot = await getDocs(collection(db, "ingredients"));
      const ingredientsList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as (Ingredient & { id: string })[];
      setIngredients(ingredientsList);
    };
    if (isOpen) {
      fetchIngredients();
    }
  }, [isOpen]);
  
  useEffect(() => {
    if (productToEdit) {
      setFormData(productToEdit);
    } else {
      setFormData(initialFormData);
    }
  }, [productToEdit, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };
  
  const handleSizeChange = (sizeName: 'Grande' | 'Venti', value: number) => {
    setFormData(prev => ({
      ...prev,
      sizes: prev.sizes.map(s => s.name === sizeName ? { ...s, price: value } : s),
    }));
  };

  const handleRecipeChange = (index: number, field: 'ingredientId' | 'quantity', value: string | number) => {
    const newRecipe = [...(formData.recipe || [])];
    (newRecipe[index] as any)[field] = value;
    setFormData(prev => ({ ...prev, recipe: newRecipe }));
  };

  const addRecipeItem = () => {
    const newRecipe = [...(formData.recipe || []), { ingredientId: '', quantity: 0 }];
    setFormData(prev => ({ ...prev, recipe: newRecipe }));
  };

  const removeRecipeItem = (index: number) => {
    const newRecipe = [...(formData.recipe || [])];
    newRecipe.splice(index, 1);
    setFormData(prev => ({ ...prev, recipe: newRecipe }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (productToEdit) {
        const { id, ...updateData } = { ...formData, id: productToEdit.id };
        await updateProduct(id, updateData);
        showToast('Product updated successfully!');
      } else {
        await addProduct(formData);
        showToast('Product added successfully!');
      }
      onClose();
    } catch (error) {
      console.error(error);
      showToast('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={productToEdit ? 'Edit Product' : 'Add New Product'} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
            <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" required />
          </div>
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
            <select name="category" id="category" value={formData.category} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
              <option>Coffee Based</option>
              <option>Non-Coffee Based</option>
              <option>Matcha Series</option>
            </select>
          </div>
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
          <textarea name="description" id="description" value={formData.description} onChange={handleChange} rows={3} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
        </div>
        <div>
            <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700">Image URL</label>
            <input type="text" name="imageUrl" id="imageUrl" value={formData.imageUrl} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" required />
        </div>
        {/* Pricing & Stock */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">Grande Price (₱)</label>
                <input type="number" value={formData.sizes.find(s=>s.name==='Grande')?.price} onChange={e => handleSizeChange('Grande', +e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Venti Price (₱)</label>
                <input type="number" value={formData.sizes.find(s=>s.name==='Venti')?.price} onChange={e => handleSizeChange('Venti', +e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
            </div>
            <div>
                <label htmlFor="stock" className="block text-sm font-medium text-gray-700">Stock</label>
                <input type="number" name="stock" id="stock" value={formData.stock} onChange={e => setFormData(p => ({...p, stock: +e.target.value}))} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
            </div>
             <div>
                <label htmlFor="displayOrder" className="block text-sm font-medium text-gray-700">Display Order</label>
                <input type="number" name="displayOrder" id="displayOrder" value={formData.displayOrder} onChange={e => setFormData(p => ({...p, displayOrder: +e.target.value}))} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
            </div>
        </div>
        {/* Flags */}
        <div className="flex items-center space-x-6">
            <div className="flex items-center"><input type="checkbox" name="available" checked={formData.available} onChange={handleChange} className="h-4 w-4 rounded" /><label className="ml-2 text-sm">Available</label></div>
            <div className="flex items-center"><input type="checkbox" name="popular" checked={formData.popular} onChange={handleChange} className="h-4 w-4 rounded" /><label className="ml-2 text-sm">Popular</label></div>
            <div className="flex items-center"><input type="checkbox" name="new" checked={formData.new} onChange={handleChange} className="h-4 w-4 rounded" /><label className="ml-2 text-sm">New</label></div>
        </div>
        {/* Recipe */}
        <div>
            <h3 className="text-md font-medium text-gray-800">Recipe</h3>
            <div className="mt-2 space-y-2 rounded-md border bg-gray-50 p-3">
              {(formData.recipe || []).map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <select value={item.ingredientId} onChange={e => handleRecipeChange(index, 'ingredientId', e.target.value)} className="block w-full rounded-md border-gray-300 shadow-sm">
                    <option value="" disabled>Select Ingredient</option>
                    {ingredients.map(ing => <option key={ing.id} value={ing.id}>{ing.name}</option>)}
                  </select>
                  <input type="number" value={item.quantity} onChange={e => handleRecipeChange(index, 'quantity', +e.target.value)} className="block w-32 rounded-md border-gray-300 shadow-sm" placeholder="Qty" />
                  <Button type="button" variant="ghost" size="sm" onClick={() => removeRecipeItem(index)} className="px-2"><Trash2 className="h-4 w-4 text-red-500" /></Button>
                </div>
              ))}
              <Button type="button" variant="secondary" size="sm" onClick={addRecipeItem}><Plus className="mr-1 h-4 w-4"/>Add Ingredient</Button>
            </div>
        </div>
        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Save className="mr-2 h-4 w-4" />}
            {productToEdit ? 'Save Changes' : 'Add Product'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ProductFormModal;
