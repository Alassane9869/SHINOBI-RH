import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Edit, TrendingUp, TrendingDown, Clock, Ban, CheckCircle, Calendar, DollarSign } from 'lucide-react';
import axiosClient from '../api/axiosClient';
import toast from 'react-hot-toast';

interface Subscription {
    id: number;
    company: {
        id: number;
        name: string;
        email: string;
    };
    plan: {
        id: number;
        name: string;
        slug: string;
        price: number;
        currency: string;
    };
    status: 'trial' | 'active' | 'past_due' | 'cancelled' | 'expired';
    start_date: string;
    trial_end_date: string | null;
    next_billing_date: string | null;
    auto_renew: boolean;
}

interface Plan {
    id: number;
    name: string;
    slug: string;
    price: number;
    currency: string;
}

const SaasSubscriptionManager: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedSub, setSelectedSub] = useState<Subscription | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newPlanId, setNewPlanId] = useState<number | null>(null);
    const [newStatus, setNewStatus] = useState<string>('');
    const [extendDays, setExtendDays] = useState(0);
    const queryClient = useQueryClient();

    // Fetch subscriptions
    const { data: subscriptions, isLoading } = useQuery({
        queryKey: ['saas-subscriptions'],
        queryFn: async () => {
            const response = await axiosClient.get('/api/billing/saas/subscriptions/');
            return response.data;
        }
    });

    // Fetch plans
    const { data: plans } = useQuery({
        queryKey: ['plans'],
        queryFn: async () => {
            const response = await axiosClient.get('/api/billing/plans/');
            return response.data;
        }
    });

    // Update subscription mutation
    const updateSubscription = useMutation({
        mutationFn: async ({ id, data }: { id: number; data: any }) => {
            const response = await axiosClient.patch(`/api/billing/saas/subscriptions/${id}/`, data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['saas-subscriptions'] });
            toast.success('Abonnement mis à jour avec succès');
            setIsModalOpen(false);
            setSelectedSub(null);
        },
        onError: () => {
            toast.error('Erreur lors de la mise à jour');
        }
    });

    const handleUpgrade = (sub: Subscription) => {
        setSelectedSub(sub);
        setNewPlanId(null);
        setNewStatus(sub.status);
        setExtendDays(0);
        setIsModalOpen(true);
    };

    const handleSave = () => {
        if (!selectedSub) return;

        const updates: any = {};

        if (newPlanId && newPlanId !== selectedSub.plan.id) {
            updates.plan_id = newPlanId;
        }

        if (newStatus && newStatus !== selectedSub.status) {
            updates.status = newStatus;
        }

        if (extendDays > 0) {
            updates.extend_trial_days = extendDays;
        }

        updateSubscription.mutate({ id: selectedSub.id, data: updates });
    };

    const filteredSubscriptions = subscriptions?.filter((sub: Subscription) =>
        sub.company?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sub.company?.email?.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

    const getStatusBadge = (status: string) => {
        const styles = {
            trial: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
            active: 'bg-green-500/10 text-green-400 border-green-500/20',
            past_due: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
            cancelled: 'bg-red-500/10 text-red-400 border-red-500/20',
            expired: 'bg-gray-500/10 text-gray-400 border-gray-500/20'
        };
        return styles[status as keyof typeof styles] || styles.expired;
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'trial': return <Clock className="w-4 h-4" />;
            case 'active': return <CheckCircle className="w-4 h-4" />;
            case 'cancelled': return <Ban className="w-4 h-4" />;
            default: return <Calendar className="w-4 h-4" />;
        }
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Gestion des Abonnements
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        Gérez les abonnements de toutes les entreprises
                    </p>
                </div>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                    type="text"
                    placeholder="Rechercher par entreprise ou email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
            </div>

            {/* Subscriptions Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                    Entreprise
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                    Plan
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                    Statut
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                    Fin d'essai
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                    Prochaine facturation
                                </th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        Chargement...
                                    </td>
                                </tr>
                            ) : filteredSubscriptions.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        Aucun abonnement trouvé
                                    </td>
                                </tr>
                            ) : (
                                filteredSubscriptions.map((sub: Subscription) => (
                                    <tr key={sub.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div>
                                                <div className="font-medium text-gray-900 dark:text-white">
                                                    {sub.company.name}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {sub.company.email}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <DollarSign className="w-4 h-4 text-gray-400" />
                                                <span className="font-medium text-gray-900 dark:text-white">
                                                    {sub.plan.name}
                                                </span>
                                                <span className="text-sm text-gray-500">
                                                    ({sub.plan.price} {sub.plan.currency})
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadge(sub.status)}`}>
                                                {getStatusIcon(sub.status)}
                                                {sub.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                                            {sub.trial_end_date ? new Date(sub.trial_end_date).toLocaleDateString('fr-FR') : '-'}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                                            {sub.next_billing_date ? new Date(sub.next_billing_date).toLocaleDateString('fr-FR') : '-'}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleUpgrade(sub)}
                                                className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                                            >
                                                <Edit className="w-4 h-4" />
                                                Gérer
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Edit Modal */}
            {isModalOpen && selectedSub && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full p-6 space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                Gérer l'abonnement
                            </h2>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="space-y-4">
                            {/* Company Info */}
                            <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
                                <div className="text-sm text-gray-600 dark:text-gray-400">Entreprise</div>
                                <div className="font-semibold text-gray-900 dark:text-white">{selectedSub.company.name}</div>
                                <div className="text-sm text-gray-500">{selectedSub.company.email}</div>
                            </div>

                            {/* Change Plan */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Changer de plan
                                </label>
                                <select
                                    value={newPlanId || selectedSub.plan.id}
                                    onChange={(e) => setNewPlanId(Number(e.target.value))}
                                    className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500"
                                >
                                    {plans?.map((plan: Plan) => (
                                        <option key={plan.id} value={plan.id}>
                                            {plan.name} - {plan.price} {plan.currency}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Change Status */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Statut
                                </label>
                                <select
                                    value={newStatus}
                                    onChange={(e) => setNewStatus(e.target.value)}
                                    className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500"
                                >
                                    <option value="trial">Trial (Essai)</option>
                                    <option value="active">Active</option>
                                    <option value="past_due">Past Due (Impayé)</option>
                                    <option value="cancelled">Cancelled (Annulé)</option>
                                    <option value="expired">Expired (Expiré)</option>
                                </select>
                            </div>

                            {/* Extend Trial */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Prolonger l'essai (jours)
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    value={extendDays}
                                    onChange={(e) => setExtendDays(Number(e.target.value))}
                                    className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500"
                                    placeholder="0"
                                />
                                <p className="text-sm text-gray-500 mt-1">
                                    Ajouter des jours supplémentaires à la période d'essai
                                </p>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3">
                            <button
                                onClick={handleSave}
                                disabled={updateSubscription.isPending}
                                className="flex-1 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-50"
                            >
                                {updateSubscription.isPending ? 'Enregistrement...' : 'Enregistrer les modifications'}
                            </button>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-semibold rounded-xl transition-colors"
                            >
                                Annuler
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SaasSubscriptionManager;
