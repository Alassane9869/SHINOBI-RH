import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
    CreditCard, Smartphone, Shield, Check, X, Edit2, Save, Plus,
    Trash2, Key, Mail, Globe, TestTube, AlertCircle, CheckCircle
} from 'lucide-react';
import axiosClient from '../api/axiosClient';
import toast from 'react-hot-toast';

interface PaymentConfig {
    id: number;
    provider: string;
    provider_display: string;
    is_active: boolean;
    test_mode: boolean;
    api_key_masked: string;
    notification_email: string;
    created_at: string;
    updated_at: string;
}

interface PaymentConfigForm {
    provider: string;
    is_active: boolean;
    test_mode: boolean;
    api_key: string;
    api_secret: string;
    webhook_secret: string;
    notification_email: string;
    config_json: Record<string, any>;
}

const PROVIDER_OPTIONS = [
    { value: 'stripe', label: 'Stripe (Mastercard/Visa)', icon: CreditCard, color: 'purple' },
    { value: 'orange_money', label: 'Orange Money Mali', icon: Smartphone, color: 'orange' },
    { value: 'moov_money', label: 'Moov Money Mali', icon: Smartphone, color: 'blue' },
    { value: 'wave', label: 'Wave', icon: Smartphone, color: 'cyan' },
];

const SaasBillingConfig: React.FC = () => {
    const [configs, setConfigs] = useState<PaymentConfig[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingProvider, setEditingProvider] = useState<string | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [testingConnection, setTestingConnection] = useState<string | null>(null);

    const [formData, setFormData] = useState<PaymentConfigForm>({
        provider: '',
        is_active: true,
        test_mode: true,
        api_key: '',
        api_secret: '',
        webhook_secret: '',
        notification_email: '',
        config_json: {}
    });

    useEffect(() => {
        loadConfigs();
    }, []);

    const loadConfigs = async () => {
        try {
            const response = await axiosClient.get('/api/billing/saas/config/');
            setConfigs(response.data);
        } catch (error) {
            console.error('Erreur chargement configs:', error);
            toast.error('Erreur de chargement');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (config: PaymentConfig) => {
        setEditingProvider(config.provider);
        setFormData({
            provider: config.provider,
            is_active: config.is_active,
            test_mode: config.test_mode,
            api_key: '',
            api_secret: '',
            webhook_secret: '',
            notification_email: config.notification_email,
            config_json: {}
        });
    };

    const handleSave = async (provider: string) => {
        try {
            await axiosClient.put(`/api/billing/saas/config/${provider}/`, formData);
            toast.success('Configuration mise à jour');
            setEditingProvider(null);
            loadConfigs();
        } catch (error: any) {
            toast.error(error.response?.data?.detail || 'Erreur de sauvegarde');
        }
    };

    const handleCreate = async () => {
        if (!formData.provider) {
            toast.error('Sélectionnez un provider');
            return;
        }

        try {
            await axiosClient.put(`/api/billing/saas/config/${formData.provider}/`, formData);
            toast.success('Provider créé avec succès');
            setShowCreateModal(false);
            setFormData({
                provider: '',
                is_active: true,
                test_mode: true,
                api_key: '',
                api_secret: '',
                webhook_secret: '',
                notification_email: '',
                config_json: {}
            });
            loadConfigs();
        } catch (error: any) {
            toast.error(error.response?.data?.detail || 'Erreur de création');
        }
    };

    const handleDelete = async (provider: string) => {
        if (!confirm(`Êtes-vous sûr de vouloir supprimer la configuration ${provider} ?`)) return;

        try {
            await axiosClient.delete(`/api/billing/saas/config/${provider}/`);
            toast.success('Configuration supprimée');
            loadConfigs();
        } catch (error: any) {
            toast.error(error.response?.data?.detail || 'Erreur de suppression');
        }
    };

    const testConnection = async (provider: string) => {
        setTestingConnection(provider);
        try {
            const response = await axiosClient.post(`/api/billing/saas/config/${provider}/test/`);
            if (response.data.success) {
                toast.success('✅ Connexion réussie !');
            } else {
                toast.error('❌ Échec de connexion');
            }
        } catch (error) {
            toast.error('❌ Erreur de test');
        } finally {
            setTestingConnection(null);
        }
    };

    const getProviderIcon = (provider: string) => {
        const option = PROVIDER_OPTIONS.find(p => p.value === provider);
        const Icon = option?.icon || Shield;
        return <Icon className="w-8 h-8" />;
    };

    const getProviderColor = (provider: string) => {
        const colors: Record<string, string> = {
            stripe: 'from-purple-500 to-purple-600',
            orange_money: 'from-orange-500 to-orange-600',
            moov_money: 'from-blue-500 to-blue-600',
            wave: 'from-cyan-500 to-cyan-600'
        };
        return colors[provider] || 'from-gray-500 to-gray-600';
    };

    const availableProviders = PROVIDER_OPTIONS.filter(
        p => !configs.find(c => c.provider === p.value)
    );

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
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        ⚙️ Configuration des Paiements
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        Gérez tous vos moyens de paiement (Stripe, Orange Money, Moov Money, Wave)
                    </p>
                </div>
                {availableProviders.length > 0 && (
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-medium flex items-center gap-2"
                    >
                        <Plus className="w-5 h-5" /> Ajouter Provider
                    </button>
                )}
            </div>

            {/* Security Notice */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                    <div>
                        <h3 className="font-medium text-blue-900 dark:text-blue-300">
                            Sécurité des clés API
                        </h3>
                        <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
                            Les clés API sont masquées pour votre sécurité. Seuls les 4 derniers caractères sont affichés.
                            Toutes les modifications sont enregistrées dans les logs d'audit.
                        </p>
                    </div>
                </div>
            </div>

            {/* Payment Methods Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {configs.map((config) => (
                    <motion.div
                        key={config.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
                    >
                        {/* Header */}
                        <div className={`bg-gradient-to-r ${getProviderColor(config.provider)} p-6 text-white`}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    {getProviderIcon(config.provider)}
                                    <div>
                                        <h3 className="text-xl font-bold">{config.provider_display}</h3>
                                        <p className="text-sm opacity-90">
                                            {config.test_mode ? '🧪 Mode Test' : '🚀 Mode Production'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {config.is_active ? (
                                        <span className="px-3 py-1 bg-green-500/20 text-white rounded-full text-sm flex items-center gap-1">
                                            <CheckCircle className="w-4 h-4" /> Actif
                                        </span>
                                    ) : (
                                        <span className="px-3 py-1 bg-red-500/20 text-white rounded-full text-sm flex items-center gap-1">
                                            <AlertCircle className="w-4 h-4" /> Inactif
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6">
                            {editingProvider === config.provider ? (
                                // Edit Mode - Full Form
                                <div className="space-y-4">
                                    {/* Toggles */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <label className="flex items-center gap-2 cursor-pointer p-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                                            <input
                                                type="checkbox"
                                                checked={formData.is_active}
                                                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                                className="w-4 h-4 text-purple-600 rounded"
                                            />
                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Activer</span>
                                        </label>

                                        <label className="flex items-center gap-2 cursor-pointer p-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                                            <input
                                                type="checkbox"
                                                checked={formData.test_mode}
                                                onChange={(e) => setFormData({ ...formData, test_mode: e.target.checked })}
                                                className="w-4 h-4 text-purple-600 rounded"
                                            />
                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Mode Test</span>
                                        </label>
                                    </div>

                                    {/* API Key */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-2">
                                            <Key className="w-4 h-4" /> Clé API Publique
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.api_key}
                                            onChange={(e) => setFormData({ ...formData, api_key: e.target.value })}
                                            placeholder="pk_test_... ou merchant_id"
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        />
                                    </div>

                                    {/* API Secret */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-2">
                                            <Key className="w-4 h-4" /> Clé API Secrète
                                        </label>
                                        <input
                                            type="password"
                                            value={formData.api_secret}
                                            onChange={(e) => setFormData({ ...formData, api_secret: e.target.value })}
                                            placeholder="sk_test_... ou api_secret"
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        />
                                    </div>

                                    {/* Webhook Secret */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-2">
                                            <Globe className="w-4 h-4" /> Webhook Secret
                                        </label>
                                        <input
                                            type="password"
                                            value={formData.webhook_secret}
                                            onChange={(e) => setFormData({ ...formData, webhook_secret: e.target.value })}
                                            placeholder="whsec_..."
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        />
                                    </div>

                                    {/* Notification Email */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-2">
                                            <Mail className="w-4 h-4" /> Email de Notification
                                        </label>
                                        <input
                                            type="email"
                                            value={formData.notification_email}
                                            onChange={(e) => setFormData({ ...formData, notification_email: e.target.value })}
                                            placeholder="admin@example.com"
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        />
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-2 pt-2">
                                        <button
                                            onClick={() => handleSave(config.provider)}
                                            className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg font-medium flex items-center justify-center gap-2"
                                        >
                                            <Save className="w-4 h-4" /> Sauvegarder
                                        </button>
                                        <button
                                            onClick={() => setEditingProvider(null)}
                                            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium"
                                        >
                                            Annuler
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                // View Mode
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">Clé API</p>
                                            <p className="font-mono text-sm text-gray-900 dark:text-white">
                                                {config.api_key_masked || 'Non configurée'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
                                            <p className="text-sm text-gray-900 dark:text-white truncate">
                                                {config.notification_email || 'Non configuré'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <p className="text-gray-600 dark:text-gray-400">Créé le</p>
                                            <p className="text-gray-900 dark:text-white">
                                                {new Date(config.created_at).toLocaleDateString('fr-FR')}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-gray-600 dark:text-gray-400">Modifié le</p>
                                            <p className="text-gray-900 dark:text-white">
                                                {new Date(config.updated_at).toLocaleDateString('fr-FR')}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-2 pt-2">
                                        <button
                                            onClick={() => handleEdit(config)}
                                            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium flex items-center justify-center gap-2"
                                        >
                                            <Edit2 className="w-4 h-4" /> Modifier
                                        </button>
                                        <button
                                            onClick={() => testConnection(config.provider)}
                                            disabled={testingConnection === config.provider}
                                            className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                                        >
                                            <TestTube className="w-4 h-4" />
                                            {testingConnection === config.provider ? 'Test...' : 'Tester'}
                                        </button>
                                        <button
                                            onClick={() => handleDelete(config.provider)}
                                            className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                ))}
            </div>

            {configs.length === 0 && (
                <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                    <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400 mb-4">Aucun moyen de paiement configuré</p>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="px-6 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-medium"
                    >
                        Ajouter votre premier provider
                    </button>
                </div>
            )}

            {/* Create Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6"
                    >
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                            Ajouter un Provider
                        </h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Sélectionner le provider
                                </label>
                                <select
                                    value={formData.provider}
                                    onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                >
                                    <option value="">-- Choisir --</option>
                                    {availableProviders.map(p => (
                                        <option key={p.value} value={p.value}>{p.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={handleCreate}
                                    className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-medium"
                                >
                                    Créer
                                </button>
                                <button
                                    onClick={() => {
                                        setShowCreateModal(false);
                                        setFormData({
                                            provider: '',
                                            is_active: true,
                                            test_mode: true,
                                            api_key: '',
                                            api_secret: '',
                                            webhook_secret: '',
                                            notification_email: '',
                                            config_json: {}
                                        });
                                    }}
                                    className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium"
                                >
                                    Annuler
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default SaasBillingConfig;
