import React, { useState, useEffect, FormEvent } from 'react';
import { User, Phone, Mail, Save, X, Loader2 } from 'lucide-react';
import { UserProfile } from '../../context/AuthContext';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { useCart } from '../../context/CartContext';

interface EditProfileFormProps {
  user: UserProfile;
  onSave: (updates: Partial<Pick<UserProfile, 'firstName' | 'lastName' | 'phone'>>) => void;
  onCancel: () => void;
}

const EditProfileForm: React.FC<EditProfileFormProps> = ({ user, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone || '',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const { showToast } = useCart();

  useEffect(() => {
    const changes =
      formData.firstName !== user.firstName ||
      formData.lastName !== user.lastName ||
      formData.phone !== (user.phone || '');
    setHasChanges(changes);
  }, [formData, user]);

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (formData.firstName.length < 2) {
      newErrors.firstName = 'First name must be at least 2 characters.';
    }
    if (formData.lastName.length < 2) {
      newErrors.lastName = 'Last name must be at least 2 characters.';
    }
    if (formData.phone && !/^(09|\+639)\d{9}$/.test(formData.phone)) {
      newErrors.phone = 'Invalid Philippine phone number format.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      onSave(formData);
      setIsSubmitting(false);
      showToast('Profile updated successfully!');
    }, 1000);
  };

  return (
    <Card className="w-full">
      <h2 className="mb-4 font-display text-xl font-bold text-coffee-900">
        Edit Profile Information
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">First Name</label>
            <div className="relative mt-1">
              <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input type="text" name="firstName" id="firstName" value={formData.firstName} onChange={handleChange} className="w-full rounded-md border-gray-300 pl-10 shadow-sm focus:border-primary-500 focus:ring-primary-500" required />
            </div>
            {errors.firstName && <p className="mt-1 text-xs text-red-500">{errors.firstName}</p>}
          </div>
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">Last Name</label>
            <div className="relative mt-1">
              <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input type="text" name="lastName" id="lastName" value={formData.lastName} onChange={handleChange} className="w-full rounded-md border-gray-300 pl-10 shadow-sm focus:border-primary-500 focus:ring-primary-500" required />
            </div>
            {errors.lastName && <p className="mt-1 text-xs text-red-500">{errors.lastName}</p>}
          </div>
        </div>
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number</label>
          <div className="relative mt-1">
            <Phone className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input type="tel" name="phone" id="phone" value={formData.phone} onChange={handleChange} className="w-full rounded-md border-gray-300 pl-10 shadow-sm focus:border-primary-500 focus:ring-primary-500" />
          </div>
          {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone}</p>}
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
          <div className="relative mt-1">
            <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input type="email" name="email" id="email" value={user.email || ''} className="w-full rounded-md border-gray-300 bg-gray-100 pl-10 text-gray-500 shadow-sm" disabled readOnly />
          </div>
          <p className="mt-1 text-xs text-gray-500">Contact support to change your email address.</p>
        </div>

        <div className="flex justify-end gap-3 border-t border-gray-200 pt-4">
          <Button type="button" variant="ghost" onClick={onCancel}>
            <X className="mr-2 h-4 w-4" />
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={!hasChanges || isSubmitting}>
            {isSubmitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save Changes
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default EditProfileForm;