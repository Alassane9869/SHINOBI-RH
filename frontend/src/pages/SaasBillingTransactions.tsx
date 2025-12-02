import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Download, Eye, CreditCard, CheckCircle, XCircle, Clock } from 'lucide-react';
import axiosClient from '../api/axiosClient';
import toast from 'react-hot-toast';

interface Transaction {
    id: number;
    transaction_id: string;
    company_name: string;
    amount: number;
    currency: string;
    method: string;
    status: string;
    created_at: string;
    metadata: Record<string, any>;
}

const SaasBillingTransactions: React.FC = () => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [methodFilter, setMethodFilter] = useState('all');

    useEffect(() => {
        loadTransactions();
    }, []);

    const loadTransactions = async () => {
        try {
            const response = await axiosClient.get('/api/billing/saas/transactions/');
            setTransactions(response.data);
        } catch (error) {
            console.error('Erreur chargement transactions:', error);
            toast.error('Erreur de chargement');
        } finally {
            setLoading(false);
        }
    };

    const exportCSV = () => {
        const csv = [
            ['ID', 'Entreprise', 'Montant', 'Méthode', 'Statut', 'Date'].join(','),
            ...filteredTransactions.map(t => [
                t.transaction_id,
                t.company_name,
                `${t.amount} ${t.currency}`,
                t.method,
                t.status,
                new Date(t.created_at).toLocaleDateString('fr-FR')
            ].join(','))
        ].join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        toast.success('Export CSV réussi');
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed': return <CheckCircle className="w-5 h-5 text-green-500" />;
            case 'pending': return <Clock className="w-5 h-5 text-yellow-500" />;
            case 'failed': return <XCircle className="w-5 h-5 text-red-500" />;
            default: return <Clock className="w-5 h-5 text-gray-500" />;
        }
    };

    const getMethodBadge = (method: string) => {
        const colors: Record<string, string> = {
            stripe: 'bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400',
            orange_money: 'bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400',
            moov_money: 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400',
        };
        return colors[method] || 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400';
    };

    const filteredTransactions = transactions.filter(t => {
        const matchesSearch = t.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.transaction_id.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
        const matchesMethod = methodFilter === 'all' || t.method === methodFilter;
        return matchesSearch && matchesStatus && matchesMethod;
    });

    if (loading) {
        return <div className="flex items-center justify-center h-96"><div className="text-gray-400">Chargement...</div></div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">💳 Transactions</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">Historique complet des paiements</p>
                </div>
                <button
                    onClick={exportCSV}
                    className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg font-medium flex items-center gap-2"
                >
                    <Download className="w-5 h-5" /> Export CSV
                </button>
            </div>

            {/* Filters */}
            <div className="flex gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Rechercher par entreprise ou ID transaction..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                </div>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                    <option value="all">Tous les statuts</option>
                    <option value="completed">Complété</option>
                    <option value="pending">En attente</option>
                    <option value="failed">Échoué</option>
                </select>
                <select
                    value={methodFilter}
                    onChange={(e) => setMethodFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                    <option value="all">Toutes les méthodes</option>
                    <option value="stripe">Stripe</option>
                    <option value="orange_money">Orange Money</option>
                    <option value="moov_money">Moov Money</option>
                </select>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Transactions</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{transactions.length}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Complétées</p>
                    <p className="text-2xl font-bold text-green-600">{transactions.filter(t => t.status === 'completed').length}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-600 dark:text-gray-400">En attente</p>
                    <p className="text-2xl font-bold text-yellow-600">{transactions.filter(t => t.status === 'pending').length}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Échouées</p>
                    <p className="text-2xl font-bold text-red-600">{transactions.filter(t => t.status === 'failed').length}</p>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-900">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">ID Transaction</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Entreprise</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Montant</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Méthode</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Statut</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Date</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {filteredTransactions.map((transaction) => (
                            <tr key={transaction.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                <td className="px-6 py-4">
                                    <span className="font-mono text-sm text-gray-900 dark:text-white">{transaction.transaction_id}</span>
                                </td>
                                <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{transaction.company_name}</td>
                                <td className="px-6 py-4">
                                    <span className="font-bold text-gray-900 dark:text-white">
                                        {transaction.amount.toLocaleString()} {transaction.currency}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getMethodBadge(transaction.method)}`}>
                                        {transaction.method}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        {getStatusIcon(transaction.status)}
                                        <span className="capitalize">{transaction.status}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                                    {new Date(transaction.created_at).toLocaleDateString('fr-FR')}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default SaasBillingTransactions;
