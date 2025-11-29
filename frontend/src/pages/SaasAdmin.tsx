import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosClient from '../api/axiosClient';
import {
    Shield, Users, Building2, Activity, TrendingUp, DollarSign,
    AlertTriangle, CheckCircle, XCircle, Clock, Search, Filter,
    Edit, Trash2, Plus, RefreshCw, Download, Eye, Lock, Unlock,
    BarChart3, Zap, Database, Server, Mail, Bell, Settings
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

interface Company {
    id: number;
    name: string;
    email: string;
    plan: string;
    is_active: boolean;
    created_at: string;
    user_count?: number;
}

interface SaasStats {
    total_companies: number;
    active_companies: number;
    total_users: number;
    revenue_mrr: number;
}

const SaasAdmin = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [planFilter, setPlanFilter] = useState('all');
    const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    // Fetch stats
    const { data: stats, isLoading: statsLoading } = useQuery<SaasStats>({
        queryKey: ['saas-stats'],
        queryFn: async () => (await axiosClient.get('/api/auth/saas/global_stats/')).data,
        refetchInterval: 30000, // Auto-refresh every 30s
    });

    // Fetch companies
    const { data: companiesData, isLoading: companiesLoading, refetch } = useQuery({
        queryKey: ['all-companies'],
        queryFn: async () => {
            const response = await axiosClient.get('/api/company/?page_size=1000');
            return response.data.results || response.data;
        },
        refetchInterval: 30000,
    });

    const companies = (Array.isArray(companiesData) ? companiesData : []) as Company[];

    // Toggle company status
    const toggleStatusMutation = useMutation({
        mutationFn: async (company: Company) => {
            return axiosClient.patch(`/api/company/${company.id}/`, {
                is_active: !company.is_active
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['all-companies'] });
            queryClient.invalidateQueries({ queryKey: ['saas-stats'] });
            toast.success('Statut modifié avec succès');
        },
        onError: () => {
            toast.error('Erreur lors de la modification');
        }
    });

    // Delete company
    const deleteMutation = useMutation({
        mutationFn: async (id: number) => axiosClient.delete(`/api/company/${id}/`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['all-companies'] });
            queryClient.invalidateQueries({ queryKey: ['saas-stats'] });
            toast.success('Entreprise supprimée');
            setIsDeleteDialogOpen(false);
            setSelectedCompany(null);
        },
        onError: () => {
            toast.error('Erreur lors de la suppression');
        }
    });

    // Filter companies
    const filteredCompanies = companies.filter(company => {
        const matchesSearch = company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            company.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' ||
            (statusFilter === 'active' && company.is_active) ||
            (statusFilter === 'inactive' && !company.is_active);
        const matchesPlan = planFilter === 'all' || company.plan === planFilter;
        return matchesSearch && matchesStatus && matchesPlan;
    });

    // Calculate metrics
    const planPrices = { free: 0, startup: 15000, enterprise: 50000 };
    const totalMRR = companies.filter(c => c.is_active).reduce((sum, c) => {
        return sum + (planPrices[c.plan as keyof typeof planPrices] || 0);
    }, 0);
    const totalARR = totalMRR * 12;
    const activationRate = stats ? Math.round((stats.active_companies / stats.total_companies) * 100) : 0;
    const avgUsersPerCompany = stats ? Math.round(stats.total_users / stats.total_companies) : 0;

    const getPlanBadge = (plan: string) => {
        const badges = {
            free: { bg: 'bg-gray-100 dark:bg-gray-700', text: 'text-gray-700 dark:text-gray-300', label: 'Gratuit' },
            startup: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-300', label: 'Startup' },
            enterprise: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-300', label: 'Entreprise' },
        };
        return badges[plan as keyof typeof badges] || badges.free;
    };

    const quickActions = [
        { icon: Building2, label: 'Entreprises', path: '/saas/companies', color: 'from-blue-500 to-blue-600' },
        { icon: BarChart3, label: 'Analytics', path: '/saas/analytics', color: 'from-green-500 to-green-600' },
        { icon: DollarSign, label: 'Facturation', path: '/saas/billing', color: 'from-purple-500 to-purple-600' },
        { icon: Activity, label: 'Monitoring', path: '/saas/monitoring', color: 'from-orange-500 to-orange-600' },
        { icon: Database, label: 'Logs', path: '/saas/logs', color: 'from-red-500 to-red-600' },
        { icon: Settings, label: 'Configuration', path: '/saas/config', color: 'from-gray-500 to-gray-600' },
    ];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="max-w-7xl mx-auto p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                            <Shield className="text-primary-600" size={32} />
                            SaaS Administration
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                            Contrôle total de la plateforme • Mise à jour en temps réel
                        </p>
                    </div>
                    <button
                        onClick={() => {
                            refetch();
                            queryClient.invalidateQueries({ queryKey: ['saas-stats'] });
                            toast.success('Données actualisées');
                        }}
                        className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg flex items-center gap-2"
                    >
                        <RefreshCw size={20} />
                        Actualiser
                    </button>
                </div>

                {/* Key Metrics - Hero Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
                        <div className="flex items-center justify-between mb-4">
                            <Building2 size={32} className="opacity-90" />
                            <span className="text-xs bg-white/20 px-2 py-1 rounded">Total</span>
                        </div>
                        <p className="text-sm opacity-90 mb-1">Entreprises</p>
                        {statsLoading ? (
                            <div className="h-10 w-20 bg-white/20 animate-pulse rounded" />
                        ) : (
                            <p className="text-4xl font-bold">{stats?.total_companies || 0}</p>
                        )}
                        <div className="mt-3 flex items-center gap-2 text-xs">
                            <CheckCircle size={14} />
                            <span>{stats?.active_companies || 0} actives</span>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
                        <div className="flex items-center justify-between mb-4">
                            <Users size={32} className="opacity-90" />
                            <span className="text-xs bg-white/20 px-2 py-1 rounded">Total</span>
                        </div>
                        <p className="text-sm opacity-90 mb-1">Utilisateurs</p>
                        {statsLoading ? (
                            <div className="h-10 w-20 bg-white/20 animate-pulse rounded" />
                        ) : (
                            <p className="text-4xl font-bold">{stats?.total_users || 0}</p>
                        )}
                        <div className="mt-3 flex items-center gap-2 text-xs">
                            <TrendingUp size={14} />
                            <span>{avgUsersPerCompany} moy/entreprise</span>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
                        <div className="flex items-center justify-between mb-4">
                            <DollarSign size={32} className="opacity-90" />
                            <span className="text-xs bg-white/20 px-2 py-1 rounded">MRR</span>
                        </div>
                        <p className="text-sm opacity-90 mb-1">Revenu Mensuel</p>
                        {statsLoading ? (
                            <div className="h-10 w-32 bg-white/20 animate-pulse rounded" />
                        ) : (
                            <p className="text-3xl font-bold">{totalMRR.toLocaleString('fr-FR')} FCFA</p>
                        )}
                        <div className="mt-3 flex items-center gap-2 text-xs">
                            <BarChart3 size={14} />
                            <span>ARR: {totalARR.toLocaleString('fr-FR')} FCFA</span>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white shadow-lg">
                        <div className="flex items-center justify-between mb-4">
                            <Activity size={32} className="opacity-90" />
                            <span className="text-xs bg-white/20 px-2 py-1 rounded">Taux</span>
                        </div>
                        <p className="text-sm opacity-90 mb-1">Activation</p>
                        {statsLoading ? (
                            <div className="h-10 w-20 bg-white/20 animate-pulse rounded" />
                        ) : (
                            <p className="text-4xl font-bold">{activationRate}%</p>
                        )}
                        <div className="mt-3 w-full bg-white/20 rounded-full h-2">
                            <div
                                className="bg-white h-2 rounded-full transition-all"
                                style={{ width: `${activationRate}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Accès rapide</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        {quickActions.map((action) => {
                            const Icon = action.icon;
                            return (
                                <button
                                    key={action.path}
                                    onClick={() => navigate(action.path)}
                                    className="flex flex-col items-center gap-3 p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all group"
                                >
                                    <div className={`p-3 rounded-lg bg-gradient-to-br ${action.color} text-white group-hover:scale-110 transition-transform`}>
                                        <Icon size={24} />
                                    </div>
                                    <span className="text-sm font-medium text-gray-900 dark:text-white text-center">
                                        {action.label}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Recent Activity & Companies Overview */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Activity Feed */}
                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <Clock className="text-primary-600" size={20} />
                            Activité récente
                        </h3>
                        <div className="space-y-3">
                            {companies.slice(0, 5).map((company, index) => (
                                <div key={company.id} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                    <div className={`p-2 rounded-lg ${company.is_active ? 'bg-green-100 dark:bg-green-900/30' : 'bg-gray-200 dark:bg-gray-600'}`}>
                                        {company.is_active ? (
                                            <CheckCircle className="text-green-600 dark:text-green-400" size={16} />
                                        ) : (
                                            <XCircle className="text-gray-600 dark:text-gray-400" size={16} />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                            {company.name}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            {company.is_active ? 'Active' : 'Suspendue'} • {getPlanBadge(company.plan).label}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Plan Distribution */}
                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <BarChart3 className="text-primary-600" size={20} />
                            Distribution des plans
                        </h3>
                        <div className="space-y-4">
                            {Object.entries(planPrices).map(([plan, price]) => {
                                const count = companies.filter(c => c.plan === plan).length;
                                const percentage = companies.length > 0 ? Math.round((count / companies.length) * 100) : 0;
                                const badge = getPlanBadge(plan);
                                return (
                                    <div key={plan}>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${badge.bg} ${badge.text}`}>
                                                {badge.label}
                                            </span>
                                            <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                                {count} ({percentage}%)
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                            <div
                                                className={`h-2 rounded-full transition-all ${plan === 'free' ? 'bg-gray-500' :
                                                    plan === 'startup' ? 'bg-blue-500' :
                                                        'bg-purple-500'
                                                    }`}
                                                style={{ width: `${percentage}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* System Health */}
                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <Server className="text-primary-600" size={20} />
                            Santé du système
                        </h3>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="text-green-600 dark:text-green-400" size={16} />
                                    <span className="text-sm text-gray-900 dark:text-white">API Backend</span>
                                </div>
                                <span className="text-xs font-medium text-green-700 dark:text-green-400">En ligne</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="text-green-600 dark:text-green-400" size={16} />
                                    <span className="text-sm text-gray-900 dark:text-white">Base de données</span>
                                </div>
                                <span className="text-xs font-medium text-green-700 dark:text-green-400">Opérationnelle</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="text-green-600 dark:text-green-400" size={16} />
                                    <span className="text-sm text-gray-900 dark:text-white">Disponibilité</span>
                                </div>
                                <span className="text-xs font-medium text-green-700 dark:text-green-400">99.98%</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Companies Management */}
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Gestion des entreprises
                            </h2>
                            <button
                                onClick={() => navigate('/saas/companies')}
                                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                            >
                                Voir tout →
                            </button>
                        </div>

                        {/* Filters */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="relative">
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
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            >
                                <option value="all">Tous les statuts</option>
                                <option value="active">Actives</option>
                                <option value="inactive">Suspendues</option>
                            </select>
                            <select
                                value={planFilter}
                                onChange={(e) => setPlanFilter(e.target.value)}
                                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            >
                                <option value="all">Tous les plans</option>
                                <option value="free">Gratuit</option>
                                <option value="startup">Startup</option>
                                <option value="enterprise">Entreprise</option>
                            </select>
                        </div>
                    </div>

                    {/* Companies Table */}
                    {companiesLoading ? (
                        <div className="p-8 text-center">
                            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent text-primary-600" />
                            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">Chargement...</p>
                        </div>
                    ) : filteredCompanies.length === 0 ? (
                        <div className="p-8 text-center">
                            <Building2 className="mx-auto text-gray-400 mb-4" size={48} />
                            <p className="text-gray-500 dark:text-gray-400">Aucune entreprise trouvée</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 dark:bg-gray-900/50 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                    <tr>
                                        <th className="px-6 py-3 text-left">Entreprise</th>
                                        <th className="px-6 py-3 text-left">Plan</th>
                                        <th className="px-6 py-3 text-left">Statut</th>
                                        <th className="px-6 py-3 text-left">Date création</th>
                                        <th className="px-6 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {filteredCompanies.slice(0, 10).map((company) => {
                                        const planBadge = getPlanBadge(company.plan);
                                        return (
                                            <tr key={company.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-bold">
                                                            {company.name.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-gray-900 dark:text-white">{company.name}</p>
                                                            <p className="text-xs text-gray-500 dark:text-gray-400">{company.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 rounded text-xs font-medium ${planBadge.bg} ${planBadge.text}`}>
                                                        {planBadge.label}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {company.is_active ? (
                                                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                                                            <CheckCircle size={12} />
                                                            Active
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400">
                                                            <XCircle size={12} />
                                                            Suspendue
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                                                    {new Date(company.created_at).toLocaleDateString('fr-FR')}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => toggleStatusMutation.mutate(company)}
                                                            className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
                                                            title={company.is_active ? 'Suspendre' : 'Activer'}
                                                        >
                                                            {company.is_active ? <Lock size={16} /> : <Unlock size={16} />}
                                                        </button>
                                                        <button
                                                            onClick={() => navigate(`/saas/companies`)}
                                                            className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
                                                            title="Voir détails"
                                                        >
                                                            <Eye size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setSelectedCompany(company);
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

            {/* Delete Confirmation Dialog */}
            {isDeleteDialogOpen && selectedCompany && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full">
                                <AlertTriangle className="text-red-600 dark:text-red-400" size={24} />
                            </div>
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Supprimer l'entreprise</h2>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            Êtes-vous sûr de vouloir supprimer <strong>{selectedCompany.name}</strong> ? Cette action est irréversible.
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

export default SaasAdmin;
