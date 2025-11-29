import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosClient from '../api/axiosClient';
import { Building2, Users, DollarSign, Activity, Trash2, Ban, CheckCircle, AlertCircle, Plus, Edit } from 'lucide-react';
import toast from 'react-hot-toast';
import ConfirmDialog from '../components/ConfirmDialog';

interface Company {
    id: number;
    name: string;
    email: string;
    plan: string;
    is_active: boolean;
    subscription_end_date: string | null;
    max_users: number;
    created_at: string;
}

interface SaasStats {
    total_companies: number;
    active_companies: number;
    total_users: number;
    revenue_mrr: number;
}

const SaasDashboard = () => {
    const queryClient = useQueryClient();
    const [companyToDelete, setCompanyToDelete] = useState<Company | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    // Fetch stats with error handling
    const { data: stats, isLoading: statsLoading, error: statsError } = useQuery<SaasStats>({
        queryKey: ['saas-stats'],
        queryFn: async () => {
            try {
                const response = await axiosClient.get('/api/auth/saas/global_stats/');
                return response.data;
            } catch (error) {
                console.error('Error fetching stats:', error);
                throw error;
            }
        },
        retry: 2,
    });

    // Fetch companies with error handling
    const { data: companiesData, isLoading, error: companiesError } = useQuery({
        queryKey: ['all-companies'],
        queryFn: async () => {
            try {
                const response = await axiosClient.get('/api/company/');
                // Handle both paginated and direct array responses
                const data = response.data.results || response.data;
                return Array.isArray(data) ? data : [];
            } catch (error) {
                console.error('Error fetching companies:', error);
                throw error;
            }
        },
        retry: 2,
    });

    const companies = (companiesData as Company[]) || [];

    const toggleActiveMutation = useMutation({
        mutationFn: async ({ id, is_active }: { id: number; is_active: boolean }) => {
            return axiosClient.patch(`/api/company/${id}/`, { is_active });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['all-companies'] });
            queryClient.invalidateQueries({ queryKey: ['saas-stats'] });
            toast.success('Statut mis à jour avec succès');
        },
        onError: (error: any) => {
            console.error('Toggle error:', error);
            toast.error(error?.response?.data?.message || 'Erreur lors de la mise à jour');
        }
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: number) => axiosClient.delete(`/api/company/${id}/`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['all-companies'] });
            queryClient.invalidateQueries({ queryKey: ['saas-stats'] });
            toast.success('Entreprise supprimée avec succès');
            setIsDeleteDialogOpen(false);
            setCompanyToDelete(null);
        },
        onError: (error: any) => {
            console.error('Delete error:', error);
            toast.error(error?.response?.data?.message || 'Erreur lors de la suppression');
        }
    });

    const updatePlanMutation = useMutation({
        mutationFn: async ({ id, plan }: { id: number; plan: string }) => {
            return axiosClient.patch(`/api/company/${id}/`, { plan });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['all-companies'] });
            toast.success('Plan mis à jour avec succès');
        },
        onError: (error: any) => {
            console.error('Update plan error:', error);
            toast.error(error?.response?.data?.message || 'Erreur lors de la mise à jour du plan');
        }
    });

    const handleDeleteClick = (company: Company) => {
        setCompanyToDelete(company);
        setIsDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = () => {
        if (companyToDelete) {
            deleteMutation.mutate(companyToDelete.id);
        }
    };

    // Show error state
    if (statsError || companiesError) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        Erreur de chargement
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                        Impossible de charger les données. Vérifiez votre connexion.
                    </p>
                    <button
                        onClick={() => {
                            queryClient.invalidateQueries({ queryKey: ['saas-stats'] });
                            queryClient.invalidateQueries({ queryKey: ['all-companies'] });
                        }}
                        className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                    >
                        Réessayer
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="max-w-7xl mx-auto p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Dashboard SaaS</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Vue d'ensemble de la plateforme</p>
                    </div>
                    <button className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg flex items-center gap-2">
                        <Plus size={20} />
                        Nouvelle Entreprise
                    </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <StatCard
                        icon={Building2}
                        label="Entreprises"
                        value={statsLoading ? '-' : (stats?.total_companies || 0)}
                        loading={statsLoading}
                    />
                    <StatCard
                        icon={Activity}
                        label="Actives"
                        value={statsLoading ? '-' : (stats?.active_companies || 0)}
                        loading={statsLoading}
                    />
                    <StatCard
                        icon={Users}
                        label="Utilisateurs"
                        value={statsLoading ? '-' : (stats?.total_users || 0)}
                        loading={statsLoading}
                    />
                    <StatCard
                        icon={DollarSign}
                        label="MRR"
                        value={statsLoading ? '-' : `${(stats?.revenue_mrr || 0).toLocaleString('fr-FR')} FCFA`}
                        loading={statsLoading}
                    />
                </div>

                {/* Alert for inactive companies */}
                {companies.filter(c => !c.is_active).length > 0 && (
                    <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" size={20} />
                            <div>
                                <h3 className="text-sm font-medium text-orange-900 dark:text-orange-200">
                                    Entreprises suspendues
                                </h3>
                                <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">
                                    {companies.filter(c => !c.is_active).length} entreprise(s) sont actuellement désactivées
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Table */}
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                        <h2 className="text-lg font-medium text-gray-900 dark:text-white">Entreprises</h2>
                    </div>

                    {isLoading ? (
                        <div className="p-8 text-center">
                            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite] text-primary-600" />
                            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">Chargement...</p>
                        </div>
                    ) : companies.length === 0 ? (
                        <div className="p-8 text-center">
                            <Building2 className="mx-auto text-gray-400 mb-4" size={48} />
                            <p className="text-gray-500 dark:text-gray-400">Aucune entreprise enregistrée</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 dark:bg-gray-900/50 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                    <tr>
                                        <th className="px-6 py-3 text-left">Entreprise</th>
                                        <th className="px-6 py-3 text-left">Email</th>
                                        <th className="px-6 py-3 text-left">Plan</th>
                                        <th className="px-6 py-3 text-left">Créée le</th>
                                        <th className="px-6 py-3 text-left">Statut</th>
                                        <th className="px-6 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {companies.map((company) => (
                                        <tr key={company.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-sm font-medium text-primary-700 dark:text-primary-300">
                                                        {company.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <span className="font-medium text-gray-900 dark:text-white">{company.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{company.email}</td>
                                            <td className="px-6 py-4">
                                                <select
                                                    value={company.plan}
                                                    onChange={(e) => updatePlanMutation.mutate({ id: company.id, plan: e.target.value })}
                                                    disabled={updatePlanMutation.isPending}
                                                    className="text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
                                                >
                                                    <option value="free">Gratuit</option>
                                                    <option value="startup">Startup</option>
                                                    <option value="enterprise">Entreprise</option>
                                                </select>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                                                {new Date(company.created_at).toLocaleDateString('fr-FR')}
                                            </td>
                                            <td className="px-6 py-4">
                                                {company.is_active ? (
                                                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                                                        <CheckCircle size={12} />
                                                        Actif
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400">
                                                        <Ban size={12} />
                                                        Suspendu
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => toggleActiveMutation.mutate({ id: company.id, is_active: !company.is_active })}
                                                        disabled={toggleActiveMutation.isPending}
                                                        className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 disabled:opacity-50"
                                                        title={company.is_active ? 'Suspendre' : 'Activer'}
                                                    >
                                                        {company.is_active ? <Ban size={16} /> : <CheckCircle size={16} />}
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteClick(company)}
                                                        disabled={deleteMutation.isPending}
                                                        className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-red-600 dark:text-red-400 disabled:opacity-50"
                                                        title="Supprimer"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            <ConfirmDialog
                isOpen={isDeleteDialogOpen}
                onClose={() => {
                    setIsDeleteDialogOpen(false);
                    setCompanyToDelete(null);
                }}
                onConfirm={handleDeleteConfirm}
                title="Supprimer l'entreprise"
                message={`Voulez-vous vraiment supprimer "${companyToDelete?.name}" ? Cette action est irréversible et supprimera toutes les données associées.`}
            />
        </div>
    );
};

const StatCard = ({ icon: Icon, label, value, loading }: { icon: any; label: string; value: string | number; loading?: boolean }) => (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-5">
        <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <Icon className="text-gray-600 dark:text-gray-400" size={20} />
            </div>
            <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
                {loading ? (
                    <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 animate-pulse rounded mt-1" />
                ) : (
                    <p className="text-2xl font-semibold text-gray-900 dark:text-white">{value}</p>
                )}
            </div>
        </div>
    </div>
);

export default SaasDashboard;
