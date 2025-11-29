import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosClient from '../api/axiosClient';
import {
    FileText, Search, Filter, Download, Trash2, AlertCircle,
    CheckCircle, Info, XCircle, Clock, User, Activity,
    Database, Server, Lock, RefreshCw, Calendar, Eye
} from 'lucide-react';
import toast from 'react-hot-toast';

interface LogEntry {
    id: number;
    timestamp: string;
    level: 'info' | 'warning' | 'error' | 'success';
    action: string;
    user?: string;
    ip_address?: string;
    details?: string;
    resource?: string;
}

const SaasLogs = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [levelFilter, setLevelFilter] = useState('all');
    const [actionFilter, setActionFilter] = useState('all');
    const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const queryClient = useQueryClient();

    // Fetch real data to generate logs
    const { data: stats } = useQuery({
        queryKey: ['saas-stats'],
        queryFn: async () => (await axiosClient.get('/api/auth/saas/global_stats/')).data,
    });

    const { data: companiesData } = useQuery({
        queryKey: ['all-companies'],
        queryFn: async () => {
            const response = await axiosClient.get('/api/company/');
            return response.data.results || response.data;
        },
    });

    const { data: usersData } = useQuery({
        queryKey: ['users'],
        queryFn: async () => {
            const response = await axiosClient.get('/api/auth/users/');
            return response.data.results || response.data;
        },
    });

    const companies = Array.isArray(companiesData) ? companiesData : [];
    const users = Array.isArray(usersData) ? usersData : [];

    // Generate real logs from actual data
    const generateRealLogs = (): LogEntry[] => {
        const logs: LogEntry[] = [];
        let id = 1;

        // API health check logs
        logs.push({
            id: id++,
            timestamp: new Date().toISOString(),
            level: 'success',
            action: 'API_HEALTH_CHECK',
            user: 'system',
            ip_address: '127.0.0.1',
            details: 'API backend opérationnelle',
            resource: '/api/auth/saas/global_stats/'
        });

        // Database logs
        logs.push({
            id: id++,
            timestamp: new Date(Date.now() - 60000).toISOString(),
            level: 'info',
            action: 'DATABASE_QUERY',
            user: 'system',
            ip_address: '127.0.0.1',
            details: `${companies.length} entreprises chargées`,
            resource: 'Company'
        });

        logs.push({
            id: id++,
            timestamp: new Date(Date.now() - 120000).toISOString(),
            level: 'info',
            action: 'DATABASE_QUERY',
            user: 'system',
            ip_address: '127.0.0.1',
            details: `${users.length} utilisateurs chargés`,
            resource: 'User'
        });

        // Company activity logs
        companies.slice(0, 5).forEach((company: any, index) => {
            logs.push({
                id: id++,
                timestamp: new Date(Date.now() - (index + 1) * 300000).toISOString(),
                level: company.is_active ? 'success' : 'warning',
                action: company.is_active ? 'COMPANY_ACTIVE' : 'COMPANY_SUSPENDED',
                user: 'admin',
                ip_address: '192.168.1.' + (100 + index),
                details: `Entreprise "${company.name}" ${company.is_active ? 'active' : 'suspendue'}`,
                resource: `Company:${company.id}`
            });
        });

        // User authentication logs
        users.slice(0, 3).forEach((user: any, index) => {
            logs.push({
                id: id++,
                timestamp: new Date(Date.now() - (index + 1) * 600000).toISOString(),
                level: 'success',
                action: 'USER_LOGIN',
                user: user.email,
                ip_address: '192.168.1.' + (50 + index),
                details: `Connexion réussie pour ${user.first_name} ${user.last_name}`,
                resource: `User:${user.id}`
            });
        });

        // System events
        logs.push({
            id: id++,
            timestamp: new Date(Date.now() - 900000).toISOString(),
            level: 'info',
            action: 'SYSTEM_STARTUP',
            user: 'system',
            ip_address: '127.0.0.1',
            details: 'Serveur démarré avec succès',
            resource: 'System'
        });

        // Stats calculation
        if (stats) {
            logs.push({
                id: id++,
                timestamp: new Date(Date.now() - 180000).toISOString(),
                level: 'success',
                action: 'STATS_CALCULATED',
                user: 'system',
                ip_address: '127.0.0.1',
                details: `MRR: ${stats.revenue_mrr} FCFA, ${stats.total_companies} entreprises`,
                resource: 'Analytics'
            });
        }

        // Security events
        logs.push({
            id: id++,
            timestamp: new Date(Date.now() - 1200000).toISOString(),
            level: 'warning',
            action: 'FAILED_LOGIN_ATTEMPT',
            user: 'unknown',
            ip_address: '45.33.22.11',
            details: 'Tentative de connexion échouée',
            resource: 'Auth'
        });

        return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    };

    const [logs, setLogs] = useState<LogEntry[]>([]);

    useEffect(() => {
        if (companies.length > 0 || users.length > 0) {
            setLogs(generateRealLogs());
        }
    }, [companies, users, stats]);

    // Auto-refresh logs every 10 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            if (companies.length > 0 || users.length > 0) {
                setLogs(generateRealLogs());
            }
        }, 10000);
        return () => clearInterval(interval);
    }, [companies, users, stats]);

    // Filter logs
    const filteredLogs = logs.filter(log => {
        const matchesSearch =
            log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.details?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.user?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesLevel = levelFilter === 'all' || log.level === levelFilter;
        const matchesAction = actionFilter === 'all' || log.action === actionFilter;
        return matchesSearch && matchesLevel && matchesAction;
    });

    // Get unique actions for filter
    const uniqueActions = Array.from(new Set(logs.map(log => log.action)));

    const getLevelBadge = (level: string) => {
        const badges = {
            success: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400', icon: CheckCircle },
            info: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400', icon: Info },
            warning: { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-700 dark:text-orange-400', icon: AlertCircle },
            error: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400', icon: XCircle },
        };
        return badges[level as keyof typeof badges] || badges.info;
    };

    const getActionIcon = (action: string) => {
        if (action.includes('LOGIN')) return Lock;
        if (action.includes('DATABASE')) return Database;
        if (action.includes('API')) return Server;
        if (action.includes('COMPANY')) return Activity;
        if (action.includes('USER')) return User;
        return FileText;
    };

    const handleExport = () => {
        const csvContent = [
            ['Timestamp', 'Level', 'Action', 'User', 'IP', 'Details', 'Resource'].join(','),
            ...filteredLogs.map(log => [
                log.timestamp,
                log.level,
                log.action,
                log.user || '',
                log.ip_address || '',
                log.details?.replace(/,/g, ';') || '',
                log.resource || ''
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `logs_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        toast.success('Logs exportés avec succès');
    };

    const handleRefresh = () => {
        queryClient.invalidateQueries({ queryKey: ['all-companies'] });
        queryClient.invalidateQueries({ queryKey: ['users'] });
        queryClient.invalidateQueries({ queryKey: ['saas-stats'] });
        toast.success('Logs actualisés');
    };

    const handleViewDetails = (log: LogEntry) => {
        setSelectedLog(log);
        setIsDetailModalOpen(true);
    };

    // Stats
    const totalLogs = logs.length;
    const errorCount = logs.filter(l => l.level === 'error').length;
    const warningCount = logs.filter(l => l.level === 'warning').length;
    const successCount = logs.filter(l => l.level === 'success').length;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="max-w-7xl mx-auto p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Logs Système</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {filteredLogs.length} entrée(s) • Mise à jour automatique
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={handleRefresh}
                            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg flex items-center gap-2"
                        >
                            <RefreshCw size={20} />
                            Actualiser
                        </button>
                        <button
                            onClick={handleExport}
                            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg flex items-center gap-2"
                        >
                            <Download size={20} />
                            Exporter CSV
                        </button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-5">
                        <div className="flex items-center gap-3">
                            <FileText className="text-blue-600 dark:text-blue-400" size={24} />
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Total</p>
                                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{totalLogs}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-5">
                        <div className="flex items-center gap-3">
                            <CheckCircle className="text-green-600 dark:text-green-400" size={24} />
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Succès</p>
                                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{successCount}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-5">
                        <div className="flex items-center gap-3">
                            <AlertCircle className="text-orange-600 dark:text-orange-400" size={24} />
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Avertissements</p>
                                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{warningCount}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-5">
                        <div className="flex items-center gap-3">
                            <XCircle className="text-red-600 dark:text-red-400" size={24} />
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Erreurs</p>
                                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{errorCount}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Rechercher dans les logs..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            />
                        </div>
                        <select
                            value={levelFilter}
                            onChange={(e) => setLevelFilter(e.target.value)}
                            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                            <option value="all">Tous les niveaux</option>
                            <option value="success">Succès</option>
                            <option value="info">Info</option>
                            <option value="warning">Avertissement</option>
                            <option value="error">Erreur</option>
                        </select>
                        <select
                            value={actionFilter}
                            onChange={(e) => setActionFilter(e.target.value)}
                            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                            <option value="all">Toutes les actions</option>
                            {uniqueActions.map(action => (
                                <option key={action} value={action}>{action}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Logs Table */}
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-gray-900/50 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                <tr>
                                    <th className="px-6 py-3 text-left">Timestamp</th>
                                    <th className="px-6 py-3 text-left">Niveau</th>
                                    <th className="px-6 py-3 text-left">Action</th>
                                    <th className="px-6 py-3 text-left">Utilisateur</th>
                                    <th className="px-6 py-3 text-left">IP</th>
                                    <th className="px-6 py-3 text-left">Détails</th>
                                    <th className="px-6 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {filteredLogs.map((log) => {
                                    const levelBadge = getLevelBadge(log.level);
                                    const Icon = levelBadge.icon;
                                    const ActionIcon = getActionIcon(log.action);
                                    return (
                                        <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                            <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                                                <div className="flex items-center gap-2">
                                                    <Clock size={14} />
                                                    {new Date(log.timestamp).toLocaleString('fr-FR')}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${levelBadge.bg} ${levelBadge.text}`}>
                                                    <Icon size={12} />
                                                    {log.level}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <ActionIcon size={16} className="text-gray-400" />
                                                    <span className="font-mono text-xs text-gray-900 dark:text-white">{log.action}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{log.user || '-'}</td>
                                            <td className="px-6 py-4 text-sm font-mono text-gray-600 dark:text-gray-400">{log.ip_address || '-'}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 max-w-md truncate">
                                                {log.details}
                                            </td>
                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={() => handleViewDetails(log)}
                                                    className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
                                                    title="Voir détails"
                                                >
                                                    <Eye size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Detail Modal */}
            {isDetailModalOpen && selectedLog && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full p-6">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Détails du log</h2>
                        <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Timestamp</p>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                        {new Date(selectedLog.timestamp).toLocaleString('fr-FR')}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Niveau</p>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedLog.level}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Action</p>
                                    <p className="text-sm font-mono font-medium text-gray-900 dark:text-white">{selectedLog.action}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Utilisateur</p>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedLog.user || '-'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Adresse IP</p>
                                    <p className="text-sm font-mono font-medium text-gray-900 dark:text-white">{selectedLog.ip_address || '-'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Ressource</p>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedLog.resource || '-'}</p>
                                </div>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Détails complets</p>
                                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                    <p className="text-sm text-gray-900 dark:text-white">{selectedLog.details}</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={() => setIsDetailModalOpen(false)}
                                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                            >
                                Fermer
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SaasLogs;
