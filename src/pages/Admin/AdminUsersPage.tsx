import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { db } from '../../firebaseConfig';
import { UserProfile } from '../../context/AuthContext';
import { Users, Search, Filter, MoreVertical, Mail, Phone, Calendar, User, Shield, Briefcase, CheckCircle, ArrowUpDown, Copy, Check, TrendingUp, TrendingDown, Minus, X } from 'lucide-react';

type SortField = 'name' | 'role' | 'email' | 'orders' | 'spent' | 'joined';
type SortDirection = 'asc' | 'desc';

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
const UserDetailModal = ({ user, onClose }: { user: UserProfile, onClose: () => void }) => {
    // Prevent background scroll when modal is open
    useEffect(() => {
        // Store current overflow style
        const originalStyle = window.getComputedStyle(document.body).overflow;
        // Lock scroll on body
        document.body.style.overflow = 'hidden';

        // Lock scroll on admin main content
        const mainContent = document.getElementById('admin-main-content');
        let originalMainStyle = '';
        if (mainContent) {
            originalMainStyle = window.getComputedStyle(mainContent).overflow;
            mainContent.style.overflow = 'hidden';
        }

        return () => {
            // Restore original styles
            document.body.style.overflow = originalStyle;
            if (mainContent) {
                mainContent.style.overflow = originalMainStyle || 'auto';
            }
        };
    }, []);

    const copyToClipboard = async (email: string) => {
        try {
            await navigator.clipboard.writeText(email);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    if (!user) return null;

    return typeof document !== 'undefined' ? createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header with Cover & Profile */}
                <div className="relative h-32 bg-gradient-to-r from-coffee-600 to-coffee-800 flex-shrink-0">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors backdrop-blur-md z-10"
                    >
                        <X className="w-5 h-5" />
                    </button>
                    <div className="absolute -bottom-12 left-8">
                        <div className="w-24 h-24 rounded-full bg-white p-1 shadow-lg">
                            <div className="w-full h-full rounded-full bg-gradient-to-br from-coffee-400 to-coffee-600 flex items-center justify-center text-white text-2xl font-bold overflow-hidden">
                                {user.photoURL ? (
                                    <img src={user.photoURL} alt={user.firstName} className="w-full h-full object-cover" />
                                ) : (
                                    <span>{user.firstName?.[0]}{user.lastName?.[0]}</span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Body */}
                <div className="pt-16 pb-8 px-8 overflow-y-auto">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">{user.firstName} {user.lastName}</h2>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-gray-500 text-sm">{user.email}</span>
                                {getRoleBadge(user.role)}
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Customer Since</div>
                            <div className="text-sm font-medium text-gray-900 flex items-center justify-end gap-1">
                                <Calendar className="w-4 h-4 text-coffee-500" />
                                {formatDate(user.createdAt)}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                            <div className="text-sm text-gray-500 mb-1">Total Orders</div>
                            <div className="text-2xl font-bold text-gray-900">{user.totalOrders}</div>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                            <div className="text-sm text-gray-500 mb-1">Total Spent</div>
                            <div className="text-2xl font-bold text-coffee-700">₱{user.totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                            <div className="text-sm text-gray-500 mb-1">Loyalty Points</div>
                            <div className="text-2xl font-bold text-amber-600">{(user as any).loyaltyPoints || 0}</div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b border-gray-100 pb-2">Contact Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group">
                                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-100 transition-colors">
                                    <Mail className="w-5 h-5" />
                                </div>
                                <div className="flex-1 overflow-hidden">
                                    <div className="text-xs text-gray-500">Email Address</div>
                                    <div className="text-sm font-medium text-gray-900 truncate" title={user.email}>{user.email}</div>
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        copyToClipboard(user.email || '');
                                    }}
                                    className="p-2 text-gray-400 hover:text-coffee-600 transition-colors"
                                >
                                    <Copy className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group">
                                <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600 group-hover:bg-green-100 transition-colors">
                                    <Phone className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className="text-xs text-gray-500">Phone Number</div>
                                    <div className="text-sm font-medium text-gray-900">{user.phone || 'Not provided'}</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group">
                                <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 group-hover:bg-purple-100 transition-colors">
                                    <Shield className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className="text-xs text-gray-500">User ID</div>
                                    <div className="text-sm font-medium text-gray-900 font-mono">{user.uid}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    ) : null;
};

const AdminUsersPage: React.FC = () => {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState<string>('all');
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
    const [sortField, setSortField] = useState<SortField>('joined');
    const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
    const [copiedEmail, setCopiedEmail] = useState<string | null>(null);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);

    // Show toast notification
    const showToast = (message: string, type: 'success' | 'error') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

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
                showToast('Failed to load users', 'error');
            });

        return () => unsubscribe();
    }, []);

    // Sorting logic
    const sortedUsers = [...users].sort((a, b) => {
        let comparison = 0;
        switch (sortField) {
            case 'name':
                comparison = `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
                break;
            case 'role':
                comparison = (a.role || 'customer').localeCompare(b.role || 'customer');
                break;
            case 'email':
                comparison = (a.email || '').localeCompare(b.email || '');
                break;
            case 'orders':
                comparison = a.totalOrders - b.totalOrders;
                break;
            case 'spent':
                comparison = a.totalSpent - b.totalSpent;
                break;
            case 'joined':
                comparison = a.createdAt.getTime() - b.createdAt.getTime();
                break;
        }
        return sortDirection === 'asc' ? comparison : -comparison;
    });

    const filteredUsers = sortedUsers.filter(user => {
        const matchesRole = filterRole === 'all' || user.role === filterRole;
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch =
            (user.firstName?.toLowerCase() || '').includes(searchLower) ||
            (user.lastName?.toLowerCase() || '').includes(searchLower) ||
            (user.email?.toLowerCase() || '').includes(searchLower) ||
            (user.phone?.toLowerCase() || '').includes(searchLower);

        return matchesRole && matchesSearch;
    });

    // Handle sort
    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    // Stats Calculation
    const totalUsers = users.length;
    const totalCustomers = users.filter(u => u.role === 'customer' || !u.role).length;
    const totalEmployees = users.filter(u => u.role === 'employee').length;
    const totalAdmins = users.filter(u => u.role === 'admin').length;

    const handleRoleUpdate = async (userId: string, newRole: 'customer' | 'employee' | 'admin') => {
        try {
            await db.collection('users').doc(userId).update({ role: newRole });
            setActiveDropdown(null);
            showToast(`Role updated to ${newRole} successfully!`, 'success');
        } catch (error) {
            console.error("Error updating user role:", error);
            showToast('Failed to update role', 'error');
        }
    };

    const copyToClipboard = async (email: string) => {
        try {
            await navigator.clipboard.writeText(email);
            setCopiedEmail(email);
            setTimeout(() => setCopiedEmail(null), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const StatCard = ({ title, value, icon: Icon, color, trend }: {
        title: string,
        value: number,
        icon: any,
        color: string,
        trend?: number
    }) => (
        <div className="group bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 cursor-pointer">
            <div className={`p-3 rounded-xl ${color} bg-opacity-10 transition-transform duration-300 group-hover:scale-110`}>
                <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
            </div>
            <div className="flex-1">
                <p className="text-sm text-gray-500 font-medium mb-1">{title}</p>
                <div className="flex items-center gap-2">
                    <h3 className="text-2xl font-bold text-gray-900 tracking-tight">{value}</h3>
                    {trend !== undefined && (
                        <span className={`text-xs font-medium flex items-center gap-0.5 ${trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-600' : 'text-gray-400'
                            }`}>
                            {trend > 0 ? <TrendingUp className="w-3 h-3" /> :
                                trend < 0 ? <TrendingDown className="w-3 h-3" /> :
                                    <Minus className="w-3 h-3" />}
                            {trend !== 0 && `${Math.abs(trend)}%`}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );

    const SortHeader = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
        <button
            onClick={() => handleSort(field)}
            className="flex items-center gap-1 hover:text-gray-700 transition-colors group"
        >
            {children}
            <ArrowUpDown className={`w-3.5 h-3.5 transition-opacity ${sortField === field ? 'opacity-100 text-coffee-600' : 'opacity-0 group-hover:opacity-50'
                }`} />
        </button>
    );

    return (
        <div className="space-y-8 pb-10 max-w-[1600px] mx-auto">
            {/* Toast Notification */}
            {toast && (
                <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-in slide-in-from-top-5 ${toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                    }`}>
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">{toast.message}</span>
                </div>
            )}

            {/* Header & Stats */}
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">User Management</h1>
                        <p className="text-gray-500 mt-1">Manage access, roles, and view user statistics.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard title="Total Users" value={totalUsers} icon={Users} color="bg-gray-600" trend={0} />
                    <StatCard title="Customers" value={totalCustomers} icon={User} color="bg-green-600" trend={12} />
                    <StatCard title="Employees" value={totalEmployees} icon={Briefcase} color="bg-blue-600" trend={0} />
                    <StatCard title="Admins" value={totalAdmins} icon={Shield} color="bg-purple-600" trend={0} />
                </div>
            </div>

            {/* Main Content Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                {/* Toolbar */}
                <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row gap-4 justify-between bg-gradient-to-r from-gray-50/50 to-white items-center">
                    <div className="relative w-full sm:max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search by name, email, or phone..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-coffee-500 focus:border-transparent outline-none transition-all shadow-sm"
                        />
                    </div>
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <div className="relative w-full sm:w-48">
                            <select
                                value={filterRole}
                                onChange={(e) => setFilterRole(e.target.value)}
                                className="w-full appearance-none bg-white border border-gray-200 text-gray-700 py-2.5 px-4 pr-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500 cursor-pointer font-medium text-sm shadow-sm"
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

                {/* Desktop Table View */}
                <div className="hidden lg:block overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="sticky top-0 bg-gray-50 z-10 shadow-sm">
                            <tr className="border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                                <th className="px-6 py-4 w-[25%]">
                                    <SortHeader field="name">User Details</SortHeader>
                                </th>
                                <th className="px-6 py-4 w-[15%]">
                                    <SortHeader field="role">Role</SortHeader>
                                </th>
                                <th className="px-6 py-4 w-[25%]">
                                    <SortHeader field="email">Contact Info</SortHeader>
                                </th>
                                <th className="px-6 py-4 w-[15%]">
                                    <SortHeader field="orders">Activity</SortHeader>
                                </th>
                                <th className="px-6 py-4 w-[15%]">
                                    <SortHeader field="joined">Joined</SortHeader>
                                </th>
                                <th className="px-6 py-4 w-[5%] text-right"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
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
                                    <tr
                                        key={user.uid}
                                        onClick={() => setSelectedUser(user)}
                                        className="group hover:bg-gradient-to-r hover:from-coffee-50/30 hover:to-transparent transition-all duration-200 cursor-pointer"
                                    >
                                        <td className="px-6 py-4 align-top">
                                            <div className="flex items-start gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-coffee-400 to-coffee-600 flex items-center justify-center text-white font-bold shadow-sm overflow-hidden flex-shrink-0 ring-2 ring-white group-hover:ring-coffee-200 transition-all">
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
                                                <div className="flex items-center gap-2 text-sm text-gray-600 group-hover:text-gray-900 transition-colors group/email">
                                                    <div className="w-6 h-6 rounded-full bg-gray-50 flex items-center justify-center flex-shrink-0">
                                                        <Mail className="w-3 h-3 text-gray-400" />
                                                    </div>
                                                    <span className="truncate max-w-[140px]" title={user.email || ''}>{user.email}</span>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            copyToClipboard(user.email || '');
                                                        }}
                                                        className="opacity-0 group-hover/email:opacity-100 transition-opacity p-1 hover:bg-gray-100 rounded"
                                                    >
                                                        {copiedEmail === user.email ? (
                                                            <Check className="w-3 h-3 text-green-600" />
                                                        ) : (
                                                            <Copy className="w-3 h-3 text-gray-400" />
                                                        )}
                                                    </button>
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
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setActiveDropdown(activeDropdown === user.uid ? null : user.uid);
                                                }}
                                                className={`p-2 rounded-lg transition-all ${activeDropdown === user.uid ? 'bg-coffee-50 text-coffee-600 ring-1 ring-coffee-200' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
                                            >
                                                <MoreVertical className="w-5 h-5" />
                                            </button>

                                            {activeDropdown === user.uid && (
                                                <div
                                                    className="absolute right-8 top-8 w-56 bg-white rounded-xl shadow-xl border border-gray-100 z-50 animate-in fade-in zoom-in-95 duration-100 origin-top-right"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
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

                {/* Mobile Card View */}
                <div className="lg:hidden p-4 space-y-4">
                    {loading ? (
                        Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="bg-gray-50 p-4 rounded-xl animate-pulse">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                                    <div className="flex-1">
                                        <div className="h-4 w-32 bg-gray-200 rounded mb-2"></div>
                                        <div className="h-3 w-24 bg-gray-200 rounded"></div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : filteredUsers.length === 0 ? (
                        <div className="text-center py-12">
                            <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500">No users found</p>
                        </div>
                    ) : (
                        filteredUsers.map((user) => (
                            <div
                                key={user.uid}
                                onClick={() => setSelectedUser(user)}
                                className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer"
                            >
                                <div className="flex items-start gap-3 mb-3">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-coffee-400 to-coffee-600 flex items-center justify-center text-white font-bold shadow-sm overflow-hidden flex-shrink-0 ring-2 ring-white">
                                        {user.photoURL ? (
                                            <img src={user.photoURL} alt={user.firstName} className="w-full h-full object-cover" />
                                        ) : (
                                            <span>{user.firstName?.[0]}{user.lastName?.[0]}</span>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-semibold text-gray-900">{user.firstName} {user.lastName}</div>
                                        <div className="text-xs text-gray-500 mt-0.5">{user.email}</div>
                                        <div className="mt-2">{getRoleBadge(user.role)}</div>
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setActiveDropdown(activeDropdown === user.uid ? null : user.uid);
                                        }}
                                        className="p-2 rounded-lg text-gray-400 hover:bg-gray-100"
                                    >
                                        <MoreVertical className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="grid grid-cols-3 gap-2 pt-3 border-t border-gray-100">
                                    <div className="text-center">
                                        <div className="text-xs text-gray-500">Orders</div>
                                        <div className="font-semibold text-gray-900">{user.totalOrders}</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-xs text-gray-500">Spent</div>
                                        <div className="font-semibold text-coffee-700 text-sm">₱{user.totalSpent.toFixed(0)}</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-xs text-gray-500">Points</div>
                                        <div className="font-semibold text-amber-600">{(user as any).loyaltyPoints || 0}</div>
                                    </div>
                                </div>

                                {activeDropdown === user.uid && (
                                    <div className="mt-3 pt-3 border-t border-gray-100 space-y-1" onClick={(e) => e.stopPropagation()}>
                                        <button onClick={() => handleRoleUpdate(user.uid, 'admin')} className="w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-gray-50 flex items-center gap-2">
                                            <Shield className="w-4 h-4" /> Set as Admin
                                        </button>
                                        <button onClick={() => handleRoleUpdate(user.uid, 'employee')} className="w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-gray-50 flex items-center gap-2">
                                            <Briefcase className="w-4 h-4" /> Set as Employee
                                        </button>
                                        <button onClick={() => handleRoleUpdate(user.uid, 'customer')} className="w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-gray-50 flex items-center gap-2">
                                            <User className="w-4 h-4" /> Set as Customer
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>

                {/* Footer */}
                {!loading && filteredUsers.length > 0 && (
                    <div className="px-6 py-4 border-t border-gray-100 flex justify-between items-center text-sm text-gray-600 bg-gray-50">
                        <span className="font-medium">Showing <span className="text-gray-900">{filteredUsers.length}</span> of <span className="text-gray-900">{users.length}</span> users</span>
                        <div className="flex items-center gap-2 text-xs">
                            <span className="text-gray-500">Sorted by: <span className="font-medium text-gray-700">{sortField}</span> ({sortDirection})</span>
                        </div>
                    </div>
                )}
            </div>

            {/* User Detail Modal */}
            {selectedUser && (
                <UserDetailModal user={selectedUser} onClose={() => setSelectedUser(null)} />
            )}
        </div>
    );
};

export default AdminUsersPage;
