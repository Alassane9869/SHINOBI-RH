import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CreditCard, Calendar, Shield, Zap, CheckCircle, AlertTriangle } from 'lucide-react';
import billingService, { Subscription } from '../services/billingService';
import PaymentHistory from '../components/billing/PaymentHistory';
import toast from 'react-hot-toast';

const SubscriptionDashboard: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [subscription, setSubscription] = useState<Subscription | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadSubscription();
        if (searchParams.get('success') === 'true') {
            toast.success('Abonnement activé avec succès !', { duration: 5000 });
        }
    }, []);

    const loadSubscription = async () => {
        try {
            const data = await billingService.getCurrentSubscription();
            setSubscription(data);
        } catch (error) {
            console.error('Erreur chargement abonnement:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async () => {
        if (window.confirm('Êtes-vous sûr de vouloir annuler votre abonnement ?')) {
            try {
                await billingService.cancelSubscription();
                toast.success('Abonnement annulé');
                loadSubscription();
            } catch (error) {
                toast.error("Erreur lors de l'annulation");
            }
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#000212] flex items-center justify-center text-white">
                Chargement...
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#000212] text-white p-6 md:p-12">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-3xl font-bold mb-8">Mon Abonnement</h1>

                {/* Current Plan Card */}
                <div className="grid md:grid-cols-3 gap-6 mb-12">
                    <div className="md:col-span-2 bg-white/5 border border-white/10 rounded-2xl p-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${subscription?.status === 'active' ? 'bg-green-500/20 text-green-400' :
                                    subscription?.status === 'trial' ? 'bg-blue-500/20 text-blue-400' :
                                        'bg-red-500/20 text-red-400'
                                }`}>
                                {subscription?.status === 'active' ? 'Actif' :
                                    subscription?.status === 'trial' ? 'Essai Gratuit' :
                                        'Inactif'}
                            </span>
                        </div>

                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center">
                                <Zap className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold">{subscription?.plan.name || 'Aucun plan'}</h2>
                                <p className="text-gray-400">
                                    {subscription?.plan.price} {subscription?.plan.currency} / {subscription?.plan.period === 'monthly' ? 'mois' : 'an'}
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6 mb-8">
                            <div>
                                <p className="text-sm text-gray-400 mb-1">Prochain paiement</p>
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-purple-400" />
                                    <span>
                                        {subscription?.next_billing_date
                                            ? new Date(subscription.next_billing_date).toLocaleDateString()
                                            : 'N/A'}
                                    </span>
                                </div>
                            </div>
                            <div>
                                <p className="text-sm text-gray-400 mb-1">Méthode de paiement</p>
                                <div className="flex items-center gap-2">
                                    <CreditCard className="w-4 h-4 text-purple-400" />
                                    <span className="capitalize">
                                        {subscription?.plan.price === 0 ? 'Gratuit' : 'Carte / Mobile Money'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={() => navigate('/pricing')}
                                className="px-6 py-2 bg-white text-black font-medium rounded-lg hover:bg-gray-200 transition-colors"
                            >
                                Changer de plan
                            </button>
                            {subscription?.status === 'active' && (
                                <button
                                    onClick={handleCancel}
                                    className="px-6 py-2 border border-white/20 hover:bg-white/5 rounded-lg transition-colors text-red-400 hover:text-red-300"
                                >
                                    Annuler l'abonnement
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Stats / Usage */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
                        <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                            <Shield className="w-5 h-5 text-purple-400" />
                            Utilisation
                        </h3>

                        <div className="space-y-6">
                            <div>
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-gray-400">Employés</span>
                                    <span>{subscription?.plan.max_employees || 'Illimité'}</span>
                                </div>
                                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                    <div className="h-full w-1/3 bg-purple-500 rounded-full"></div>
                                </div>
                            </div>

                            <div className="p-4 bg-purple-500/10 rounded-xl border border-purple-500/20">
                                <p className="text-sm text-purple-300">
                                    Besoin de plus de capacité ? Passez au plan supérieur pour débloquer plus de fonctionnalités.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Payment History */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
                    <h3 className="text-xl font-bold mb-6">Historique des paiements</h3>
                    <PaymentHistory />
                </div>
            </div>
        </div>
    );
};

export default SubscriptionDashboard;
