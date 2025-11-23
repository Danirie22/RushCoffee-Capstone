import React, { useState, useEffect } from 'react';
import { db } from '../../firebaseConfig';
import { Search, UserCheck, Shield, User, RefreshCw, AlertCircle } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { useCart } from '../../context/CartContext';

interface UserData {
    id: string;
    displayName?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    role?: 'customer' | 'employee' | 'admin';
    photoURL?: string;
    createdAt?: Date;
    loyaltyPoints?: number;
}

const AdminUsersPage: React.FC = () => {
    const [users, setUsers] = useState<UserData[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState<'all' | 'customer' | 'employee' | 'admin'>('all');
    const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
    const { showToast } = useCart();

    useEffect(() => {
        console.log('🔍 Fetching users from Firestore...');
        const unsubscribe = db
            .collection('users')
            .onSnapshot((snapshot) => {
                console.log('📊 Firestore snapshot received, docs count:', snapshot.docs.length);
                const fetchedUsers = snapshot.docs.map((doc) => {
                    const data = doc.data();
                    console.log('👤 User doc:', doc.id, data);
                    return {
                        id: doc.id,
                        displayName: data.displayName || '',
                        firstName: data.firstName || '',
                        lastName: data.lastName || '',
                        email: data.email || '',
                        role: data.role || 'customer',
                        photoURL: data.photoURL,
                        createdAt: data.createdAt?.toDate() || new Date(),
                        loyaltyPoints: data.loyaltyPoints || 0,
                    };
                }) as UserData[];
                console.log('✅ Fetched users:', fetchedUsers);

                fetchedUsers.sort((a, b) => {
                    const nameA = a.displayName || `${a.firstName} ${a.lastName}`;
                    const nameB = b.displayName || `${b.firstName} ${b.lastName}`;
                    return nameA.localeCompare(nameB);
                });

                setUsers(fetchedUsers);
                setLoading(false);
            }, (error) => {
                console.error('❌ Error fetching users:', error);
                showToast('Failed to load users');
                setLoading(false);
            });

        return () => unsubscribe();
    }, [showToast]);

    const handleRoleChange = async (userId: string, newRole: 'customer' | 'employee' | 'admin') => {
        setUpdatingUserId(userId);
        try {
            await db.collection('users').doc(userId).update({
                role: newRole,
                updatedAt: new Date(),
            });
            showToast(`User role updated to ${newRole}`);
        } catch (error) {
            console.error('Error updating user role:', error);
            showToast('Failed to update user role');
        } finally {
            setUpdatingUserId(null);
        }
    };

    const filteredUsers = users.filter((user) => {
        const matchesSearch =
            (user.displayName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (user.email || '').toLowerCase().includes(searchTerm.toLowerCase());

        const matchesRole = roleFilter === 'all' || user.role === roleFilter;

        return matchesSearch && matchesRole;
    });

    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case 'admin': return 'bg-red-100 text-red-800 border-red-200';
            case 'employee': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'customer': return 'bg-gray-100 text-gray-800 border-gray-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getRoleIcon = (role: string) => {
        switch (role) {
            case 'admin': return Shield;
            case 'employee': return UserCheck;
            case 'customer': return User;
            default: return User;
        }
    };

    const stats = {
        total: users.length,
        customers: users.filter(u => u.role === 'customer').length,
        employees: users.filter(u => u.role === 'employee').length,
        admins: users.filter(u => u.role === 'admin').length,
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
                    <p className="text-gray-500">Manage user accounts and roles</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => window.location.reload()}>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Refresh
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card className="p-4">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-100">
                            <User className="h-6 w-6 text-primary-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Users</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                        </div>
                    </div>
                </Card>
                <Card className="p-4">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100">
                            <User className="h-6 w-6 text-gray-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-600">Customers</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.customers}</p>
                        </div>
                    </div>
                </Card>
                <Card className="p-4">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                            <UserCheck className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-600">Employees</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.employees}</p>
                        </div>
                    </div>
                </Card>
                <Card className="p-4">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-100">
                            <Shield className="h-6 w-6 text-red-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-600">Admins</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.admins}</p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Filters */}
            <Card className="p-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            className="w-full rounded-lg border border-gray-300 pl-10 pr-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2">
                        <select
                            className="rounded-lg border border-gray-300 bg-white px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value as any)}
                        >
                            <option value="all">All Roles</option>
                            <option value="customer">Customers</option>
                            <option value="employee">Employees</option>
                            <option value="admin">Admins</option>
                        </select>
                    </div>
                </div>
            </Card>

            {/* Users Table */}
            <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-600">
                        <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                            <tr>
                                <th className="px-6 py-4 font-semibold">User</th>
                                <th className="px-6 py-4 font-semibold">Email</th>
                                <th className="px-6 py-4 font-semibold">Current Role</th>
                                <th className="px-6 py-4 font-semibold">Loyalty Points</th>
                                <th className="px-6 py-4 font-semibold">Registered</th>
                                <th className="px-6 py-4 font-semibold">Change Role</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center">
                                        Loading users...
                                    </td>
                                </tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                        No users found matching your filters.
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((user) => {
                                    const RoleIcon = getRoleIcon(user.role || 'customer');
                                    const displayName = user.displayName || `${user.firstName} ${user.lastName}`.trim() || 'Unknown';
                                    const initial = (displayName.charAt(0) || 'U').toUpperCase();

                                    return (
                                        <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    {user.photoURL ? (
                                                        <img
                                                            src={user.photoURL}
                                                            alt={displayName}
                                                            className="h-10 w-10 rounded-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 text-primary-600 font-semibold">
                                                            {initial}
                                                        </div>
                                                    )}
                                                    <div>
                                                        <p className="font-medium text-gray-900">{displayName}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-gray-600">{user.email}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${getRoleBadgeColor(user.role || 'customer')}`}>
                                                    <RoleIcon className="h-3 w-3" />
                                                    {((user.role || 'customer').charAt(0).toUpperCase() + (user.role || 'customer').slice(1))}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="font-medium text-gray-900">{user.loyaltyPoints || 0} pts</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-gray-600">
                                                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                                                </p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <select
                                                    value={user.role || 'customer'}
                                                    onChange={(e) => handleRoleChange(user.id, e.target.value as any)}
                                                    disabled={updatingUserId === user.id}
                                                    className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <option value="customer">Customer</option>
                                                    <option value="employee">Employee</option>
                                                    <option value="admin">Admin</option>
                                                </select>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Info Notice */}
            <Card className="bg-blue-50 border-blue-200 p-4">
                <div className="flex gap-3">
                    <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                        <h3 className="font-semibold text-blue-900">Role Permissions</h3>
                        <ul className="mt-2 space-y-1 text-sm text-blue-800">
                            <li><strong>Customer:</strong> Can browse menu, place orders, view queue status</li>
                            <li><strong>Employee:</strong> Can manage orders, queue, inventory, and view customers</li>
                            <li><strong>Admin:</strong> Full access including analytics, settings, and user management</li>
                        </ul>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default AdminUsersPage;
