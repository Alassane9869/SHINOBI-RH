import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { Users, Calendar, Briefcase, DollarSign, TrendingUp, ArrowUpRight, Sparkles, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { DashboardStats } from '../types';
import { Card, Button, Badge } from '../components/ui';
import { motion } from 'framer-motion';

interface ChartData {
    name: string;
    value: number;
}

const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const { data: stats, isLoading } = useQuery<DashboardStats>({
        queryKey: ['dashboard-stats'],
        queryFn: async () => {
            const response = await axiosClient.get<DashboardStats>('/api/dashboard/stats/');
            return response.data;
        },
    });

    if (isLoading) {
        return (
            <div className="flex flex-col justify-center items-center h-96">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-primary-200 dark:border-primary-900 rounded-full"></div>
                    <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin absolute top-0"></div>
                </div>
                <p className="mt-4 text-sm text-gray-500 dark:text-gray-400 animate-pulse">Chargement du dashboard...</p>
            </div>
        );
    }

    const chartData: ChartData[] = [
        { name: 'Jan', value: stats?.total_employees || 45 },
        { name: 'Fév', value: 52 },
        { name: 'Mar', value: 48 },
        { name: 'Avr', value: 61 },
        { name: 'Mai', value: 55 },
        { name: 'Juin', value: stats?.total_employees || 70 },
    ];

    const StatCard = ({ title, value, icon: Icon, trend, color, delay }: any) => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.3 }}
        >
            <Card hover gradient className="group">
                <div className="flex items-start justify-between mb-4">
                    <div className={`relative p-3 rounded-xl bg-gradient-to-br ${color} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className="w-6 h-6 text-white" />
                        <div className={`absolute inset-0 bg-gradient-to-br ${color} rounded-xl blur-xl opacity-0 group-hover:opacity-50 transition-opacity`}></div>
                    </div>
                    <Badge variant="success" pulse>
                        <TrendingUp className="w-3 h-3" />
                        {trend}
                    </Badge>
                </div>
                <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1 font-medium">{title}</p>
                    <p className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-primary-600 dark:from-white dark:to-primary-400 bg-clip-text text-transparent">
                        {value}
                    </p>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700/50 flex items-center text-xs text-gray-500 dark:text-gray-400">
                    <Activity className="w-3 h-3 mr-1" />
                    Dernières 24h
                </div>
            </Card>
        </motion.div>
    );

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="section-header"
            >
                <div>
                    <h1 className="page-title flex items-center gap-3">
                        <Sparkles className="w-8 h-8 text-primary-500 animate-pulse-slow" />
                        Dashboard
                    </h1>
                    <p className="page-subtitle">Vue d'ensemble de votre activité RH en temps réel</p>
                </div>
                <Button variant="primary" className="group">
                    <Sparkles className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
                    Nouveau Rapport
                </Button>
            </motion.div>

            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Employés"
                    value={stats?.total_employees || 0}
                    icon={Users}
                    trend="+12%"
                    color="from-blue-500 to-cyan-500"
                    delay={0.1}
                />
                <StatCard
                    title="Congés en attente"
                    value={stats?.pending_leaves || 0}
                    icon={Briefcase}
                    trend="+5"
                    color="from-amber-500 to-orange-500"
                    delay={0.2}
                />
                <StatCard
                    title="Présences"
                    value={stats?.total_attendances || 0}
                    icon={Calendar}
                    trend="98%"
                    color="from-green-500 to-emerald-500"
                    delay={0.3}
                />
                <StatCard
                    title="Paies"
                    value={stats?.total_payrolls || 0}
                    icon={DollarSign}
                    trend="100%"
                    color="from-purple-500 to-pink-500"
                    delay={0.4}
                />
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Chart */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                    className="lg:col-span-2"
                >
                    <Card className="group">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-primary-600 dark:from-white dark:to-primary-400 bg-clip-text text-transparent">
                                Évolution des Employés
                            </h2>
                            <select className="input text-sm py-2 px-3 w-auto">
                                <option>6 derniers mois</option>
                                <option>Cette année</option>
                            </select>
                        </div>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" opacity={0.3} />
                                    <XAxis
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#9ca3af', fontSize: 12 }}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#9ca3af', fontSize: 12 }}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'rgba(17, 24, 39, 0.9)',
                                            border: 'none',
                                            borderRadius: '12px',
                                            boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
                                        }}
                                        labelStyle={{ color: '#fff' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="value"
                                        stroke="#6366f1"
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#colorValue)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                </motion.div>

                {/* Quick Actions */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 }}
                >
                    <Card>
                        <h2 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-primary-600 dark:from-white dark:to-primary-400 bg-clip-text text-transparent mb-6">
                            Actions Rapides
                        </h2>
                        <div className="space-y-3">
                            {[
                                { icon: Users, label: 'Ajouter un employé', color: 'from-blue-500 to-cyan-500', delay: 0.7, path: '/employees' },
                                { icon: Briefcase, label: 'Gérer les congés', color: 'from-amber-500 to-orange-500', delay: 0.8, path: '/leaves' },
                                { icon: DollarSign, label: 'Générer la paie', color: 'from-purple-500 to-pink-500', delay: 0.9, path: '/payroll' },
                            ].map((action, index) => (
                                <motion.button
                                    key={index}
                                    onClick={() => navigate(action.path)}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: action.delay }}
                                    className="w-full flex items-center justify-between p-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-transparent bg-gradient-to-r hover:from-primary-50 hover:to-accent-50 dark:hover:from-primary-950 dark:hover:to-accent-950 transition-all group hover:shadow-lg hover:scale-105 active:scale-95"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2.5 rounded-lg bg-gradient-to-br ${action.color} shadow-lg group-hover:scale-110 transition-transform`}>
                                            <action.icon className="w-5 h-5 text-white" />
                                        </div>
                                        <span className="font-semibold text-gray-700 dark:text-gray-200">{action.label}</span>
                                    </div>
                                    <ArrowUpRight className="w-5 h-5 text-gray-400 group-hover:text-primary-500 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
                                </motion.button>
                            ))}
                        </div>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
};

export default Dashboard;
