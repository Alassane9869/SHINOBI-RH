import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
    DollarSign, TrendingUp, Users, CreditCard,
    ArrowUpRight, ArrowDownRight, Calendar,
    Smartphone, Shield
} from 'lucide-react';
import axiosClient from '../api/axiosClient';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

interface BillingStats {
    mrr: number;
    arr: number;
    active_subscriptions: number;
    monthly_revenue: number;
}

interface RevenueData {
    date: string;
    revenue: number;
}

const SaasBillingDashboard: React.FC = () => {
    const [stats, setStats] = useState<BillingStats | null>(null);
    const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            const [statsRes, revenueRes] = await Promise.all([
                axiosClient.get('/api/billing/saas/analytics/mrr/'),
                axiosClient.get('/api/billing/saas/analytics/revenue/')
            ]);

            setStats(statsRes.data);
            setRevenueData(revenueRes.data);
        } catch (error) {
            console.error('Erreur chargement données:', error);
        } finally {
            setLoading(false);
        }
    };

    // Données pour le graphique
    const chartData = {
        labels: revenueData.map(d => new Date(d.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })),
        datasets: [
            {
                label: 'Revenus (FCFA)',
                data: revenueData.map(d => d.revenue),
                borderColor: 'rgb(147, 51, 234)',
                backgroundColor: 'rgba(147, 51, 234, 0.1)',
                fill: true,
                tension: 0.4,
            }
        ]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                padding: 12,
                titleColor: '#fff',
                bodyColor: '#fff',
                callbacks: {
                    label: function (context: any) {
                        return `${context.parsed.y.toLocaleString()} FCFA`;
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color: 'rgba(255, 255, 255, 0.05)'
                },
                ticks: {
                    color: 'rgba(255, 255, 255, 0.6)',
                    callback: function (value: any) {
                        return value.toLocaleString();
                    }
                }
            },
            x: {
                grid: {
                    display: false
                },
                ticks: {
                    color: 'rgba(255, 255, 255, 0.6)'
                }
            }
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-gray-400">Chargement...</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    💰 Billing & Revenue
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                    Gérez vos paiements, plans et revenus
                </p>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* MRR */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                            <DollarSign className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div className="flex items-center text-green-500 text-sm">
                            <ArrowUpRight className="w-4 h-4" />
                            <span className="ml-1">+12%</span>
                        </div>
                    </div>
                    <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium">MRR</h3>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                        {stats?.mrr.toLocaleString()} FCFA
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                        Monthly Recurring Revenue
                    </p>
                </motion.div>

                {/* ARR */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg">
                            <TrendingUp className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div className="flex items-center text-green-500 text-sm">
                            <ArrowUpRight className="w-4 h-4" />
                            <span className="ml-1">+8%</span>
                        </div>
                    </div>
                    <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium">ARR</h3>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                        {stats?.arr.toLocaleString()} FCFA
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                        Annual Recurring Revenue
                    </p>
                </motion.div>

                {/* Abonnements Actifs */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                            <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
                        </div>
                        <div className="flex items-center text-green-500 text-sm">
                            <ArrowUpRight className="w-4 h-4" />
                            <span className="ml-1">+5</span>
                        </div>
                    </div>
                    <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium">Abonnements</h3>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                        {stats?.active_subscriptions}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                        Actifs ce mois
                    </p>
                </motion.div>

                {/* Revenus du Mois */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                            <CreditCard className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                        </div>
                        <div className="flex items-center text-green-500 text-sm">
                            <ArrowUpRight className="w-4 h-4" />
                            <span className="ml-1">+18%</span>
                        </div>
                    </div>
                    <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium">Revenus Mois</h3>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                        {stats?.monthly_revenue.toLocaleString()} FCFA
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                        {new Date().toLocaleDateString('fr-FR', { month: 'long' })}
                    </p>
                </motion.div>
            </div>

            {/* Graphique Revenus */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                            Évolution des Revenus
                        </h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            30 derniers jours
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-gray-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                            {new Date(revenueData[0]?.date).toLocaleDateString('fr-FR')} - {new Date().toLocaleDateString('fr-FR')}
                        </span>
                    </div>
                </div>
                <div className="h-80">
                    <Line data={chartData} options={chartOptions} />
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.a
                    href="/saas/billing/config"
                    whileHover={{ scale: 1.02 }}
                    className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white cursor-pointer"
                >
                    <Shield className="w-8 h-8 mb-3" />
                    <h3 className="text-lg font-bold mb-2">Configuration</h3>
                    <p className="text-purple-100 text-sm">
                        Gérer Stripe, Orange Money, Moov Money
                    </p>
                </motion.a>

                <motion.a
                    href="/saas/billing/plans"
                    whileHover={{ scale: 1.02 }}
                    className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl p-6 text-white cursor-pointer"
                >
                    <DollarSign className="w-8 h-8 mb-3" />
                    <h3 className="text-lg font-bold mb-2">Plans</h3>
                    <p className="text-indigo-100 text-sm">
                        Créer et modifier les plans d'abonnement
                    </p>
                </motion.a>

                <motion.a
                    href="/saas/billing/transactions"
                    whileHover={{ scale: 1.02 }}
                    className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white cursor-pointer"
                >
                    <CreditCard className="w-8 h-8 mb-3" />
                    <h3 className="text-lg font-bold mb-2">Transactions</h3>
                    <p className="text-green-100 text-sm">
                        Voir l'historique des paiements
                    </p>
                </motion.a>
            </div>
        </div>
    );
};

export default SaasBillingDashboard;
