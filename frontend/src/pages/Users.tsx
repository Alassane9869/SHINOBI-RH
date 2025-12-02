import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosClient from '../api/axiosClient';
import {
    Plus, Search, Filter, Edit, Trash2, Shield, Mail, User as UserIcon,
    Building2, AlertCircle, CheckCircle, Calendar, Clock, Eye, EyeOff,
    Download, RefreshCw, MapPin, Phone, Briefcase, Award, Activity,
    XCircle, Lock, Unlock, MoreVertical, ArrowUpDown, UserCog, Key,
    Send, CheckSquare, Square
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import useAuthStore from '../auth/AuthStore';
import { useNavigate } from 'react-router-dom';

interface User {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    role: string;
    company?: {
        id: number;
        name: string;
        plan?: string;
        is_active?: boolean;
        email?: string;
        created_at?: string;
    };
    is_active?: boolean;
    has_employee_profile?: boolean;
    date_joined?: string;
    last_login?: string;

    // Additional detailed fields
    phone_number?: string;
    profile_picture?: string;
    department?: string;
    position?: string;
    employee_id?: string;
    manager?: {
        id: number;
        first_name: string;
        last_name: string;
    };

    // Permissions & Access
    permissions?: string[];
    groups?: string[];
    is_superuser?: boolean;
    is_staff?: boolean;

    // Activity tracking
    login_count?: number;
    failed_login_attempts?: number;
    last_password_change?: string;
    password_expires_at?: string;

    // Metadata
    created_by?: string;
    updated_at?: string;
    notes?: string;
}

interface Company {
    id: number;
    name: string;
    plan: string;
    is_active: boolean;
    email?: string;
    user_count?: number;
    max_users?: number;
    created_at?: string;
}

const userSchema = z.object({
    email: z.string().email('Email invalide'),
    first_name: z.string().min(2, 'Prénom requis'),
    last_name: z.string().min(2, 'Nom requis'),
    role: z.enum(['owner', 'admin', 'rh', 'manager', 'employe']),
    password: z.string().min(8, 'Mot de passe min 8 caractères').optional().or(z.literal('')),
    company_id: z.number().optional(),
});

type UserFormData = z.infer<typeof userSchema>;

const Users: React.FC = () => {
    const { user: currentUser } = useAuthStore();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [detailUser, setDetailUser] = useState<User | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [companyFilter, setCompanyFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [sortBy, setSortBy] = useState<'name' | 'email' | 'date_joined' | 'company'>('date_joined');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
    const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
    const [showBulkActions, setShowBulkActions] = useState(false);
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { register, handleSubmit, reset, formState: { errors }, setValue } = useForm<UserFormData>({
        resolver: zodResolver(userSchema),
    });

    // Fetch users
    const { data: usersData, isLoading: usersLoading, refetch } = useQuery({
        queryKey: ['users'],
        queryFn: async () => {
            const response = await axiosClient.get('/api/auth/users/?page_size=1000');
            // Handle both paginated and direct array responses
            const data = response.data.results || response.data;
            return Array.isArray(data) ? data : [];
        },
    });

    // Fetch companies for owner
    const { data: companiesData } = useQuery({
        queryKey: ['all-companies'],
        queryFn: async () => {
            const response = await axiosClient.get('/api/company/');
            const data = response.data.results || response.data;
            return Array.isArray(data) ? data : [];
        },
        enabled: currentUser?.role === 'owner',
    });

    const users = usersData || [];
    const companies = companiesData || [];

    // Filter and sort users
    const filteredUsers = users
        .filter(user => {
            const matchesSearch =
                user.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.company?.name?.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesRole = roleFilter === 'all' || user.role === roleFilter;
            const matchesCompany = companyFilter === 'all' || user.company?.id.toString() === companyFilter;
            const matchesStatus = statusFilter === 'all' ||
                (statusFilter === 'active' && user.is_active !== false) ||
                (statusFilter === 'inactive' && user.is_active === false);
            return matchesSearch && matchesRole && matchesCompany && matchesStatus;
        })
        .sort((a, b) => {
            let comparison = 0;
            if (sortBy === 'name') {
                comparison = `${a.first_name} ${a.last_name}`.localeCompare(`${b.first_name} ${b.last_name}`);
            } else if (sortBy === 'email') {
                comparison = a.email.localeCompare(b.email);
            } else if (sortBy === 'date_joined' && a.date_joined && b.date_joined) {
                comparison = new Date(a.date_joined).getTime() - new Date(b.date_joined).getTime();
            } else if (sortBy === 'company') {
                comparison = (a.company?.name || '').localeCompare(b.company?.name || '');
            }
            return sortOrder === 'asc' ? comparison : -comparison;
        });

    // Mutations
    const mutation = useMutation({
        mutationFn: async (data: UserFormData) => {
            if (selectedUser) {
                const updateData: any = { ...data };
                if (!updateData.password) delete updateData.password;
                return axiosClient.patch(`/api/auth/users/${selectedUser.id}/`, updateData);
            } else {
                return axiosClient.post('/api/auth/users/', data);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            queryClient.invalidateQueries({ queryKey: ['saas-stats'] });
            toast.success(selectedUser ? 'Utilisateur modifié' : 'Utilisateur créé');
            setIsModalOpen(false);
            reset();
            setSelectedUser(null);
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.detail || 'Erreur');
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: number) => axiosClient.delete(`/api/auth/users/${id}/`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            queryClient.invalidateQueries({ queryKey: ['saas-stats'] });
            toast.success('Utilisateur supprimé');
            setIsDeleteDialogOpen(false);
            setSelectedUser(null);
        },
    });

    const toggleActiveMutation = useMutation({
        mutationFn: async ({ id, is_active }: { id: number; is_active: boolean }) => {
            return axiosClient.patch(`/api/auth/users/${id}/`, { is_active });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            toast.success('Statut modifié');
        },
    });

    const onSubmit = (data: UserFormData) => {
        mutation.mutate(data);
    };

    // Impersonation
    const handleImpersonate = async (userId: number, userName: string) => {
        if (confirm(`⚠️ IMPERSONNATION\n\nVous allez vous connecter en tant que:\n${userName}\n\nContinuer ?`)) {
            try {
                toast.loading('Impersonnation...', { id: 'imp' });
                const response = await axiosClient.post(`/api/auth/saas/${userId}/impersonate/`);
                if (response.data.access) {
                    localStorage.setItem('access_token', response.data.access);
                    localStorage.setItem('refresh_token', response.data.refresh);
                    toast.success(`Connecté en tant que ${userName}`, { id: 'imp' });
                    setTimeout(() => window.location.href = '/dashboard', 500);
                }
            } catch (error: any) {
                toast.error('Erreur impersonnation', { id: 'imp' });
            }
        }
    };

    // Reset password
    const handleResetPassword = async (userId: number, userEmail: string) => {
        if (confirm(`Réinitialiser le mot de passe de ${userEmail} ?`)) {
            try {
                await axiosClient.post(`/api/auth/users/${userId}/reset_password/`);
                toast.success('Email envoyé');
            } catch (error) {
                toast.error('Erreur');
            }
        }
    };

    // Send email
    const handleSendEmail = (userEmail: string) => {
        window.location.href = `mailto:${userEmail}`;
    };

    // Bulk actions
    const handleSelectAll = () => {
        if (selectedUsers.length === filteredUsers.length) {
            setSelectedUsers([]);
        } else {
            setSelectedUsers(filteredUsers.map(u => u.id));
        }
    };

    const handleBulkActivate = async () => {
        try {
            await Promise.all(selectedUsers.map(id =>
                axiosClient.patch(`/api/auth/users/${id}/`, { is_active: true })
            ));
            queryClient.invalidateQueries({ queryKey: ['users'] });
            toast.success(`${selectedUsers.length} utilisateur(s) activé(s)`);
            setSelectedUsers([]);
        } catch (error) {
            toast.error('Erreur');
        }
    };

    const handleBulkDeactivate = async () => {
        try {
            await Promise.all(selectedUsers.map(id =>
                axiosClient.patch(`/api/auth/users/${id}/`, { is_active: false })
            ));
            queryClient.invalidateQueries({ queryKey: ['users'] });
            toast.success(`${selectedUsers.length} utilisateur(s) désactivé(s)`);
            setSelectedUsers([]);
        } catch (error) {
            toast.error('Erreur');
        }
    };

    const handleBulkDelete = async () => {
        if (confirm(`Supprimer ${selectedUsers.length} utilisateur(s) ?`)) {
            try {
                await Promise.all(selectedUsers.map(id =>
                    axiosClient.delete(`/api/auth/users/${id}/`)
                ));
                queryClient.invalidateQueries({ queryKey: ['users'] });
                toast.success(`${selectedUsers.length} utilisateur(s) supprimé(s)`);
                setSelectedUsers([]);
            } catch (error) {
                toast.error('Erreur');
            }
        }
    };

    const getRoleBadge = (role: string) => {
        const badges = {
            owner: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-300', label: 'Owner', icon: Shield },
            admin: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-300', label: 'Admin', icon: Shield },
            rh: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-300', label: 'RH', icon: Briefcase },
            manager: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-300', label: 'Manager', icon: Award },
            employe: { bg: 'bg-gray-100 dark:bg-gray-700', text: 'text-gray-700 dark:text-gray-300', label: 'Employé', icon: UserIcon },
        };
        return badges[role as keyof typeof badges] || badges.employe;
    };

    const getPlanBadge = (plan?: string) => {
        const badges = {
            free: { bg: 'bg-gray-100 dark:bg-gray-700', text: 'text-gray-700 dark:text-gray-300', label: 'Gratuit' },
            startup: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-300', label: 'Startup' },
            enterprise: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-300', label: 'Entreprise' },
        };
        return badges[plan as keyof typeof badges] || badges.free;
    };

    const exportToCSV = () => {
        const headers = ['ID', 'Nom', 'Prénom', 'Email', 'Rôle', 'Entreprise', 'Plan', 'Statut', 'Date création'];
        const rows = filteredUsers.map(u => [
            u.id,
            u.last_name,
            u.first_name,
            u.email,
            getRoleBadge(u.role).label,
            u.company?.name || 'N/A',
            u.company?.plan ? getPlanBadge(u.company.plan).label : 'N/A',
            u.is_active ? 'Actif' : 'Inactif',
            u.date_joined ? new Date(u.date_joined).toLocaleDateString('fr-FR') : 'N/A'
        ]);
        const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `utilisateurs_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        toast.success('Export CSV réussi');
    };

    // Calculate stats
    const totalUsers = users.length;
    const activeUsers = users.filter(u => u.is_active !== false).length;  // Default to active if undefined
    const ownerCount = users.filter(u => u.role === 'owner').length;
    const adminCount = users.filter(u => u.role === 'admin').length;
    const rhCount = users.filter(u => u.role === 'rh').length;
    const managerCount = users.filter(u => u.role === 'manager').length;
    const employeCount = users.filter(u => u.role === 'employe').length;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="max-w-7xl mx-auto p-6 space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                            <UserIcon className="text-primary-600 w-8 h-8" />
                            Gestion des Utilisateurs
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                            {filteredUsers.length} utilisateur(s) • {activeUsers} actif(s)
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => {
                                refetch();
                                toast.success('Données actualisées');
                            }}
                            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 text-sm"
                        >
                            <RefreshCw size={16} />
                            <span className="hidden sm:inline">Actualiser</span>
                        </button>
                        <button
                            onClick={exportToCSV}
                            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 text-sm"
                        >
                            <Download size={16} />
                            <span className="hidden sm:inline">Exporter</span>
                        </button>
                        <button
                            onClick={() => {
                                setSelectedUser(null);
                                reset();
                                setIsModalOpen(true);
                            }}
                            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg flex items-center gap-2 text-sm"
                        >
                            <Plus size={16} />
                            <span className="hidden sm:inline">Nouvel Utilisateur</span>
                            <span className="sm:hidden">Nouveau</span>
                        </button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                <UserIcon className="text-blue-600 dark:text-blue-400" size={20} />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Total</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalUsers}</p>
                            </div>
                        </div>
                    </div>
                    {currentUser?.role === 'owner' && (
                        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                                    <Shield className="text-purple-600 dark:text-purple-400" size={20} />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Owners</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{ownerCount}</p>
                                </div>
                            </div>
                        </div>
                    )}
                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                                <Shield className="text-red-600 dark:text-red-400" size={20} />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Admins</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{adminCount}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                <Briefcase className="text-blue-600 dark:text-blue-400" size={20} />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">RH</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{rhCount}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                <Award className="text-green-600 dark:text-green-400" size={20} />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Managers</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{managerCount}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                                <UserIcon className="text-gray-600 dark:text-gray-400" size={20} />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Employés</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{employeCount}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                        <div className="relative md:col-span-2">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Rechercher..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            />
                        </div>
                        <select
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                            <option value="all">Tous les rôles</option>
                            {currentUser?.role === 'owner' && <option value="owner">Owner</option>}
                            <option value="admin">Admin</option>
                            <option value="rh">RH</option>
                            <option value="manager">Manager</option>
                            <option value="employe">Employé</option>
                        </select>
                        {currentUser?.role === 'owner' && (
                            <select
                                value={companyFilter}
                                onChange={(e) => setCompanyFilter(e.target.value)}
                                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            >
                                <option value="all">Toutes les entreprises</option>
                                {companies.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        )}
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                            <option value="all">Tous les statuts</option>
                            <option value="active">Actifs</option>
                            <option value="inactive">Inactifs</option>
                        </select>
                        <div className="flex gap-2">
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value as any)}
                                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            >
                                <option value="date_joined">Date</option>
                                <option value="name">Nom</option>
                                <option value="email">Email</option>
                                <option value="company">Entreprise</option>
                            </select>
                            <button
                                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                            >
                                <ArrowUpDown size={20} className="text-gray-600 dark:text-gray-400" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Bulk Actions Bar */}
                {selectedUsers.length > 0 && (
                    <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <CheckSquare className="text-primary-600" size={20} />
                                <span className="font-medium text-gray-900 dark:text-white">
                                    {selectedUsers.length} utilisateur(s) sélectionné(s)
                                </span>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={handleBulkActivate}
                                    className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm flex items-center gap-2"
                                >
                                    <Unlock size={16} />
                                    Activer
                                </button>
                                <button
                                    onClick={handleBulkDeactivate}
                                    className="px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm flex items-center gap-2"
                                >
                                    <Lock size={16} />
                                    Désactiver
                                </button>
                                <button
                                    onClick={handleBulkDelete}
                                    className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm flex items-center gap-2"
                                >
                                    <Trash2 size={16} />
                                    Supprimer
                                </button>
                                <button
                                    onClick={() => setSelectedUsers([])}
                                    className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm"
                                >
                                    Annuler
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Users Table */}
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                    {usersLoading ? (
                        <div className="p-8 text-center">
                            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent text-primary-600" />
                        </div>
                    ) : filteredUsers.length === 0 ? (
                        <div className="p-12 text-center">
                            <UserIcon className="mx-auto text-gray-400 mb-4" size={48} />
                            <p className="text-gray-500 dark:text-gray-400">Aucun utilisateur trouvé</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 dark:bg-gray-900/50 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                    <tr>
                                        <th className="px-6 py-3 text-left">
                                            <input
                                                type="checkbox"
                                                checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                                                onChange={handleSelectAll}
                                                className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500"
                                            />
                                        </th>
                                        <th className="px-6 py-3 text-left">Utilisateur</th>
                                        <th className="px-6 py-3 text-left">Email</th>
                                        <th className="px-6 py-3 text-left">Rôle</th>
                                        {currentUser?.role === 'owner' && <th className="px-6 py-3 text-left">Entreprise</th>}
                                        <th className="px-6 py-3 text-left">Statut</th>
                                        <th className="px-6 py-3 text-left">Date création</th>
                                        <th className="px-6 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {filteredUsers.map((user) => {
                                        const roleBadge = getRoleBadge(user.role);
                                        const RoleIcon = roleBadge.icon;
                                        const isSelected = selectedUsers.includes(user.id);
                                        return (
                                            <tr key={user.id} className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 ${isSelected ? 'bg-primary-50 dark:bg-primary-900/10' : ''}`}>
                                                <td className="px-6 py-4">
                                                    <input
                                                        type="checkbox"
                                                        checked={isSelected}
                                                        onChange={() => {
                                                            if (isSelected) {
                                                                setSelectedUsers(selectedUsers.filter(id => id !== user.id));
                                                            } else {
                                                                setSelectedUsers([...selectedUsers, user.id]);
                                                            }
                                                        }}
                                                        className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500"
                                                    />
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-bold">
                                                            {user.first_name.charAt(0)}{user.last_name.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-gray-900 dark:text-white">
                                                                {user.first_name} {user.last_name}
                                                            </p>
                                                            <p className="text-xs text-gray-500 dark:text-gray-400">ID: {user.id}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                                        <Mail size={14} />
                                                        {user.email}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${roleBadge.bg} ${roleBadge.text}`}>
                                                        <RoleIcon size={12} />
                                                        {roleBadge.label}
                                                    </span>
                                                </td>
                                                {
                                                    currentUser?.role === 'owner' && (
                                                        <td className="px-6 py-4">
                                                            {user.company ? (
                                                                <div>
                                                                    <div className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-white">
                                                                        <Building2 size={14} />
                                                                        {user.company.name}
                                                                    </div>
                                                                    {user.company.plan && (
                                                                        <span className={`inline-block mt-1 px-2 py-0.5 rounded text-xs ${getPlanBadge(user.company.plan).bg} ${getPlanBadge(user.company.plan).text}`}>
                                                                            {getPlanBadge(user.company.plan).label}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            ) : (
                                                                <span className="text-xs text-gray-400">N/A</span>
                                                            )}
                                                        </td>
                                                    )
                                                }
                                                <td className="px-6 py-4">
                                                    {user.is_active !== false ? (
                                                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                                                            <CheckCircle size={12} />
                                                            Actif
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400">
                                                            <XCircle size={12} />
                                                            Inactif
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                                                    {user.date_joined ? new Date(user.date_joined).toLocaleDateString('fr-FR') : 'N/A'}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <button
                                                            onClick={() => {
                                                                setDetailUser(user);
                                                                setIsDetailModalOpen(true);
                                                            }}
                                                            className="p-1.5 rounded hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                                                            title="Voir détails"
                                                        >
                                                            <Eye size={16} />
                                                        </button>

                                                        {currentUser?.role === 'owner' && user.role !== 'owner' && (
                                                            <>
                                                                <button
                                                                    onClick={() => handleImpersonate(user.id, `${user.first_name} ${user.last_name}`)}
                                                                    className="p-1.5 rounded hover:bg-purple-100 dark:hover:bg-purple-900/30 text-purple-600 dark:text-purple-400"
                                                                    title="Se connecter en tant que cet utilisateur"
                                                                >
                                                                    <UserCog size={16} />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleResetPassword(user.id, user.email)}
                                                                    className="p-1.5 rounded hover:bg-orange-100 dark:hover:bg-orange-900/30 text-orange-600 dark:text-orange-400"
                                                                    title="Réinitialiser le mot de passe"
                                                                >
                                                                    <Key size={16} />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleSendEmail(user.email)}
                                                                    className="p-1.5 rounded hover:bg-green-100 dark:hover:bg-green-900/30 text-green-600 dark:text-green-400"
                                                                    title="Envoyer un email"
                                                                >
                                                                    <Send size={16} />
                                                                </button>
                                                            </>
                                                        )}

                                                        <button
                                                            onClick={() => toggleActiveMutation.mutate({ id: user.id, is_active: user.is_active === false })}
                                                            className={`p-1.5 rounded ${user.is_active !== false ? 'hover:bg-orange-100 dark:hover:bg-orange-900/30 text-orange-600 dark:text-orange-400' : 'hover:bg-green-100 dark:hover:bg-green-900/30 text-green-600 dark:text-green-400'}`}
                                                            title={user.is_active !== false ? 'Désactiver' : 'Activer'}
                                                        >
                                                            {user.is_active !== false ? <Lock size={16} /> : <Unlock size={16} />}
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setSelectedUser(user);
                                                                setValue('email', user.email);
                                                                setValue('first_name', user.first_name);
                                                                setValue('last_name', user.last_name);
                                                                setValue('role', user.role as any);
                                                                setIsModalOpen(true);
                                                            }}
                                                            className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
                                                            title="Modifier"
                                                        >
                                                            <Edit size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setSelectedUser(user);
                                                                setIsDeleteDialogOpen(true);
                                                            }}
                                                            className="p-1.5 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400"
                                                            title="Supprimer"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Create/Edit Modal */}
            {
                isModalOpen && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                                {selectedUser ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur'}
                            </h2>
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                                    <input
                                        {...register('email')}
                                        type="email"
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    />
                                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Prénom</label>
                                        <input
                                            {...register('first_name')}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        />
                                        {errors.first_name && <p className="text-red-500 text-xs mt-1">{errors.first_name.message}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nom</label>
                                        <input
                                            {...register('last_name')}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        />
                                        {errors.last_name && <p className="text-red-500 text-xs mt-1">{errors.last_name.message}</p>}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Rôle</label>
                                    <select
                                        {...register('role')}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    >
                                        {currentUser?.role === 'owner' && <option value="owner">Owner</option>}
                                        <option value="admin">Admin</option>
                                        <option value="rh">RH</option>
                                        <option value="manager">Manager</option>
                                        <option value="employe">Employé</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Mot de passe {selectedUser && '(laisser vide pour ne pas changer)'}
                                    </label>
                                    <input
                                        {...register('password')}
                                        type="password"
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    />
                                    {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
                                </div>
                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsModalOpen(false);
                                            setSelectedUser(null);
                                            reset();
                                        }}
                                        className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={mutation.isPending}
                                        className="flex-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg disabled:opacity-50"
                                    >
                                        {mutation.isPending ? 'Enregistrement...' : 'Enregistrer'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }

            {/* Detail Modal - ULTRA COMPREHENSIVE */}
            {
                isDetailModalOpen && detailUser && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
                        <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full p-6 my-8">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Profil Utilisateur Complet</h2>
                                <button
                                    onClick={() => {
                                        setIsDetailModalOpen(false);
                                        setDetailUser(null);
                                    }}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                                >
                                    <XCircle size={24} className="text-gray-500" />
                                </button>
                            </div>

                            <div className="space-y-6">
                                {/* User Header */}
                                <div className="flex items-center gap-4 p-6 bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg text-white">
                                    <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-3xl font-bold">
                                        {detailUser.first_name.charAt(0)}{detailUser.last_name.charAt(0)}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-2xl font-bold">{detailUser.first_name} {detailUser.last_name}</h3>
                                        <p className="text-sm opacity-90 flex items-center gap-2 mt-1">
                                            <Mail size={14} />
                                            {detailUser.email}
                                        </p>
                                        {detailUser.phone_number && (
                                            <p className="text-sm opacity-90 flex items-center gap-2 mt-1">
                                                <Phone size={14} />
                                                {detailUser.phone_number}
                                            </p>
                                        )}
                                    </div>
                                    <div className="text-right">
                                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-sm font-medium ${detailUser.is_active !== false ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                                            {detailUser.is_active !== false ? <CheckCircle size={14} /> : <XCircle size={14} />}
                                            {detailUser.is_active !== false ? 'Actif' : 'Inactif'}
                                        </span>
                                    </div>
                                </div>

                                {/* Main Info Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {/* Role */}
                                    <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border-l-4 border-primary-500">
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Rôle</p>
                                        <div className="flex items-center gap-2">
                                            {React.createElement(getRoleBadge(detailUser.role).icon, { size: 18, className: 'text-primary-600' })}
                                            <span className="font-semibold text-gray-900 dark:text-white">{getRoleBadge(detailUser.role).label}</span>
                                        </div>
                                    </div>

                                    {/* ID */}
                                    <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">ID Utilisateur</p>
                                        <span className="font-semibold text-gray-900 dark:text-white">#{detailUser.id}</span>
                                    </div>

                                    {/* Employee ID */}
                                    {detailUser.employee_id && (
                                        <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">ID Employé</p>
                                            <span className="font-semibold text-gray-900 dark:text-white">{detailUser.employee_id}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Company Information */}
                                {detailUser.company && (
                                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                                        <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                            <Building2 size={18} className="text-blue-600" />
                                            Informations Entreprise
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Nom</p>
                                                <p className="font-medium text-gray-900 dark:text-white">{detailUser.company.name}</p>
                                            </div>
                                            {detailUser.company.plan && (
                                                <div>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Plan</p>
                                                    <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getPlanBadge(detailUser.company.plan).bg} ${getPlanBadge(detailUser.company.plan).text}`}>
                                                        {getPlanBadge(detailUser.company.plan).label}
                                                    </span>
                                                </div>
                                            )}
                                            {detailUser.company.email && (
                                                <div>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Email Entreprise</p>
                                                    <p className="font-medium text-gray-900 dark:text-white text-sm">{detailUser.company.email}</p>
                                                </div>
                                            )}
                                            {detailUser.company.is_active !== undefined && (
                                                <div>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Statut Entreprise</p>
                                                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${detailUser.company.is_active ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'}`}>
                                                        {detailUser.company.is_active ? <CheckCircle size={12} /> : <XCircle size={12} />}
                                                        {detailUser.company.is_active ? 'Active' : 'Inactive'}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Professional Details */}
                                {(detailUser.department || detailUser.position || detailUser.manager) && (
                                    <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                                        <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                            <Briefcase size={18} className="text-purple-600" />
                                            Détails Professionnels
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {detailUser.department && (
                                                <div>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Département</p>
                                                    <p className="font-medium text-gray-900 dark:text-white">{detailUser.department}</p>
                                                </div>
                                            )}
                                            {detailUser.position && (
                                                <div>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Poste</p>
                                                    <p className="font-medium text-gray-900 dark:text-white">{detailUser.position}</p>
                                                </div>
                                            )}
                                            {detailUser.manager && (
                                                <div className="md:col-span-2">
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Manager</p>
                                                    <p className="font-medium text-gray-900 dark:text-white">
                                                        {detailUser.manager.first_name} {detailUser.manager.last_name}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Permissions & Access */}
                                {(detailUser.is_superuser || detailUser.is_staff || detailUser.permissions || detailUser.groups) && (
                                    <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                                        <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                            <Shield size={18} className="text-orange-600" />
                                            Permissions & Accès
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {detailUser.is_superuser !== undefined && (
                                                <div className="flex items-center gap-2">
                                                    {detailUser.is_superuser ? <CheckCircle size={16} className="text-green-600" /> : <XCircle size={16} className="text-gray-400" />}
                                                    <span className="text-sm text-gray-900 dark:text-white">Superutilisateur</span>
                                                </div>
                                            )}
                                            {detailUser.is_staff !== undefined && (
                                                <div className="flex items-center gap-2">
                                                    {detailUser.is_staff ? <CheckCircle size={16} className="text-green-600" /> : <XCircle size={16} className="text-gray-400" />}
                                                    <span className="text-sm text-gray-900 dark:text-white">Staff</span>
                                                </div>
                                            )}
                                            {detailUser.groups && detailUser.groups.length > 0 && (
                                                <div className="md:col-span-2">
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Groupes</p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {detailUser.groups.map((group, idx) => (
                                                            <span key={idx} className="px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 rounded text-xs">
                                                                {group}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                            {detailUser.permissions && detailUser.permissions.length > 0 && (
                                                <div className="md:col-span-2">
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Permissions</p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {detailUser.permissions.slice(0, 10).map((perm, idx) => (
                                                            <span key={idx} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs">
                                                                {perm}
                                                            </span>
                                                        ))}
                                                        {detailUser.permissions.length > 10 && (
                                                            <span className="px-2 py-1 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded text-xs">
                                                                +{detailUser.permissions.length - 10} autres
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Activity Tracking */}
                                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                        <Activity size={18} className="text-green-600" />
                                        Activité & Sécurité
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {detailUser.date_joined && (
                                            <div>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
                                                    <Calendar size={12} />
                                                    Date d'inscription
                                                </p>
                                                <p className="font-medium text-gray-900 dark:text-white">
                                                    {new Date(detailUser.date_joined).toLocaleDateString('fr-FR', {
                                                        day: 'numeric',
                                                        month: 'long',
                                                        year: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </p>
                                            </div>
                                        )}
                                        {detailUser.last_login && (
                                            <div>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
                                                    <Clock size={12} />
                                                    Dernière connexion
                                                </p>
                                                <p className="font-medium text-gray-900 dark:text-white">
                                                    {new Date(detailUser.last_login).toLocaleDateString('fr-FR', {
                                                        day: 'numeric',
                                                        month: 'long',
                                                        year: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </p>
                                            </div>
                                        )}
                                        {detailUser.login_count !== undefined && (
                                            <div>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Nombre de connexions</p>
                                                <p className="font-medium text-gray-900 dark:text-white">{detailUser.login_count}</p>
                                            </div>
                                        )}
                                        {detailUser.failed_login_attempts !== undefined && (
                                            <div>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Tentatives échouées</p>
                                                <p className={`font-medium ${detailUser.failed_login_attempts > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                                    {detailUser.failed_login_attempts}
                                                </p>
                                            </div>
                                        )}
                                        {detailUser.last_password_change && (
                                            <div>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Dernier changement MDP</p>
                                                <p className="font-medium text-gray-900 dark:text-white">
                                                    {new Date(detailUser.last_password_change).toLocaleDateString('fr-FR')}
                                                </p>
                                            </div>
                                        )}
                                        {detailUser.password_expires_at && (
                                            <div>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Expiration MDP</p>
                                                <p className="font-medium text-gray-900 dark:text-white">
                                                    {new Date(detailUser.password_expires_at).toLocaleDateString('fr-FR')}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Metadata */}
                                {(detailUser.created_by || detailUser.updated_at || detailUser.notes) && (
                                    <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                                        <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Métadonnées</h4>
                                        <div className="space-y-3">
                                            {detailUser.created_by && (
                                                <div>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Créé par</p>
                                                    <p className="font-medium text-gray-900 dark:text-white">{detailUser.created_by}</p>
                                                </div>
                                            )}
                                            {detailUser.updated_at && (
                                                <div>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Dernière modification</p>
                                                    <p className="font-medium text-gray-900 dark:text-white">
                                                        {new Date(detailUser.updated_at).toLocaleDateString('fr-FR', {
                                                            day: 'numeric',
                                                            month: 'long',
                                                            year: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </p>
                                                </div>
                                            )}
                                            {detailUser.notes && (
                                                <div>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Notes</p>
                                                    <p className="text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-800 p-3 rounded border border-gray-200 dark:border-gray-600">
                                                        {detailUser.notes}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Profile Status */}
                                {detailUser.has_employee_profile !== undefined && (
                                    <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                        {detailUser.has_employee_profile ? (
                                            <>
                                                <CheckCircle className="text-blue-600" size={18} />
                                                <span className="text-sm text-gray-900 dark:text-white">Profil employé complet</span>
                                            </>
                                        ) : (
                                            <>
                                                <AlertCircle className="text-orange-600" size={18} />
                                                <span className="text-sm text-gray-900 dark:text-white">Profil employé incomplet</span>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="mt-6 flex justify-end gap-3">
                                <button
                                    onClick={() => {
                                        setSelectedUser(detailUser);
                                        setValue('email', detailUser.email);
                                        setValue('first_name', detailUser.first_name);
                                        setValue('last_name', detailUser.last_name);
                                        setValue('role', detailUser.role as any);
                                        setIsDetailModalOpen(false);
                                        setIsModalOpen(true);
                                    }}
                                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                                >
                                    <Edit size={16} />
                                    Modifier
                                </button>
                                <button
                                    onClick={() => {
                                        setIsDetailModalOpen(false);
                                        setDetailUser(null);
                                    }}
                                    className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg"
                                >
                                    Fermer
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Delete Dialog */}
            {
                isDeleteDialogOpen && selectedUser && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full">
                                    <Trash2 className="text-red-600 dark:text-red-400" size={24} />
                                </div>
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Supprimer l'utilisateur</h2>
                            </div>
                            <p className="text-gray-600 dark:text-gray-400 mb-6">
                                Êtes-vous sûr de vouloir supprimer <strong>{selectedUser.first_name} {selectedUser.last_name}</strong> ? Cette action est irréversible.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        setIsDeleteDialogOpen(false);
                                        setSelectedUser(null);
                                    }}
                                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={() => deleteMutation.mutate(selectedUser.id)}
                                    disabled={deleteMutation.isPending}
                                    className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg disabled:opacity-50"
                                >
                                    {deleteMutation.isPending ? 'Suppression...' : 'Supprimer'}
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default Users;
