import React, { useState, useEffect } from 'react';
import { db } from '../../firebaseConfig';
import { UserProfile } from '../../context/AuthContext';
import { Search, User, Star, ShoppingBag, Calendar, Mail, Phone } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

const EmployeeCustomersPage: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [customers, setCustomers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState<UserProfile | null>(null);

    // Debounce search to avoid too many reads
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (searchTerm.trim()) {
                searchCustomers();
            } else {
                setCustomers([]);
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

    const searchCustomers = async () => {
        setLoading(true);
        try {
            // Note: Firestore doesn't support native full-text search.
            // We'll implement a simple prefix search for this demo.
            // In production, use Algolia or a dedicated search index.

            const term = searchTerm.toLowerCase();

            // We'll fetch a batch of users and filter client-side for this MVP 
            // to allow searching by multiple fields (name, email) without complex indexes.
            // LIMITATION: This won't scale to thousands of users without a proper search engine.
            const snapshot = await db.collection('users')
                .limit(50)
                .get();

            const foundUsers = snapshot.docs
                .map(doc => ({ uid: doc.id, ...doc.data() } as UserProfile))
                .filter(user =>
                    user.firstName?.toLowerCase().includes(term) ||
                    user.lastName?.toLowerCase().includes(term) ||
                    user.email?.toLowerCase().includes(term)
                );

            setCustomers(foundUsers);
        } catch (error) {
            console.error("Error searching customers:", error);
        } finally {
            setLoading(false);
        }
    };

    const getTierColor = (tier: string) => {
        switch (tier) {
            case 'gold': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'silver': return 'bg-gray-100 text-gray-700 border-gray-200';
            default: return 'bg-orange-50 text-orange-700 border-orange-100';
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Customer Lookup</h1>
                <p className="text-gray-500 mt-2">Find customers to check loyalty status and history</p>
            </div>

            {/* Search Bar */}
            <div className="relative max-w-2xl">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full rounded-xl border-gray-200 pl-12 pr-4 py-4 shadow-sm focus:border-primary-500 focus:ring-primary-500 transition-all text-lg"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Results List */}
                <div className="lg:col-span-1 space-y-4">
                    {loading ? (
                        <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div></div>
                    ) : customers.length > 0 ? (
                        customers.map((customer) => (
                            <div
                                key={customer.uid}
                                onClick={() => setSelectedCustomer(customer)}
                                className={`p-4 rounded-xl border cursor-pointer transition-all hover:shadow-md ${selectedCustomer?.uid === customer.uid
                                        ? 'border-primary-500 bg-primary-50 ring-1 ring-primary-500'
                                        : 'border-gray-200 bg-white hover:border-primary-200'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 overflow-hidden">
                                        {customer.photoURL ? (
                                            <img src={customer.photoURL} alt={customer.firstName} className="h-full w-full object-cover" />
                                        ) : (
                                            <User className="h-6 w-6" />
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900">{customer.firstName} {customer.lastName}</h3>
                                        <p className="text-sm text-gray-500">{customer.email}</p>
                                    </div>
                                </div>
                                <div className="mt-3 flex items-center gap-2">
                                    <span className={`px-2 py-1 rounded-md text-xs font-bold uppercase border ${getTierColor(customer.tier || 'bronze')}`}>
                                        {customer.tier || 'Bronze'}
                                    </span>
                                    <span className="text-xs text-gray-500 flex items-center gap-1">
                                        <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                                        {customer.currentPoints} pts
                                    </span>
                                </div>
                            </div>
                        ))
                    ) : searchTerm ? (
                        <div className="text-center py-8 text-gray-500">No customers found</div>
                    ) : (
                        <div className="text-center py-8 text-gray-400">
                            <Search className="h-12 w-12 mx-auto mb-2 opacity-20" />
                            <p>Type to search...</p>
                        </div>
                    )}
                </div>

                {/* Customer Details */}
                <div className="lg:col-span-2">
                    {selectedCustomer ? (
                        <Card className="p-6 sticky top-6">
                            <div className="flex items-start justify-between mb-6">
                                <div className="flex items-center gap-4">
                                    <div className="h-20 w-20 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 text-2xl font-bold overflow-hidden border-4 border-white shadow-sm">
                                        {selectedCustomer.photoURL ? (
                                            <img src={selectedCustomer.photoURL} alt={selectedCustomer.firstName} className="h-full w-full object-cover" />
                                        ) : (
                                            selectedCustomer.firstName?.[0]
                                        )}
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900">{selectedCustomer.firstName} {selectedCustomer.lastName}</h2>
                                        <div className="flex items-center gap-4 mt-1 text-gray-500 text-sm">
                                            <span className="flex items-center gap-1"><Mail className="h-4 w-4" /> {selectedCustomer.email}</span>
                                            {selectedCustomer.phone && (
                                                <span className="flex items-center gap-1"><Phone className="h-4 w-4" /> {selectedCustomer.phone}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className={`px-4 py-2 rounded-lg border-2 text-center ${getTierColor(selectedCustomer.tier || 'bronze')}`}>
                                    <p className="text-xs font-bold uppercase tracking-wider opacity-75">Current Tier</p>
                                    <p className="text-xl font-black uppercase">{selectedCustomer.tier || 'Bronze'}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4 mb-8">
                                <div className="bg-gray-50 p-4 rounded-xl text-center">
                                    <p className="text-gray-500 text-sm mb-1">Current Points</p>
                                    <p className="text-2xl font-bold text-primary-600">{selectedCustomer.currentPoints}</p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-xl text-center">
                                    <p className="text-gray-500 text-sm mb-1">Lifetime Points</p>
                                    <p className="text-2xl font-bold text-gray-900">{selectedCustomer.lifetimePoints || 0}</p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-xl text-center">
                                    <p className="text-gray-500 text-sm mb-1">Total Orders</p>
                                    <p className="text-2xl font-bold text-gray-900">{selectedCustomer.totalOrders || 0}</p>
                                </div>
                            </div>

                            <div>
                                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <ShoppingBag className="h-5 w-5 text-primary-600" />
                                    Recent Activity
                                </h3>

                                {selectedCustomer.rewardsHistory && selectedCustomer.rewardsHistory.length > 0 ? (
                                    <div className="space-y-4">
                                        {selectedCustomer.rewardsHistory.slice().reverse().slice(0, 5).map((activity, idx) => (
                                            <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-100">
                                                <div className="flex items-center gap-3">
                                                    <div className={`h-8 w-8 rounded-full flex items-center justify-center ${activity.type === 'earned' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                                                        {activity.type === 'earned' ? '+' : '-'}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900">{activity.description}</p>
                                                        <p className="text-xs text-gray-500">
                                                            {activity.date instanceof Object && 'toDate' in activity.date
                                                                ? (activity.date as any).toDate().toLocaleDateString()
                                                                : new Date(activity.date).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                </div>
                                                <span className={`font-bold ${activity.type === 'earned' ? 'text-green-600' : 'text-orange-600'}`}>
                                                    {activity.type === 'earned' ? '+' : '-'}{activity.points} pts
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-500 text-center py-4">No recent activity recorded.</p>
                                )}
                            </div>
                        </Card>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 rounded-xl p-12 bg-gray-50">
                            <User className="h-16 w-16 mb-4 opacity-20" />
                            <p className="text-lg font-medium">Select a customer to view details</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EmployeeCustomersPage;
