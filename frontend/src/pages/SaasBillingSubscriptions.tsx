import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Building2, Calendar, DollarSign, X, Check, RefreshCw, Ban } from 'lucide-react';
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
    status: string;
    start_date: string;
    end_date: string | null;
    next_billing_date: string | null;
    trial_end_date: string | null;
    auto_renew: boolean;
    created_at: string;
}

const SaasBillingSubscriptions: React.FC = () => {
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        loadSubscriptions();
    }, []);

    const loadSubscriptions = async () => {
        try {
            const response = await axiosClient.get('/api/billing/saas/subscriptions/');
            setSubscriptions(response.data);
        } catch (error) {
            console.error('Erreur chargement abonnements:', error);
            toast.error('Erreur de chargement');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async (subscriptionId: number) => {
        if (!confirm('Êtes-vous sûr de vouloir annuler cet abonnement ?')) return;

        try {
            await axiosClient.post(`/api/billing/saas/subscriptions/${subscriptionId}/cancel/`);
            toast.success('Abonnement annulé');
            loadSubscriptions();
        } catch (error: any) {
            toast.error(error.response?.data?.detail || 'Erreur d\'annulation');
        }
    };

    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            active: 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400',
            trial: 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400',
            cancelled: 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400',
            expired: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400',
        };
        return styles[status] || styles.active;
    };

    const filteredSubscriptions = subscriptions.filter(sub => {
        const matchesSearch = sub.company?.name?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || sub.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    if (loading) {
        return <div className="flex items-center justify-center h-96"><div className="text-gray-400">Chargement...</div></div>;
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">📋 Abonnements</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">Gérez tous les abonnements actifs</p>
            </div>

            {/* Filters */}
            <div className="flex gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Rechercher par entreprise..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                </div>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                    <option value="all">Tous les statuts</option>
                    <option value="active">Actif</option>
                    <option value="trial">Essai</option>
                    <option value="cancelled">Annulé</option>
                    <option value="expired">Expiré</option>
                </select>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-900">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Entreprise</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Plan</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Statut</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Début</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Prochain paiement</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {filteredSubscriptions.map((sub) => (
                            <tr key={sub.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <Building2 className="w-4 h-4 text-gray-400" />
                                        <span className="font-medium text-gray-900 dark:text-white">{sub.company?.name || 'N/A'}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{sub.plan?.name || 'N/A'}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(sub.status)}`}>
                                        {sub.status === 'trial' ? '🧪 Essai' : sub.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                                    {new Date(sub.start_date).toLocaleDateString('fr-FR')}
                                </td>
                                <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                                    {sub.next_billing_date ? new Date(sub.next_billing_date).toLocaleDateString('fr-FR') : '-'}
                                </td>
                                <td className="px-6 py-4">
                                    <button
                                        onClick={() => handleCancel(sub.id)}
                                        className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white rounded-lg text-sm"
                                    >
                                        Annuler
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default SaasBillingSubscriptions;
