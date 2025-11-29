import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axiosClient from '../api/axiosClient';
import {
    DollarSign, TrendingUp, CreditCard, Download,
    Search, Filter, Calendar, AlertCircle, CheckCircle,
    FileText, Eye
} from 'lucide-react';

interface SaasStats {
    total_companies: number;
    active_companies: number;
    total_users: number;
    revenue_mrr: number;
}

interface Company {
    id: number;
    name: string;
    email: string;
    plan: string;
    is_active: boolean;
    created_at: string;
}

const SaasBilling = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterPlan, setFilterPlan] = useState('all');

    // Fetch real stats
    const { data: stats, isLoading: statsLoading } = useQuery<SaasStats>({
        queryKey: ['saas-stats'],
        queryFn: async () => (await axiosClient.get('/api/auth/saas/global_stats/')).data,
    });

    // Fetch companies for billing info
    const { data: companiesData, isLoading: companiesLoading } = useQuery({
        queryKey: ['all-companies'],
        queryFn: async () => {
            const response = await axiosClient.get('/api/company/');
            const data = response.data.results || response.data;
            return Array.isArray(data) ? data : [];
        },
    });

    const companies = (companiesData as Company[]) || [];

    // Calculate real billing metrics
    const planPrices = {
        free: 0,
        startup: 15000,
        enterprise: 50000
    };

    const activeCompanies = companies.filter(c => c.is_active);
    const totalMRR = activeCompanies.reduce((sum, c) => {
        return sum + (planPrices[c.plan as keyof typeof planPrices] || 0);
    }, 0);

    const totalARR = totalMRR * 12;

    // Filter companies
    const filteredCompanies = companies.filter(company => {
        const matchesSearch = company.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesPlan = filterPlan === 'all' || company.plan === filterPlan;
        return matchesSearch && matchesPlan;
    });

    const getPlanPrice = (plan: string) => {
        return planPrices[plan as keyof typeof planPrices] || 0;
    };

    const getPlanBadge = (plan: string) => {
        const badges = {
            free: { bg: 'bg-gray-100 dark:bg-gray-700', text: 'text-gray-700 dark:text-gray-300', label: 'Gratuit' },
            startup: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-300', label: 'Startup' },
            enterprise: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-300', label: 'Entreprise' },
        };
        return badges[plan as keyof typeof badges] || badges.free;
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="max-w-7xl mx-auto p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Facturation</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Revenus et abonnements</p>
                    </div>
                    <button className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg flex items-center gap-2">
                        <Download size={20} />
                        Exporter
                    </button>
                </div>

                {/* Revenue Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-6 text-white">
                        <DollarSign className="mb-4 opacity-90" size={32} />
                        <p className="text-sm opacity-90">Revenu Mensuel (MRR)</p>
                        {statsLoading ? (
                            <div className="h-10 w-32 bg-white/20 animate-pulse rounded mt-2" />
                        ) : (
                            <p className="text-3xl font-bold mt-2">{totalMRR.toLocaleString('fr-FR')} FCFA</p>
                        )}
                    </div>

                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white">
                        <TrendingUp className="mb-4 opacity-90" size={32} />
                        <p className="text-sm opacity-90">Revenu Annuel (ARR)</p>
                        {statsLoading ? (
                            <div className="h-10 w-32 bg-white/20 animate-pulse rounded mt-2" />
                        ) : (
                            <p className="text-3xl font-bold mt-2">{totalARR.toLocaleString('fr-FR')} FCFA</p>
                        )}
                    </div>

                    <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-6 text-white">
                        <CreditCard className="mb-4 opacity-90" size={32} />
                        <p className="text-sm opacity-90">Abonnements Actifs</p>
                        {statsLoading ? (
                            <div className="h-10 w-20 bg-white/20 animate-pulse rounded mt-2" />
                        ) : (
                            <p className="text-3xl font-bold mt-2">{activeCompanies.length}</p>
                        )}
                    </div>
                </div>

                {/* Plan Breakdown */}
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Répartition par plan</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {Object.entries(planPrices).map(([plan, price]) => {
                            const count = activeCompanies.filter(c => c.plan === plan).length;
                            const revenue = count * price;
                            const badge = getPlanBadge(plan);
                            return (
                                <div key={plan} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${badge.bg} ${badge.text}`}>
                                            {badge.label}
                                        </span>
                                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                            {count} client{count > 1 ? 's' : ''}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Revenu mensuel</p>
                                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                                        {revenue.toLocaleString('fr-FR')} FCFA
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Rechercher une entreprise..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            />
                        </div>
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
                    </div>
                </div>

                {/* Billing Table */}
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                        <h2 className="text-lg font-medium text-gray-900 dark:text-white">Abonnements</h2>
                    </div>

                    {companiesLoading ? (
                        <div className="p-8 text-center">
                            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent text-primary-600" />
                            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">Chargement...</p>
                        </div>
                    ) : filteredCompanies.length === 0 ? (
                        <div className="p-8 text-center">
                            <FileText className="mx-auto text-gray-400 mb-4" size={48} />
                            <p className="text-gray-500 dark:text-gray-400">Aucun abonnement trouvé</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 dark:bg-gray-900/50 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                    <tr>
                                        <th className="px-6 py-3 text-left">Entreprise</th>
                                        <th className="px-6 py-3 text-left">Plan</th>
                                        <th className="px-6 py-3 text-left">Date d'inscription</th>
                                        <th className="px-6 py-3 text-left">Montant mensuel</th>
                                        <th className="px-6 py-3 text-left">Statut</th>
                                        <th className="px-6 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {filteredCompanies.map((company) => {
                                        const planBadge = getPlanBadge(company.plan);
                                        const price = getPlanPrice(company.plan);
                                        return (
                                            <tr key={company.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-sm font-medium text-primary-700 dark:text-primary-300">
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
                                                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                                                    {new Date(company.created_at).toLocaleDateString('fr-FR')}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="font-semibold text-gray-900 dark:text-white">
                                                        {price.toLocaleString('fr-FR')} FCFA
                                                    </p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {company.is_active ? (
                                                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                                                            <CheckCircle size={12} />
                                                            Actif
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400">
                                                            <AlertCircle size={12} />
                                                            Inactif
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
                                                            title="Voir détails"
                                                        >
                                                            <Eye size={16} />
                                                        </button>
                                                        <button
                                                            className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
                                                            title="Télécharger facture"
                                                        >
                                                            <Download size={16} />
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
        </div>
    );
};

export default SaasBilling;
