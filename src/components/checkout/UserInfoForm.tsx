import React from 'react';
import { User, Phone } from 'lucide-react';

interface UserInfoFormProps {
    customerInfo: { name: string; phone: string };
    setCustomerInfo: React.Dispatch<React.SetStateAction<{ name: string; phone: string }>>;
    errors: { name?: string; phone?: string };
}

const UserInfoForm: React.FC<UserInfoFormProps> = ({ customerInfo, setCustomerInfo, errors }) => {
    return (
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
            <h2 className="mb-4 font-display text-xl font-bold text-coffee-900">Your Information</h2>
            <div className="space-y-4">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
                    <div className="relative mt-1">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <User className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            id="name"
                            value={customerInfo.name}
                            onChange={e => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
                            className="block w-full rounded-lg border-gray-200 bg-gray-50 py-2.5 pl-10 text-gray-900 shadow-sm transition-all focus:border-primary-500 focus:bg-white focus:ring-primary-500"
                            placeholder="Juan dela Cruz"
                        />
                    </div>
                    {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
                </div>
                <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number</label>
                    <div className="relative mt-1">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <Phone className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="tel"
                            id="phone"
                            value={customerInfo.phone}
                            onFocus={() => {
                                if (!customerInfo.phone) {
                                    setCustomerInfo(prev => ({ ...prev, phone: '+63 9' }));
                                }
                            }}
                            onBlur={() => {
                                if (customerInfo.phone === '+63 9') {
                                    setCustomerInfo(prev => ({ ...prev, phone: '' }));
                                }
                            }}
                            onChange={(e) => {
                                const val = e.target.value;

                                // Allow clearing
                                if (val === '') {
                                    setCustomerInfo(prev => ({ ...prev, phone: '' }));
                                    return;
                                }

                                // Strip non-digits
                                let digits = val.replace(/\D/g, '');

                                // Handle leading 0 replacement
                                if (digits.startsWith('0')) {
                                    digits = '63' + digits.substring(1);
                                }

                                // Ensure starts with 63
                                if (!digits.startsWith('63')) {
                                    digits = '63' + digits;
                                }

                                // Ensure starts with 639
                                if (digits.length >= 2 && digits[2] !== '9') {
                                    digits = '639' + digits.substring(2);
                                } else if (digits.length === 2) {
                                    digits = '639';
                                }

                                // Max 12 digits (63 + 10 digits)
                                digits = digits.substring(0, 12);

                                // Format as +63 9xx xxx xxxx
                                let formatted = '+63';
                                if (digits.length > 2) {
                                    formatted += ' ' + digits.substring(2, 5);
                                }
                                if (digits.length > 5) {
                                    formatted += ' ' + digits.substring(5, 8);
                                }
                                if (digits.length > 8) {
                                    formatted += ' ' + digits.substring(8, 12);
                                }

                                setCustomerInfo(prev => ({ ...prev, phone: formatted }));
                            }}
                            className="block w-full rounded-lg border-gray-200 bg-gray-50 py-2.5 pl-10 text-gray-900 shadow-sm transition-all focus:border-primary-500 focus:bg-white focus:ring-primary-500"
                            placeholder="+63 9xx xxx xxxx"
                        />
                    </div>
                    {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone}</p>}
                </div>
            </div>
        </div>
    );
};

export default UserInfoForm;
