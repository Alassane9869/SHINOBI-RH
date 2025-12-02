import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import axiosClient from '../api/axiosClient';
import {
    Settings, Mail, Shield, Database, Palette, Save,
    RefreshCw, AlertCircle, DollarSign, Zap,
    Activity, Download, Code, Cloud, Check
} from 'lucide-react';
import toast from 'react-hot-toast';

interface PlatformConfig {
    // Général
    platform_name: string;
    platform_url: string;
    support_email: string;
    maintenance_mode: boolean;

    // Plans & Tarification
    plan_free_price: number;
    plan_startup_price: number;
    plan_enterprise_price: number;
    plan_free_max_users: number;
    plan_startup_max_users: number;
    plan_enterprise_max_users: number;

    // Sécurité
    session_timeout: number;
    max_login_attempts: number;
    password_min_length: number;
    require_mfa: boolean;
    allow_registration: boolean;

    // Email
    smtp_host: string;
    smtp_port: number;
    smtp_user: string;
    smtp_from: string;
    email_notifications: boolean;

    // Apparence
    primary_color: string;
    accent_color: string;
    default_theme: string;

    // Fonctionnalités
    enable_analytics: boolean;
    enable_exports: boolean;
    enable_api_access: boolean;

    // Limites
    max_companies: number;
    max_users_per_company: number;
    storage_limit_gb: number;
}

const SaasConfig = () => {
    const [activeTab, setActiveTab] = useState('general');
    const [isSaving, setIsSaving] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch current stats for context
    const { data: stats } = useQuery({
        queryKey: ['saas-stats'],
        queryFn: async () => (await axiosClient.get('/api/auth/saas/global_stats/')).data,
    });

    // Configuration state with real defaults
    const [config, setConfig] = useState<PlatformConfig>({
        // Général
        platform_name: 'SHINOBI RH',
        platform_url: 'https://shinobi-rh.com',
        support_email: 'support@shinobi-rh.com',
        maintenance_mode: false,

        // Plans & Tarification (en FCFA)
        plan_free_price: 0,
        plan_startup_price: 15000,
        plan_enterprise_price: 50000,
        plan_free_max_users: 5,
        plan_startup_max_users: 25,
        plan_enterprise_max_users: 100,

        // Sécurité - NOTE: Ces paramètres ne s'appliquent PAS au owner
        session_timeout: 30,
        max_login_attempts: 5,
        password_min_length: 8,
        require_mfa: false, // Owner est toujours exempt de MFA
        allow_registration: true,

        // Email
        smtp_host: 'smtp.gmail.com',
        smtp_port: 587,
        smtp_user: '',
        smtp_from: 'noreply@shinobi-rh.com',
        email_notifications: true,

        // Apparence
        primary_color: '#6366f1',
        accent_color: '#ec4899',
        default_theme: 'system',

        // Fonctionnalités
        enable_analytics: true,
        enable_exports: true,
        enable_api_access: true,

        // Limites
        max_companies: 1000,
        max_users_per_company: 500,
        storage_limit_gb: 100,
    });

    // Charger la configuration depuis le backend
    useEffect(() => {
        const loadConfig = async () => {
            try {
                const response = await axiosClient.get('/api/auth/platform/config/');
                if (response.data) {
                    setConfig(prev => ({ ...prev, ...response.data }));
                }
            } catch (error) {
                console.error('Erreur chargement config:', error);
                toast.error('Erreur de chargement de la configuration');
            } finally {
                setIsLoading(false);
            }
        };
        loadConfig();
    }, []);

    const handleChange = (key: keyof PlatformConfig, value: any) => {
        setConfig(prev => ({ ...prev, [key]: value }));
        setHasChanges(true);
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await axiosClient.post('/api/auth/platform/config/', config);
            toast.success('Configuration sauvegardée avec succès !');
            setHasChanges(false);
        } catch (error: any) {
            console.error('Erreur sauvegarde:', error);
            toast.error(error.response?.data?.detail || 'Erreur de sauvegarde');
        } finally {
            setIsSaving(false);
        }
    };

    const handleReset = () => {
        setConfig({
            platform_name: 'SHINOBI RH',
            platform_url: 'https://shinobi-rh.com',
            support_email: 'support@shinobi-rh.com',
            maintenance_mode: false,
            plan_free_price: 0,
            plan_startup_price: 15000,
            plan_enterprise_price: 50000,
            plan_free_max_users: 5,
            plan_startup_max_users: 25,
            plan_enterprise_max_users: 100,
            session_timeout: 30,
            max_login_attempts: 5,
            password_min_length: 8,
            require_mfa: false,
            allow_registration: true,
            smtp_host: 'smtp.gmail.com',
            smtp_port: 587,
            smtp_user: '',
            smtp_from: 'noreply@shinobi-rh.com',
            email_notifications: true,
            primary_color: '#6366f1',
            accent_color: '#ec4899',
            default_theme: 'system',
            enable_analytics: true,
            enable_exports: true,
            enable_api_access: true,
            max_companies: 1000,
            max_users_per_company: 500,
            storage_limit_gb: 100,
        });
        setHasChanges(false);
        toast.success('Configuration réinitialisée');
    };

    const tabs = [
        { id: 'general', label: 'Général', icon: Settings },
        { id: 'pricing', label: 'Tarification', icon: DollarSign },
        { id: 'security', label: 'Sécurité', icon: Shield },
        { id: 'email', label: 'Email', icon: Mail },
        { id: 'appearance', label: 'Apparence', icon: Palette },
        { id: 'features', label: 'Fonctionnalités', icon: Zap },
        { id: 'limits', label: 'Limites', icon: Database },
    ];

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <RefreshCw className="w-12 h-12 animate-spin text-primary-600 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">Chargement de la configuration...</p>
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
                        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Configuration Plateforme</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Paramètres globaux • {stats?.total_companies || 0} entreprises actives
                        </p>
                    </div>
                    <div className="flex gap-2">
                        {hasChanges && (
                            <button
                                onClick={handleReset}
                                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                            >
                                Réinitialiser
                            </button>
                        )}
                        <button
                            onClick={handleSave}
                            disabled={isSaving || !hasChanges}
                            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSaving ? <RefreshCw className="animate-spin" size={20} /> : <Save size={20} />}
                            {isSaving ? 'Sauvegarde...' : 'Sauvegarder'}
                        </button>
                    </div>
                </div>

                {/* Changes indicator */}
                {hasChanges && (
                    <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
                        <div className="flex items-center gap-3">
                            <AlertCircle className="text-orange-600 dark:text-orange-400" size={20} />
                            <p className="text-sm text-orange-900 dark:text-orange-200">
                                Vous avez des modifications non sauvegardées
                            </p>
                        </div>
                    </div>
                )}

                <div className="flex gap-6">
                    {/* Sidebar Tabs */}
                    <div className="w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 h-fit sticky top-6">
                        <nav className="space-y-1">
                            {tabs.map((tab) => {
                                const Icon = tab.icon;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id
                                            ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 shadow-sm'
                                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                                            }`}
                                    >
                                        <Icon size={18} />
                                        {tab.label}
                                    </button>
                                );
                            })}
                        </nav>
                    </div>

                    {/* Content */}
                    <div className="flex-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                        {activeTab === 'general' && (
                            <div className="space-y-6">
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Paramètres généraux</h2>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Nom de la plateforme
                                            </label>
                                            <input
                                                type="text"
                                                value={config.platform_name}
                                                onChange={(e) => handleChange('platform_name', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                URL de la plateforme
                                            </label>
                                            <input
                                                type="url"
                                                value={config.platform_url}
                                                onChange={(e) => handleChange('platform_url', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                            />
                                        </div>
                                        <div className="col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Email de support
                                            </label>
                                            <input
                                                type="email"
                                                value={config.support_email}
                                                onChange={(e) => handleChange('support_email', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                                    <div>
                                        <p className="font-medium text-red-900 dark:text-red-200">Mode maintenance</p>
                                        <p className="text-sm text-red-700 dark:text-red-300">Désactive l'accès pour tous sauf le owner</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={config.maintenance_mode}
                                            onChange={(e) => handleChange('maintenance_mode', e.target.checked)}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 dark:peer-focus:ring-red-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-red-600"></div>
                                    </label>
                                </div>
                            </div>
                        )}

                        {activeTab === 'pricing' && (
                            <div className="space-y-6">
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Plans et tarification (FCFA)</h2>

                                {/* Free Plan */}
                                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                    <h3 className="font-medium text-gray-900 dark:text-white mb-3">Plan Gratuit</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Prix mensuel (FCFA)
                                            </label>
                                            <input
                                                type="number"
                                                value={config.plan_free_price}
                                                onChange={(e) => handleChange('plan_free_price', parseInt(e.target.value))}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Utilisateurs max
                                            </label>
                                            <input
                                                type="number"
                                                value={config.plan_free_max_users}
                                                onChange={(e) => handleChange('plan_free_max_users', parseInt(e.target.value))}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Startup Plan */}
                                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                    <h3 className="font-medium text-gray-900 dark:text-white mb-3">Plan Startup</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Prix mensuel (FCFA)
                                            </label>
                                            <input
                                                type="number"
                                                value={config.plan_startup_price}
                                                onChange={(e) => handleChange('plan_startup_price', parseInt(e.target.value))}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Utilisateurs max
                                            </label>
                                            <input
                                                type="number"
                                                value={config.plan_startup_max_users}
                                                onChange={(e) => handleChange('plan_startup_max_users', parseInt(e.target.value))}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Enterprise Plan */}
                                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                                    <h3 className="font-medium text-gray-900 dark:text-white mb-3">Plan Entreprise</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Prix mensuel (FCFA)
                                            </label>
                                            <input
                                                type="number"
                                                value={config.plan_enterprise_price}
                                                onChange={(e) => handleChange('plan_enterprise_price', parseInt(e.target.value))}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Utilisateurs max
                                            </label>
                                            <input
                                                type="number"
                                                value={config.plan_enterprise_max_users}
                                                onChange={(e) => handleChange('plan_enterprise_max_users', parseInt(e.target.value))}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                                    <div className="flex items-start gap-3">
                                        <Check className="text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" size={20} />
                                        <div>
                                            <p className="text-sm font-medium text-green-900 dark:text-green-200">
                                                Revenu mensuel estimé
                                            </p>
                                            <p className="text-2xl font-bold text-green-700 dark:text-green-400 mt-1">
                                                {stats ? (stats.revenue_mrr || 0).toLocaleString('fr-FR') : '0'} FCFA
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'security' && (
                            <div className="space-y-6">
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Paramètres de sécurité</h2>

                                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg mb-4">
                                    <p className="text-sm text-blue-900 dark:text-blue-200">
                                        ℹ️ <strong>Note :</strong> Ces paramètres ne s'appliquent PAS au compte owner. Le owner a toujours un accès complet.
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Timeout de session (minutes)
                                        </label>
                                        <input
                                            type="number"
                                            value={config.session_timeout}
                                            onChange={(e) => handleChange('session_timeout', parseInt(e.target.value))}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Tentatives de connexion max
                                        </label>
                                        <input
                                            type="number"
                                            value={config.max_login_attempts}
                                            onChange={(e) => handleChange('max_login_attempts', parseInt(e.target.value))}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Longueur minimale du mot de passe
                                        </label>
                                        <input
                                            type="number"
                                            value={config.password_min_length}
                                            onChange={(e) => handleChange('password_min_length', parseInt(e.target.value))}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-white">Authentification multi-facteurs (MFA)</p>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">Exiger MFA pour tous les utilisateurs (sauf owner)</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={config.require_mfa}
                                                onChange={(e) => handleChange('require_mfa', e.target.checked)}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                                        </label>
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-white">Autoriser l'inscription</p>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">Permettre aux nouvelles entreprises de s'inscrire</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={config.allow_registration}
                                                onChange={(e) => handleChange('allow_registration', e.target.checked)}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'email' && (
                            <div className="space-y-6">
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Configuration Email (SMTP)</h2>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Hôte SMTP
                                        </label>
                                        <input
                                            type="text"
                                            value={config.smtp_host}
                                            onChange={(e) => handleChange('smtp_host', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Port SMTP
                                        </label>
                                        <input
                                            type="number"
                                            value={config.smtp_port}
                                            onChange={(e) => handleChange('smtp_port', parseInt(e.target.value))}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Utilisateur SMTP
                                        </label>
                                        <input
                                            type="text"
                                            value={config.smtp_user}
                                            onChange={(e) => handleChange('smtp_user', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Email expéditeur
                                        </label>
                                        <input
                                            type="email"
                                            value={config.smtp_from}
                                            onChange={(e) => handleChange('smtp_from', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-white">Notifications par email</p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Envoyer des notifications automatiques</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={config.email_notifications}
                                            onChange={(e) => handleChange('email_notifications', e.target.checked)}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                                    </label>
                                </div>
                            </div>
                        )}

                        {activeTab === 'appearance' && (
                            <div className="space-y-6">
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Personnalisation de l'apparence</h2>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Couleur primaire
                                        </label>
                                        <div className="flex gap-2">
                                            <input
                                                type="color"
                                                value={config.primary_color}
                                                onChange={(e) => handleChange('primary_color', e.target.value)}
                                                className="h-10 w-20 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
                                            />
                                            <input
                                                type="text"
                                                value={config.primary_color}
                                                onChange={(e) => handleChange('primary_color', e.target.value)}
                                                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Couleur d'accent
                                        </label>
                                        <div className="flex gap-2">
                                            <input
                                                type="color"
                                                value={config.accent_color}
                                                onChange={(e) => handleChange('accent_color', e.target.value)}
                                                className="h-10 w-20 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
                                            />
                                            <input
                                                type="text"
                                                value={config.accent_color}
                                                onChange={(e) => handleChange('accent_color', e.target.value)}
                                                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Thème par défaut
                                    </label>
                                    <select
                                        value={config.default_theme}
                                        onChange={(e) => handleChange('default_theme', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    >
                                        <option value="light">Clair</option>
                                        <option value="dark">Sombre</option>
                                        <option value="system">Système</option>
                                    </select>
                                </div>

                                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
                                    <p className="text-sm text-purple-900 dark:text-purple-200">
                                        🎨 Les modifications de couleur seront appliquées à toute la plateforme après sauvegarde.
                                    </p>
                                </div>
                            </div>
                        )}

                        {activeTab === 'features' && (
                            <div className="space-y-6">
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Fonctionnalités de la plateforme</h2>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                                <Activity className="text-blue-600 dark:text-blue-400" size={20} />
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900 dark:text-white">Analytics avancées</p>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">Graphiques et rapports détaillés</p>
                                            </div>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={config.enable_analytics}
                                                onChange={(e) => handleChange('enable_analytics', e.target.checked)}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                                        </label>
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                                <Download className="text-green-600 dark:text-green-400" size={20} />
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900 dark:text-white">Exports de données</p>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">CSV, Excel, PDF</p>
                                            </div>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={config.enable_exports}
                                                onChange={(e) => handleChange('enable_exports', e.target.checked)}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                                        </label>
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                                                <Code className="text-purple-600 dark:text-purple-400" size={20} />
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900 dark:text-white">Accès API</p>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">API REST pour intégrations</p>
                                            </div>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={config.enable_api_access}
                                                onChange={(e) => handleChange('enable_api_access', e.target.checked)}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'limits' && (
                            <div className="space-y-6">
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Limites de la plateforme</h2>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Nombre max d'entreprises
                                        </label>
                                        <input
                                            type="number"
                                            value={config.max_companies}
                                            onChange={(e) => handleChange('max_companies', parseInt(e.target.value))}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        />
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                            Actuellement: {stats?.total_companies || 0}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Utilisateurs max par entreprise
                                        </label>
                                        <input
                                            type="number"
                                            value={config.max_users_per_company}
                                            onChange={(e) => handleChange('max_users_per_company', parseInt(e.target.value))}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Stockage max (GB)
                                        </label>
                                        <input
                                            type="number"
                                            value={config.storage_limit_gb}
                                            onChange={(e) => handleChange('storage_limit_gb', parseInt(e.target.value))}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        />
                                    </div>
                                </div>

                                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                                    <div className="flex items-start gap-3">
                                        <Cloud className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" size={20} />
                                        <div>
                                            <p className="text-sm font-medium text-blue-900 dark:text-blue-200">
                                                Utilisation actuelle
                                            </p>
                                            <div className="mt-2 space-y-2">
                                                <div>
                                                    <div className="flex justify-between text-xs text-blue-700 dark:text-blue-300 mb-1">
                                                        <span>Entreprises</span>
                                                        <span>{stats?.total_companies || 0} / {config.max_companies}</span>
                                                    </div>
                                                    <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2">
                                                        <div
                                                            className="bg-blue-600 dark:bg-blue-400 h-2 rounded-full transition-all"
                                                            style={{ width: `${((stats?.total_companies || 0) / config.max_companies) * 100}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SaasConfig;
