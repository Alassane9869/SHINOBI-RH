import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axiosClient from '../api/axiosClient';
import {
    TrendingUp, Users, Building2, DollarSign, Activity,
    AlertCircle
} from 'lucide-react';

interface SaasStats {
    total_companies: number;
    active_companies: number;
    total_users: number;
    revenue_mrr: number;
}

const SaasAnalytics = () => {
    // Fetch real stats only
    const { data: stats, isLoading, error } = useQuery<SaasStats>({
        queryKey: ['saas-stats'],
        queryFn: async () => (await axiosClient.get('/api/auth/saas/global_stats/')).data,
    });

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        Erreur de chargement
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        Impossible de charger les données analytics
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="max-w-7xl mx-auto p-6 space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Analytics</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Statistiques de la plateforme</p>
                </div>

                {/* Real Stats Only */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <StatCard
                        icon={Building2}
                        label="Total Entreprises"
                        value={isLoading ? '-' : stats?.total_companies || 0}
                        loading={isLoading}
                        color="from-blue-500 to-blue-600"
                    />
                    <StatCard
                        icon={Activity}
                        label="Entreprises Actives"
                        value={isLoading ? '-' : stats?.active_companies || 0}
                        loading={isLoading}
                        color="from-green-500 to-green-600"
                    />
                    <StatCard
                        icon={Users}
                        label="Total Utilisateurs"
                        value={isLoading ? '-' : stats?.total_users || 0}
                        loading={isLoading}
                        color="from-purple-500 to-purple-600"
                    />
                    <StatCard
                        icon={DollarSign}
                        label="Revenu MRR"
                        value={isLoading ? '-' : `${(stats?.revenue_mrr || 0).toLocaleString('fr-FR')} FCFA`}
                        loading={isLoading}
                        color="from-emerald-500 to-emerald-600"
                    />
                </div>

                {/* Info Message */}
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
                    <div className="flex items-start gap-3">
                        <TrendingUp className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" size={20} />
                        <div>
                            <h3 className="text-sm font-medium text-blue-900 dark:text-blue-200">
                                Analytics avancées
                            </h3>
                            <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                                Les graphiques détaillés et l'analyse de croissance seront disponibles une fois que vous aurez accumulé suffisamment de données historiques.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Calculated Metrics */}
                {stats && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Taux d'activation</h3>
                            <div className="space-y-4">
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">Entreprises actives</span>
                                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                            {stats.total_companies > 0
                                                ? Math.round((stats.active_companies / stats.total_companies) * 100)
                                                : 0}%
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                                        <div
                                            className="bg-gradient-to-r from-green-500 to-emerald-500 h-full rounded-full transition-all"
                                            style={{
                                                width: `${stats.total_companies > 0
                                                    ? (stats.active_companies / stats.total_companies) * 100
                                                    : 0}%`
                                            }}
                                        />
                                    </div>
                                </div>
                                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        {stats.active_companies} sur {stats.total_companies} entreprises sont actuellement actives
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Moyenne par entreprise</h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <Users className="text-purple-600 dark:text-purple-400" size={24} />
                                        <span className="text-sm text-gray-600 dark:text-gray-400">Utilisateurs / Entreprise</span>
                                    </div>
                                    <span className="text-xl font-bold text-gray-900 dark:text-white">
                                        {stats.total_companies > 0
                                            ? Math.round(stats.total_users / stats.total_companies)
                                            : 0}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <DollarSign className="text-green-600 dark:text-green-400" size={24} />
                                        <span className="text-sm text-gray-600 dark:text-gray-400">Revenu / Entreprise</span>
                                    </div>
                                    <span className="text-xl font-bold text-gray-900 dark:text-white">
                                        {stats.total_companies > 0
                                            ? Math.round(stats.revenue_mrr / stats.total_companies).toLocaleString('fr-FR')
                                            : 0} FCFA
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const StatCard = ({
    icon: Icon,
    label,
    value,
    loading,
    color
}: {
    icon: any;
    label: string;
    value: string | number;
    loading?: boolean;
    color: string;
}) => (
    <div className={`bg-gradient-to-br ${color} rounded-lg p-6 text-white`}>
        <Icon className="mb-4 opacity-90" size={32} />
        <p className="text-sm opacity-90">{label}</p>
        {loading ? (
            <div className="h-10 w-24 bg-white/20 animate-pulse rounded mt-2" />
        ) : (
            <p className="text-3xl font-bold mt-2">{value}</p>
        )}
    </div>
);

export default SaasAnalytics;
