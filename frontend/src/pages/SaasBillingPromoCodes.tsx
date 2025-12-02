import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, Save, Percent, DollarSign, Calendar, Users, Tag } from 'lucide-react';
import axiosClient from '../api/axiosClient';
import toast from 'react-hot-toast';

interface PromoCode {
    id: number;
    code: string;
    discount_type: string;
    discount_value: number;
    valid_from: string;
    valid_until: string | null;
    max_uses: number | null;
    current_uses: number;
    is_active: boolean;
    applicable_plans: string[];
}

const SaasBillingPromoCodes: React.FC = () => {
    const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingCode, setEditingCode] = useState<PromoCode | null>(null);

    const [formData, setFormData] = useState({
        code: '',
        discount_type: 'percentage',
        discount_value: 0,
        valid_from: new Date().toISOString().split('T')[0],
        valid_until: '',
        max_uses: null as number | null,
        is_active: true,
        applicable_plans: [] as string[]
    });

    useEffect(() => {
        loadPromoCodes();
    }, []);

    const loadPromoCodes = async () => {
        try {
            const response = await axiosClient.get('/api/billing/saas/promo-codes/');
            setPromoCodes(response.data);
        } catch (error) {
            console.error('Erreur chargement codes promo:', error);
            toast.error('Erreur de chargement');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setEditingCode(null);
        setFormData({
            code: '',
            discount_type: 'percentage',
            discount_value: 0,
            valid_from: new Date().toISOString().split('T')[0],
            valid_until: '',
            max_uses: null,
            is_active: true,
            applicable_plans: []
        });
        setShowModal(true);
    };

    const handleEdit = (code: PromoCode) => {
        setEditingCode(code);
        setFormData({
            code: code.code,
            discount_type: code.discount_type,
            discount_value: code.discount_value,
            valid_from: code.valid_from.split('T')[0],
            valid_until: code.valid_until ? code.valid_until.split('T')[0] : '',
            max_uses: code.max_uses,
            is_active: code.is_active,
            applicable_plans: code.applicable_plans
        });
        setShowModal(true);
    };

    const handleSave = async () => {
        try {
            if (editingCode) {
                await axiosClient.put(`/api/billing/saas/promo-codes/${editingCode.id}/`, formData);
                toast.success('Code promo mis à jour');
            } else {
                await axiosClient.post('/api/billing/saas/promo-codes/', formData);
                toast.success('Code promo créé');
            }
            setShowModal(false);
            loadPromoCodes();
        } catch (error: any) {
            toast.error(error.response?.data?.detail || 'Erreur de sauvegarde');
        }
    };

    const handleDelete = async (codeId: number) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer ce code promo ?')) return;

        try {
            await axiosClient.delete(`/api/billing/saas/promo-codes/${codeId}/`);
            toast.success('Code promo supprimé');
            loadPromoCodes();
        } catch (error: any) {
            toast.error(error.response?.data?.detail || 'Erreur de suppression');
        }
    };

    const generateRandomCode = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
        for (let i = 0; i < 8; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setFormData({ ...formData, code });
    };

    if (loading) {
        return <div className="flex items-center justify-center h-96"><div className="text-gray-400">Chargement...</div></div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">🎟️ Codes Promo</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">Créez et gérez vos codes promotionnels</p>
                </div>
                <button
                    onClick={handleCreate}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-medium flex items-center gap-2"
                >
                    <Plus className="w-5 h-5" /> Nouveau Code
                </button>
            </div>

            {/* Promo Codes Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {promoCodes.map((code, index) => (
                    <motion.div
                        key={code.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
                    >
                        <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 text-white">
                            <div className="flex items-center justify-between mb-4">
                                <Tag className="w-8 h-8" />
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${code.is_active ? 'bg-green-500/20' : 'bg-red-500/20'
                                    }`}>
                                    {code.is_active ? 'Actif' : 'Inactif'}
                                </span>
                            </div>
                            <h3 className="text-3xl font-bold font-mono">{code.code}</h3>
                            <p className="text-purple-100 text-sm mt-2">
                                {code.discount_type === 'percentage' ? (
                                    <>{code.discount_value}% de réduction</>
                                ) : (
                                    <>{code.discount_value} FCFA de réduction</>
                                )}
                            </p>
                        </div>

                        <div className="p-6 space-y-3">
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                <Calendar className="w-4 h-4" />
                                <span>
                                    Valide du {new Date(code.valid_from).toLocaleDateString('fr-FR')}
                                    {code.valid_until && ` au ${new Date(code.valid_until).toLocaleDateString('fr-FR')}`}
                                </span>
                            </div>

                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                <Users className="w-4 h-4" />
                                <span>
                                    {code.current_uses} / {code.max_uses || '∞'} utilisations
                                </span>
                            </div>

                            {code.applicable_plans.length > 0 && (
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                    <p className="font-medium">Plans applicables:</p>
                                    <p className="text-xs">{code.applicable_plans.join(', ')}</p>
                                </div>
                            )}
                        </div>

                        <div className="p-6 pt-0 flex gap-2">
                            <button
                                onClick={() => handleEdit(code)}
                                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg flex items-center justify-center gap-2"
                            >
                                <Edit2 className="w-4 h-4" /> Modifier
                            </button>
                            <button
                                onClick={() => handleDelete(code.id)}
                                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>

            {promoCodes.length === 0 && (
                <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                    <Tag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400 mb-4">Aucun code promo créé</p>
                    <button
                        onClick={handleCreate}
                        className="px-6 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-medium"
                    >
                        Créer votre premier code promo
                    </button>
                </div>
            )}

            {/* Create/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6"
                    >
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                            {editingCode ? 'Modifier le Code Promo' : 'Nouveau Code Promo'}
                        </h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Code *
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={formData.code}
                                        onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                        className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono"
                                        placeholder="PROMO2024"
                                    />
                                    <button
                                        onClick={generateRandomCode}
                                        className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-sm"
                                    >
                                        Générer
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Type
                                    </label>
                                    <select
                                        value={formData.discount_type}
                                        onChange={(e) => setFormData({ ...formData, discount_type: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    >
                                        <option value="percentage">Pourcentage</option>
                                        <option value="fixed">Montant fixe</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Valeur *
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.discount_value}
                                        onChange={(e) => setFormData({ ...formData, discount_value: parseFloat(e.target.value) })}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Valide du
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.valid_from}
                                        onChange={(e) => setFormData({ ...formData, valid_from: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Valide jusqu'au
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.valid_until}
                                        onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Nombre max d'utilisations
                                </label>
                                <input
                                    type="number"
                                    value={formData.max_uses || ''}
                                    onChange={(e) => setFormData({ ...formData, max_uses: e.target.value ? parseInt(e.target.value) : null })}
                                    placeholder="Illimité"
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                />
                            </div>

                            <label className="flex items-center gap-2 cursor-pointer p-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                                <input
                                    type="checkbox"
                                    checked={formData.is_active}
                                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                    className="w-4 h-4 text-purple-600 rounded"
                                />
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Code actif</span>
                            </label>
                        </div>

                        <div className="flex gap-2 mt-6">
                            <button
                                onClick={handleSave}
                                className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-medium flex items-center justify-center gap-2"
                            >
                                <Save className="w-4 h-4" /> {editingCode ? 'Mettre à jour' : 'Créer'}
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

export default SaasBillingPromoCodes;
