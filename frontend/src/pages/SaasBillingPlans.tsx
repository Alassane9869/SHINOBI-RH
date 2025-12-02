import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, Users, DollarSign, Check, X, Save, Copy, Archive, Star } from 'lucide-react';
import axiosClient from '../api/axiosClient';
import toast from 'react-hot-toast';

interface Plan {
    id: number;
    name: string;
    slug: string;
    description: string;
    price: number;
    currency: string;
    period: string;
    max_employees: number | null;
    max_users: number | null;
    is_active: boolean;
    is_popular: boolean;
    display_order: number;
    subscribers_count?: number;
    revenue?: number;
    features: Record<string, any>;
    created_at: string;
    updated_at: string;
}

interface PlanForm {
    name: string;
    slug: string;
    description: string;
    price: number;
    currency: string;
    period: string;
    max_employees: number | null;
    max_users: number | null;
    is_active: boolean;
    is_popular: boolean;
    display_order: number;
    features: Record<string, boolean>;
}

const FEATURE_OPTIONS = [
    { key: 'attendance_tracking', label: 'Suivi des présences' },
    { key: 'leave_management', label: 'Gestion des congés' },
    { key: 'payroll', label: 'Gestion de la paie' },
    { key: 'documents', label: 'Gestion documentaire' },
    { key: 'reports', label: 'Rapports & Analytics' },
    { key: 'api_access', label: 'Accès API' },
    { key: 'custom_fields', label: 'Champs personnalisés' },
    { key: 'multi_company', label: 'Multi-entreprises' },
    { key: 'advanced_permissions', label: 'Permissions avancées' },
    { key: 'priority_support', label: 'Support prioritaire' },
];

const SaasBillingPlans: React.FC = () => {
    const [plans, setPlans] = useState<Plan[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingPlan, setEditingPlan] = useState<Plan | null>(null);

    const [formData, setFormData] = useState<PlanForm>({
        name: '',
        slug: '',
        description: '',
        price: 0,
        currency: 'FCFA',
        period: 'monthly',
        max_employees: null,
        max_users: null,
        is_active: true,
        is_popular: false,
        display_order: 0,
        features: {}
    });

    useEffect(() => {
        loadPlans();
    }, []);

    const loadPlans = async () => {
        try {
            const response = await axiosClient.get('/api/billing/saas/plans/');
            setPlans(response.data);
        } catch (error) {
            console.error('Erreur chargement plans:', error);
            toast.error('Erreur de chargement');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setEditingPlan(null);
        setFormData({
            name: '',
            slug: '',
            description: '',
            price: 0,
            currency: 'FCFA',
            period: 'monthly',
            max_employees: null,
            max_users: null,
            is_active: true,
            is_popular: false,
            display_order: plans.length,
            features: {}
        });
        setShowModal(true);
    };

    const handleEdit = (plan: Plan) => {
        setEditingPlan(plan);
        setFormData({
            name: plan.name,
            slug: plan.slug,
            description: plan.description,
            price: plan.price,
            currency: plan.currency,
            period: plan.period,
            max_employees: plan.max_employees,
            max_users: plan.max_users,
            is_active: plan.is_active,
            is_popular: plan.is_popular,
            display_order: plan.display_order,
            features: plan.features
        });
        setShowModal(true);
    };

    const handleSave = async () => {
        try {
            if (editingPlan) {
                await axiosClient.put(`/api/billing/saas/plans/${editingPlan.id}/`, formData);
                toast.success('Plan mis à jour');
            } else {
                await axiosClient.post('/api/billing/saas/plans/', formData);
                toast.success('Plan créé');
            }
            setShowModal(false);
            loadPlans();
        } catch (error: any) {
            toast.error(error.response?.data?.detail || 'Erreur de sauvegarde');
        }
    };

    const handleDelete = async (planId: number) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer ce plan ?')) return;

        try {
            await axiosClient.delete(`/api/billing/saas/plans/${planId}/`);
            toast.success('Plan supprimé');
            loadPlans();
        } catch (error: any) {
            toast.error(error.response?.data?.detail || 'Erreur de suppression');
        }
    };

    const handleDuplicate = (plan: Plan) => {
        setEditingPlan(null);
        setFormData({
            name: `${plan.name} (Copie)`,
            slug: `${plan.slug}-copy`,
            description: plan.description,
            price: plan.price,
            currency: plan.currency,
            period: plan.period,
            max_employees: plan.max_employees,
            max_users: plan.max_users,
            is_active: false,
            is_popular: false,
            display_order: plans.length,
            features: plan.features
        });
        setShowModal(true);
    };

    const handleToggleActive = async (plan: Plan) => {
        try {
            await axiosClient.put(`/api/billing/saas/plans/${plan.id}/`, {
                ...plan,
                is_active: !plan.is_active
            });
            toast.success(plan.is_active ? 'Plan désactivé' : 'Plan activé');
            loadPlans();
        } catch (error) {
            toast.error('Erreur de mise à jour');
        }
    };

    const generateSlug = (name: string) => {
        return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
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
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        📦 Gestion des Plans
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        Créez et gérez tous vos plans d'abonnement
                    </p>
                </div>
                <button
                    onClick={handleCreate}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-medium flex items-center gap-2"
                >
                    <Plus className="w-5 h-5" /> Nouveau Plan
                </button>
            </div>

            {/* Plans Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {plans.map((plan, index) => (
                    <motion.div
                        key={plan.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`bg-white dark:bg-gray-800 rounded-xl border-2 ${plan.is_popular
                                ? 'border-purple-500 shadow-lg shadow-purple-500/20'
                                : 'border-gray-200 dark:border-gray-700'
                            } overflow-hidden`}
                    >
                        {/* Header */}
                        <div className={`p-6 ${plan.is_popular ? 'bg-gradient-to-br from-purple-500 to-purple-600 text-white' : 'bg-gray-50 dark:bg-gray-900'}`}>
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h3 className={`text-2xl font-bold ${plan.is_popular ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                                        {plan.name}
                                    </h3>
                                    <p className={`text-sm mt-1 ${plan.is_popular ? 'text-purple-100' : 'text-gray-600 dark:text-gray-400'}`}>
                                        {plan.description}
                                    </p>
                                </div>
                                {plan.is_popular && (
                                    <Star className="w-6 h-6 text-yellow-300 fill-yellow-300" />
                                )}
                            </div>

                            <div className={`text-4xl font-bold ${plan.is_popular ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                                {plan.price === 0 ? 'Gratuit' : `${plan.price.toLocaleString()} ${plan.currency}`}
                                {plan.price > 0 && (
                                    <span className={`text-sm font-normal ${plan.is_popular ? 'text-purple-100' : 'text-gray-500 dark:text-gray-400'}`}>
                                        /{plan.period === 'monthly' ? 'mois' : 'an'}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-sm mb-1">
                                        <Users className="w-4 h-4" />
                                        Abonnés
                                    </div>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {plan.subscribers_count || 0}
                                    </p>
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-sm mb-1">
                                        <DollarSign className="w-4 h-4" />
                                        Revenus
                                    </div>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {(plan.revenue || 0).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Limits */}
                        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Limites</p>
                            <div className="space-y-2 text-sm">
                                {plan.max_employees && (
                                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                        <Check className="w-4 h-4 text-green-500" />
                                        Jusqu'à {plan.max_employees} employés
                                    </div>
                                )}
                                {plan.max_users && (
                                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                        <Check className="w-4 h-4 text-green-500" />
                                        Jusqu'à {plan.max_users} utilisateurs
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Features */}
                        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Fonctionnalités</p>
                            <div className="space-y-2">
                                {Object.entries(plan.features).slice(0, 5).map(([key, value]) =>
                                    value ? (
                                        <div key={key} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                            <Check className="w-4 h-4 text-green-500" />
                                            {FEATURE_OPTIONS.find(f => f.key === key)?.label || key}
                                        </div>
                                    ) : null
                                )}
                                {Object.values(plan.features).filter(Boolean).length > 5 && (
                                    <p className="text-xs text-gray-500 dark:text-gray-500">
                                        +{Object.values(plan.features).filter(Boolean).length - 5} autres
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="p-6 flex gap-2">
                            <button
                                onClick={() => handleToggleActive(plan)}
                                className={`flex-1 px-4 py-2 rounded-lg font-medium ${plan.is_active
                                        ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                                    }`}
                            >
                                {plan.is_active ? 'Actif' : 'Inactif'}
                            </button>
                            <button
                                onClick={() => handleEdit(plan)}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg"
                                title="Modifier"
                            >
                                <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => handleDuplicate(plan)}
                                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg"
                                title="Dupliquer"
                            >
                                <Copy className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => handleDelete(plan.id)}
                                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg"
                                title="Supprimer"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>

            {plans.length === 0 && (
                <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                    <p className="text-gray-500 dark:text-gray-400 mb-4">Aucun plan créé pour le moment</p>
                    <button
                        onClick={handleCreate}
                        className="px-6 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-medium"
                    >
                        Créer votre premier plan
                    </button>
                </div>
            )}

            {/* Create/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full p-6 my-8"
                    >
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                            {editingPlan ? 'Modifier le Plan' : 'Nouveau Plan'}
                        </h2>

                        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                            {/* Basic Info */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Nom du Plan *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => {
                                            setFormData({
                                                ...formData,
                                                name: e.target.value,
                                                slug: generateSlug(e.target.value)
                                            });
                                        }}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        placeholder="Ex: Starter, Pro, Enterprise"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Slug *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.slug}
                                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        placeholder="starter-plan"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Description
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows={3}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    placeholder="Description courte du plan"
                                />
                            </div>

                            {/* Pricing */}
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Prix *
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Devise
                                    </label>
                                    <select
                                        value={formData.currency}
                                        onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    >
                                        <option value="FCFA">FCFA</option>
                                        <option value="EUR">EUR</option>
                                        <option value="USD">USD</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Période
                                    </label>
                                    <select
                                        value={formData.period}
                                        onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    >
                                        <option value="monthly">Mensuel</option>
                                        <option value="yearly">Annuel</option>
                                    </select>
                                </div>
                            </div>

                            {/* Limits */}
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Max Employés
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.max_employees || ''}
                                        onChange={(e) => setFormData({ ...formData, max_employees: e.target.value ? parseInt(e.target.value) : null })}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        placeholder="Illimité"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Max Utilisateurs
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.max_users || ''}
                                        onChange={(e) => setFormData({ ...formData, max_users: e.target.value ? parseInt(e.target.value) : null })}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        placeholder="Illimité"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Ordre d'affichage
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.display_order}
                                        onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    />
                                </div>
                            </div>

                            {/* Toggles */}
                            <div className="grid grid-cols-2 gap-4">
                                <label className="flex items-center gap-2 cursor-pointer p-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                                    <input
                                        type="checkbox"
                                        checked={formData.is_active}
                                        onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                        className="w-4 h-4 text-purple-600 rounded"
                                    />
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Plan Actif</span>
                                </label>

                                <label className="flex items-center gap-2 cursor-pointer p-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                                    <input
                                        type="checkbox"
                                        checked={formData.is_popular}
                                        onChange={(e) => setFormData({ ...formData, is_popular: e.target.checked })}
                                        className="w-4 h-4 text-purple-600 rounded"
                                    />
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Plan Populaire</span>
                                </label>
                            </div>

                            {/* Features */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                    Fonctionnalités
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    {FEATURE_OPTIONS.map(feature => (
                                        <label key={feature.key} className="flex items-center gap-2 cursor-pointer p-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                                            <input
                                                type="checkbox"
                                                checked={formData.features[feature.key] || false}
                                                onChange={(e) => setFormData({
                                                    ...formData,
                                                    features: { ...formData.features, [feature.key]: e.target.checked }
                                                })}
                                                className="w-4 h-4 text-purple-600 rounded"
                                            />
                                            <span className="text-sm text-gray-700 dark:text-gray-300">{feature.label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                            <button
                                onClick={handleSave}
                                className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-medium flex items-center justify-center gap-2"
                            >
                                <Save className="w-4 h-4" /> {editingPlan ? 'Mettre à jour' : 'Créer'}
                            </button>
                            <button
                                onClick={() => setShowModal(false)}
                                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium"
                            >
                                Annuler
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default SaasBillingPlans;
