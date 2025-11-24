import React, { useState, useEffect } from 'react';
import { db } from '../../firebaseConfig';
import { UserProfile } from '../../context/AuthContext';
import { Users, Search, Filter, MoreVertical, Mail, Phone, Calendar, User, Shield, Briefcase, CheckCircle, ArrowUpDown } from 'lucide-react';

const AdminUsersPage: React.FC = () => {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState<string>('all');
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (activeDropdown && !(event.target as Element).closest('.action-menu')) {
                setActiveDropdown(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [activeDropdown]);

    useEffect(() => {
        const unsubscribe = db.collection('users')
            .onSnapshot((snapshot) => {
                const fetchedUsers = snapshot.docs.map(doc => {
                    const data = doc.data();
                    return {
                        uid: doc.id,
                        ...data,
                        totalSpent: data.totalSpent ?? 0,
                        totalOrders: data.totalOrders ?? 0,
                        createdAt: data.createdAt?.toDate() || new Date(),
                    };
                }) as UserProfile[];
                setUsers(fetchedUsers);
                setLoading(false);
            }, (error) => {
                console.error("Error fetching users:", error);
                setLoading(false);
            });

        return () => unsubscribe();
    }, []);

    const filteredUsers = users.filter(user => {
        const matchesRole = filterRole === 'all' || user.role === filterRole;
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch =
            (user.firstName?.toLowerCase() || '').includes(searchLower) ||
            (user.lastName?.toLowerCase() || '').includes(searchLower) ||
            (user.email?.toLowerCase() || '').includes(searchLower) ||
            (user.phone?.toLowerCase() || '').includes(searchLower);

        return matchesRole && matchesSearch;
    });

    // Stats Calculation
    const totalUsers = users.length;
    const totalCustomers = users.filter(u => u.role === 'customer' || !u.role).length;
    const totalEmployees = users.filter(u => u.role === 'employee').length;
    const totalAdmins = users.filter(u => u.role === 'admin').length;

    const getRoleBadge = (role?: string) => {
        switch (role) {
            case 'admin':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-purple-50 text-purple-700 ring-1 ring-inset ring-purple-700/10">
                        <Shield className="w-3.5 h-3.5" /> Admin
                    </span>
                );
            case 'employee':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-700/10">
                        <Briefcase className="w-3.5 h-3.5" /> Employee
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20">
                        <User className="w-3.5 h-3.5" /> Customer
                    </span>
                );
        }
    };

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        }).format(date);
    };

    const handleRoleUpdate = async (userId: string, newRole: 'customer' | 'employee' | 'admin') => {
        try {
            await db.collection('users').doc(userId).update({ role: newRole });
            setActiveDropdown(null);
        } catch (error) {
            console.error("Error updating user role:", error);
        }
    };

    const StatCard = ({ title, value, icon: Icon, color }: { title: string, value: number, icon: any, color: string }) => (
        <div className="bg-white p-6 rounded-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-gray-100 flex items-center gap-4 transition-all hover:shadow-md">
            <div className={`p-3 rounded-xl ${color} bg-opacity-10`}>
                <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
            </div>
            <div>
                <p className="text-sm text-gray-500 font-medium mb-1">{title}</p>
                <h3 className="text-2xl font-bold text-gray-900 tracking-tight">{value}</h3>
            </div>
        </div>
    );

    return (
        <div className="space-y-8 pb-10 max-w-[1600px] mx-auto">
            {/* Header & Stats */}
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">User Management</h1>
                        <p className="text-gray-500 mt-1">Manage access, roles, and view user statistics.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard title="Total Users" value={totalUsers} icon={Users} color="bg-gray-600" />
                    <StatCard title="Customers" value={totalCustomers} icon={User} color="bg-green-600" />
                    <StatCard title="Employees" value={totalEmployees} icon={Briefcase} color="bg-blue-600" />
                    <StatCard title="Admins" value={totalAdmins} icon={Shield} color="bg-purple-600" />
                </div>
            </div>

            {/* Main Content Card */}
            <div className="bg-white rounded-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-gray-100 overflow-hidden flex flex-col">
                {/* Toolbar */}
                <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row gap-4 justify-between bg-white items-center">
                    <div className="relative w-full sm:max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search by name, email, or phone..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-coffee-500 focus:border-transparent outline-none transition-all"
                        />
                    </div>
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <div className="relative w-full sm:w-48">
                            <select
                                value={filterRole}
                                onChange={(e) => setFilterRole(e.target.value)}
                                className="w-full appearance-none bg-gray-50 border border-gray-200 text-gray-700 py-2.5 px-4 pr-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500 cursor-pointer font-medium text-sm"
                            >
                                <option value="all">All Roles</option>
                                <option value="customer">Customers</option>
                                <option value="employee">Employees</option>
                                <option value="admin">Admins</option>
                            </select>
                            <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                                <th className="px-6 py-4 w-[25%]">User Details</th>
                                <th className="px-6 py-4 w-[15%]">Role</th>
                                <th className="px-6 py-4 w-[25%]">Contact Info</th>
                                <th className="px-6 py-4 w-[15%]">Activity</th>
                                <th className="px-6 py-4 w-[15%]">Joined</th>
                                <th className="px-6 py-4 w-[5%] text-right"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-6 py-4"><div className="h-10 w-10 bg-gray-200 rounded-full inline-block mr-3"></div><div className="h-4 w-24 bg-gray-200 rounded inline-block"></div></td>
                                        <td className="px-6 py-4"><div className="h-6 w-20 bg-gray-200 rounded-full"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 w-32 bg-gray-200 rounded mb-2"></div><div className="h-4 w-24 bg-gray-200 rounded"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 w-16 bg-gray-200 rounded mb-2"></div><div className="h-4 w-12 bg-gray-200 rounded"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 w-24 bg-gray-200 rounded"></div></td>
                                        <td className="px-6 py-4"></td>
                                    </tr>
                                ))
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-16 text-center text-gray-500">
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="bg-gray-100 p-4 rounded-full mb-4">
                                                <Users className="w-8 h-8 text-gray-400" />
                                            </div>
                                            <p className="text-lg font-medium text-gray-900">No users found</p>
                                            <p className="text-sm mt-1">Try adjusting your search or filters.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((user) => (
                                    <tr key={user.uid} className="group hover:bg-gray-50/50 transition-colors duration-150">
                                        <td className="px-6 py-4 align-top">
                                            <div className="flex items-start gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-600 font-bold shadow-sm overflow-hidden border border-white ring-1 ring-gray-100 flex-shrink-0">
                                                    {user.photoURL ? (
                                                        <img src={user.photoURL} alt={user.firstName} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span className="text-sm">{user.firstName?.[0]}{user.lastName?.[0]}</span>
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-gray-900">{user.firstName} {user.lastName}</div>
                                                    <div className="text-xs text-gray-400 font-mono mt-1 flex items-center gap-1">
                                                        <span className="bg-gray-100 px-1.5 py-0.5 rounded text-[10px]">ID</span>
                                                        {user.uid.slice(0, 8)}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 align-top pt-5">
                                            {getRoleBadge(user.role)}
                                        </td>
                                        <td className="px-6 py-4 align-top">
                                            <div className="flex flex-col gap-2">
                                                <div className="flex items-center gap-2 text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
                                                    <div className="w-6 h-6 rounded-full bg-gray-50 flex items-center justify-center flex-shrink-0">
                                                        <Mail className="w-3 h-3 text-gray-400" />
                                                    </div>
                                                    <span className="truncate max-w-[180px]" title={user.email || ''}>{user.email}</span>
                                                </div>
                                                {user.phone ? (
                                                    <div className="flex items-center gap-2 text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
                                                        <div className="w-6 h-6 rounded-full bg-gray-50 flex items-center justify-center flex-shrink-0">
                                                            <Phone className="w-3 h-3 text-gray-400" />
                                                        </div>
                                                        <span>{user.phone}</span>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-2 text-sm text-gray-400">
                                                        <div className="w-6 h-6 rounded-full bg-gray-50 flex items-center justify-center flex-shrink-0">
                                                            <Phone className="w-3 h-3 text-gray-300" />
                                                        </div>
                                                        <span className="italic text-xs">No phone</span>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 align-top">
                                            <div className="flex flex-col gap-2">
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-gray-500 text-xs uppercase font-medium">Orders</span>
                                                    <span className="font-semibold text-gray-900 bg-gray-100 px-2 py-0.5 rounded-md min-w-[2rem] text-center">{user.totalOrders}</span>
                                                </div>
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-gray-500 text-xs uppercase font-medium">Spent</span>
                                                    <span className="font-medium text-coffee-700">₱{user.totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                                </div>
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-gray-500 text-xs uppercase font-medium">Points</span>
                                                    <span className="font-medium text-amber-600">{(user as any).loyaltyPoints || 0} pts</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 align-top pt-5">
                                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                                                {formatDate(user.createdAt)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right align-top pt-4 relative action-menu">
                                            <button
                                                onClick={() => setActiveDropdown(activeDropdown === user.uid ? null : user.uid)}
                                                className={`p-2 rounded-lg transition-all ${activeDropdown === user.uid ? 'bg-coffee-50 text-coffee-600 ring-1 ring-coffee-200' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
                                            >
                                                <MoreVertical className="w-5 h-5" />
                                            </button>

                                            {activeDropdown === user.uid && (
                                                <div className="absolute right-8 top-8 w-56 bg-white rounded-xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] border border-gray-100 z-50 animate-in fade-in zoom-in-95 duration-100 origin-top-right">
                                                    <div className="p-1.5">
                                                        <div className="px-3 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                                            Change Role
                                                        </div>
                                                        <button
                                                            onClick={() => handleRoleUpdate(user.uid, 'admin')}
                                                            className={`w-full text-left px-3 py-2.5 rounded-lg text-sm flex items-center gap-3 transition-colors ${user.role === 'admin' ? 'bg-purple-50 text-purple-700 font-medium' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
                                                        >
                                                            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${user.role === 'admin' ? 'bg-purple-100' : 'bg-gray-100'}`}>
                                                                <Shield className="w-3.5 h-3.5" />
                                                            </div>
                                                            Admin
                                                            {user.role === 'admin' && <CheckCircle className="w-4 h-4 ml-auto text-purple-600" />}
                                                        </button>
                                                        <button
                                                            onClick={() => handleRoleUpdate(user.uid, 'employee')}
                                                            className={`w-full text-left px-3 py-2.5 rounded-lg text-sm flex items-center gap-3 transition-colors ${user.role === 'employee' ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
                                                        >
                                                            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${user.role === 'employee' ? 'bg-blue-100' : 'bg-gray-100'}`}>
                                                                <Briefcase className="w-3.5 h-3.5" />
                                                            </div>
                                                            Employee
                                                            {user.role === 'employee' && <CheckCircle className="w-4 h-4 ml-auto text-blue-600" />}
                                                        </button>
                                                        <button
                                                            onClick={() => handleRoleUpdate(user.uid, 'customer')}
                                                            className={`w-full text-left px-3 py-2.5 rounded-lg text-sm flex items-center gap-3 transition-colors ${(!user.role || user.role === 'customer') ? 'bg-green-50 text-green-700 font-medium' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
                                                        >
                                                            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${(!user.role || user.role === 'customer') ? 'bg-green-100' : 'bg-gray-100'}`}>
                                                                <User className="w-3.5 h-3.5" />
                                                            </div>
                                                            Customer
                                                            {(!user.role || user.role === 'customer') && <CheckCircle className="w-4 h-4 ml-auto text-green-600" />}
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination (Placeholder) */}
                {!loading && filteredUsers.length > 0 && (
                    <div className="px-6 py-4 border-t border-gray-100 flex justify-between items-center text-sm text-gray-600 bg-gray-50/50">
                        <span>Showing {filteredUsers.length} users</span>
                        <div className="flex gap-2">
                            <button className="px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-white hover:shadow-sm disabled:opacity-50 transition-all text-xs font-medium" disabled>Previous</button>
                            <button className="px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-white hover:shadow-sm disabled:opacity-50 transition-all text-xs font-medium" disabled>Next</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminUsersPage;
