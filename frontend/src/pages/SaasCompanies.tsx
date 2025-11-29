import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosClient from '../api/axiosClient';
import {
    Building2, Search, Filter, Plus, Edit, Trash2, Ban, CheckCircle,
    Users, Calendar, CreditCard, MoreVertical, Eye, Settings as SettingsIcon,
    Mail, DollarSign, TrendingUp, Activity, Download, RefreshCw, ArrowUpDown
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Company {
    id: number;
    name: string;
    email: string;
    plan: string;
    is_active: boolean;
    subscription_end_date: string | null;
    max_users: number;
    created_at: string;
    user_count?: number;
}

const SaasCompanies = () => {
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState('');
    const [filterPlan, setFilterPlan] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');
    const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
    const [sortBy, setSortBy] = useState<'name' | 'created_at' | 'plan'>('created_at');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    // Fetch companies
    const { data: companiesData, isLoading, refetch } = useQuery({
        queryKey: ['all-companies'],
        queryFn: async () => {
            const response = await axiosClient.get('/api/company/');
            const data = response.data.results || response.data;
            return Array.isArray(data) ? data : [];
        },
    });

    const companies = (companiesData as Company[]) || [];

    // Filter and sort companies
    const filteredCompanies = companies
        .filter(company => {
            const matchesSearch = company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                company.email.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesPlan = filterPlan === 'all' || company.plan === filterPlan;
            const matchesStatus = filterStatus === 'all' ||
                (filterStatus === 'active' && company.is_active) ||
                (filterStatus === 'inactive' && !company.is_active);
            return matchesSearch && matchesPlan && matchesStatus;
        })
        .sort((a, b) => {
            let comparison = 0;
            if (sortBy === 'name') {
                comparison = a.name.localeCompare(b.name);
            } else if (sortBy === 'created_at') {
                comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
            } else if (sortBy === 'plan') {
                comparison = a.plan.localeCompare(b.plan);
            }
            return sortOrder === 'asc' ? comparison : -comparison;
        });

    // Mutations
    const toggleActiveMutation = useMutation({
        mutationFn: async ({ id, is_active }: { id: number; is_active: boolean }) => {
            return axiosClient.patch(`/api/company/${id}/`, { is_active });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['all-companies'] });
            queryClient.invalidateQueries({ queryKey: ['saas-stats'] });
            toast.success('Statut mis à jour');
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: number) => axiosClient.delete(`/api/company/${id}/`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['all-companies'] });
            queryClient.invalidateQueries({ queryKey: ['saas-stats'] });
            toast.success('Entreprise supprimée');
            setIsDeleteDialogOpen(false);
            setSelectedCompany(null);
        },
    });

    const updatePlanMutation = useMutation({
        mutationFn: async ({ id, plan }: { id: number; plan: string }) => {
            return axiosClient.patch(`/api/company/${id}/`, { plan });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['all-companies'] });
            queryClient.invalidateQueries({ queryKey: ['saas-stats'] });
            toast.success('Plan mis à jour');
        },
    });

    const getPlanBadge = (plan: string) => {
        const badges = {
            free: { bg: 'bg-gray-100 dark:bg-gray-700', text: 'text-gray-700 dark:text-gray-300', label: 'Gratuit', price: '0' },
            startup: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-300', label: 'Startup', price: '15,000' },
            enterprise: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-300', label: 'Entreprise', price: '50,000' },
        };
        return badges[plan as keyof typeof badges] || badges.free;
    };

    const getPlanPrice = (plan: string) => {
        const prices = { free: 0, startup: 15000, enterprise: 50000 };
        return prices[plan as keyof typeof prices] || 0;
    };

    // Calculate stats
    const activeCompanies = companies.filter(c => c.is_active).length;
    const totalRevenue = companies.filter(c => c.is_active).reduce((sum, c) => sum + getPlanPrice(c.plan), 0);

    const exportToCSV = () => {
        const headers = ['ID', 'Nom', 'Email', 'Plan', 'Statut', 'Date création'];
        const rows = filteredCompanies.map(c => [
            c.id,
            c.name,
            c.email,
            getPlanBadge(c.plan).label,
            c.is_active ? 'Active' : 'Suspendue',
            new Date(c.created_at).toLocaleDateString('fr-FR')
        ]);
        const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `entreprises_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        toast.success('Export CSV réussi');
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="max-w-7xl mx-auto p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                            <Building2 className="text-primary-600" size={32} />
                            Gestion des Entreprises
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                            {filteredCompanies.length} entreprise(s) • {activeCompanies} active(s)
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => {
                                refetch();
                                toast.success('Données actualisées');
                            }}
                            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                        >
                            <RefreshCw size={20} />
                            Actualiser
                        </button>
                        <button
                            onClick={exportToCSV}
                            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                        >
                            <Download size={20} />
                            Exporter
                        </button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
                        <div className="flex items-center justify-between mb-2">
                            <Building2 size={24} className="opacity-90" />
                        </div>
                        <p className="text-sm opacity-90 mb-1">Total Entreprises</p>
                        <p className="text-3xl font-bold">{companies.length}</p>
                    </div>
                    <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
                        <div className="flex items-center justify-between mb-2">
                            <CheckCircle size={24} className="opacity-90" />
                        </div>
                        <p className="text-sm opacity-90 mb-1">Actives</p>
                        <p className="text-3xl font-bold">{activeCompanies}</p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
                        <div className="flex items-center justify-between mb-2">
                            <DollarSign size={24} className="opacity-90" />
                        </div>
                        <p className="text-sm opacity-90 mb-1">Revenu MRR</p>
                        <p className="text-2xl font-bold">{totalRevenue.toLocaleString('fr-FR')} FCFA</p>
                    </div>
                    <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white">
                        <div className="flex items-center justify-between mb-2">
                            <TrendingUp size={24} className="opacity-90" />
                        </div>
                        <p className="text-sm opacity-90 mb-1">Taux d'activation</p>
                        <p className="text-3xl font-bold">{companies.length > 0 ? Math.round((activeCompanies / companies.length) * 100) : 0}%</p>
                    </div>
                </div>

                {/* Filters & Controls */}
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        {/* Search */}
                        <div className="relative md:col-span-2">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Rechercher par nom ou email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            />
                        </div>

                        {/* Filter by Plan */}
                        <select
                            value={filterPlan}
                            onChange={(e) => setFilterPlan(e.target.value)}
                            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                            <option value="all">Tous les plans</option>
                            <option value="free">Gratuit</option>
                            <option value="startup">Startup</option>
                            <option value="enterprise">Entreprise</option>
                        </select>

                        {/* Filter by Status */}
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                            <option value="all">Tous les statuts</option>
                            <option value="active">Actives</option>
                            <option value="inactive">Suspendues</option>
                        </select>

                        {/* Sort */}
                        <div className="flex gap-2">
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value as any)}
                                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            >
                                <option value="created_at">Date</option>
                                <option value="name">Nom</option>
                                <option value="plan">Plan</option>
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

                {/* Companies Grid */}
                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 animate-pulse">
                                <div className="h-12 w-12 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4" />
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
                                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                            </div>
                        ))}
                    </div>
                ) : filteredCompanies.length === 0 ? (
                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-12 text-center">
                        <Building2 className="mx-auto text-gray-400 mb-4" size={48} />
                        <p className="text-gray-500 dark:text-gray-400">Aucune entreprise trouvée</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredCompanies.map((company) => {
                            const planBadge = getPlanBadge(company.plan);
                            return (
                                <div key={company.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-xl transition-all group">
                                    {/* Header with gradient */}
                                    <div className="bg-gradient-to-r from-primary-500 to-primary-600 p-4">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 rounded-lg bg-white/20 backdrop-blur flex items-center justify-center text-white font-bold text-lg">
                                                    {company.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-white">{company.name}</h3>
                                                    <p className="text-xs text-white/80 flex items-center gap-1">
                                                        <Mail size={12} />
                                                        {company.email}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Body */}
                                    <div className="p-4 space-y-4">
                                        {/* Plan & Price */}
                                        <div className="flex items-center justify-between">
                                            <span className={`px-3 py-1 rounded-lg text-sm font-medium ${planBadge.bg} ${planBadge.text}`}>
                                                {planBadge.label}
                                            </span>
                                            <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                                {planBadge.price} FCFA/mois
                                            </span>
                                        </div>

                                        {/* Info */}
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                                <Users size={16} />
                                                <span>{company.max_users} utilisateurs max</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                                <Calendar size={16} />
                                                <span>Créée le {new Date(company.created_at).toLocaleDateString('fr-FR')}</span>
                                            </div>
                                        </div>

                                        {/* Status */}
                                        <div>
                                            {company.is_active ? (
                                                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-sm font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                                                    <CheckCircle size={14} />
                                                    Active
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-sm font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400">
                                                    <Ban size={14} />
                                                    Suspendue
                                                </span>
                                            )}
                                        </div>

                                        {/* Actions */}
                                        <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                                            <button
                                                onClick={() => toggleActiveMutation.mutate({ id: company.id, is_active: !company.is_active })}
                                                className="flex-1 px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg flex items-center justify-center gap-2 transition-colors"
                                            >
                                                {company.is_active ? <Ban size={16} /> : <CheckCircle size={16} />}
                                                {company.is_active ? 'Suspendre' : 'Activer'}
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setSelectedCompany(company);
                                                    setIsDeleteDialogOpen(true);
                                                }}
                                                className="px-3 py-2 text-sm bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 text-red-700 dark:text-red-400 rounded-lg transition-colors"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>

                                        {/* Quick Plan Change */}
                                        <div className="pt-2">
                                            <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Changer de plan</label>
                                            <select
                                                value={company.plan}
                                                onChange={(e) => updatePlanMutation.mutate({ id: company.id, plan: e.target.value })}
                                                className="w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                            >
                                                <option value="free">Gratuit</option>
                                                <option value="startup">Startup</option>
                                                <option value="enterprise">Entreprise</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Delete Confirmation Dialog */}
            {isDeleteDialogOpen && selectedCompany && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full">
                                <Trash2 className="text-red-600 dark:text-red-400" size={24} />
                            </div>
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Supprimer l'entreprise</h2>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            Êtes-vous sûr de vouloir supprimer <strong>{selectedCompany.name}</strong> ? Cette action est irréversible et supprimera toutes les données associées.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setIsDeleteDialogOpen(false);
                                    setSelectedCompany(null);
                                }}
                                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={() => deleteMutation.mutate(selectedCompany.id)}
                                disabled={deleteMutation.isPending}
                                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg disabled:opacity-50"
                            >
                                {deleteMutation.isPending ? 'Suppression...' : 'Supprimer'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SaasCompanies;
