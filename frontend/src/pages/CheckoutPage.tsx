import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CreditCard, Smartphone, ArrowLeft, Check, Sparkles } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import billingService, { SubscriptionPlan } from '../services/billingService';
import StripePaymentForm from '../components/billing/StripePaymentForm';
import OrangeMoneyForm from '../components/billing/OrangeMoneyForm';
import MoovMoneyForm from '../components/billing/MoovMoneyForm';
import toast from 'react-hot-toast';
import axiosClient from '../api/axiosClient';
import useAuthStore from '../auth/AuthStore';

// Charger Stripe (la clé publique sera récupérée depuis le backend)
const stripePublicKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY;
const stripePromise = stripePublicKey ? loadStripe(stripePublicKey) : null;

const CheckoutPage: React.FC = () => {
    const navigate = useNavigate();
    const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
    const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
    const [loading, setLoading] = useState(true);
    const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'orange_money' | 'moov_money'>('stripe');
    const [promoCode, setPromoCode] = useState('');
    const [discount, setDiscount] = useState(0);
    const { loadUser } = useAuthStore();

    useEffect(() => {
        const searchParams = new URLSearchParams(window.location.search);
        const planSlug = searchParams.get('plan');
        const period = searchParams.get('period') as 'monthly' | 'yearly' || 'monthly';

        setBillingPeriod(period);

        if (planSlug) {
            loadPlan(planSlug);
        } else {
            navigate('/pricing');
        }
    }, [navigate]);

    const loadPlan = async (slug: string) => {
        try {
            const plans = await billingService.getPlans();
            // Toujours charger le plan mensuel comme base
            const plan = plans.find(p => p.slug === slug && p.period === 'monthly');
            if (plan) {
                setSelectedPlan(plan);
            } else {
                toast.error('Plan introuvable');
                navigate('/pricing');
            }
        } catch (error) {
            console.error('Erreur chargement plan:', error);
            toast.error('Erreur de chargement du plan');
            navigate('/pricing');
        } finally {
            setLoading(false);
        }
    };

    const applyPromoCode = async () => {
        if (!promoCode || !selectedPlan) return;

        try {
            const result = await billingService.applyPromoCode(promoCode, selectedPlan.id);
            setDiscount(result.discount_amount);
            toast.success(`Code promo appliqué ! -${result.discount_amount} ${selectedPlan.currency}`);
        } catch (error: any) {
            toast.error(error.response?.data?.detail || 'Code promo invalide');
        }
    };

    // Calculer le prix selon la période
    const getDisplayPrice = () => {
        if (!selectedPlan) return 0;
        if (billingPeriod === 'yearly') {
            return selectedPlan.price * 12 * 0.8; // 20% discount
        }
        return selectedPlan.price;
    };

    const getOriginalYearlyPrice = () => {
        if (!selectedPlan) return 0;
        return selectedPlan.price * 12;
    };

    const displayPrice = getDisplayPrice();
    const finalAmount = Math.max(0, displayPrice - discount);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#000212] flex items-center justify-center">
                <div className="text-white">Chargement...</div>
            </div>
        );
    }

    if (!selectedPlan) {
        return null;
    }

    return (
        <div className="min-h-screen bg-[#000212] text-white py-12 px-6">
            {/* Background effects */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-800/20 rounded-full blur-[120px] opacity-30 animate-pulse-slow"></div>
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-indigo-800/20 rounded-full blur-[120px] opacity-30 animate-pulse-slow delay-1000"></div>
            </div>

            <div className="max-w-6xl mx-auto relative z-10">
                {/* Back button */}
                <button
                    onClick={() => navigate('/pricing')}
                    className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Retour aux plans
                </button>

                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Left: Order Summary */}
                    <div>
                        <h1 className="text-4xl font-bold mb-8">Finaliser votre abonnement</h1>

                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h3 className="text-2xl font-bold">{selectedPlan.name}</h3>
                                    <p className="text-gray-400 mt-1">{selectedPlan.description}</p>
                                </div>
                                {selectedPlan.is_popular && (
                                    <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm">
                                        Populaire
                                    </span>
                                )}
                            </div>

                            <div className="space-y-3 mb-6">
                                {Object.entries(selectedPlan.features).map(([key, value]) => (
                                    value && (
                                        <div key={key} className="flex items-center gap-2 text-gray-300">
                                            <Check className="w-5 h-5 text-purple-400" />
                                            <span className="capitalize">{key.replace(/_/g, ' ')}</span>
                                        </div>
                                    )
                                ))}
                            </div>

                            <div className="border-t border-white/10 pt-4">
                                <div className="flex justify-between text-lg mb-2">
                                    <span className="text-gray-400">Prix {billingPeriod === 'yearly' ? 'annuel' : 'mensuel'}</span>
                                    <span>{Math.round(displayPrice).toLocaleString()} {selectedPlan.currency}</span>
                                </div>
                                {billingPeriod === 'yearly' && (
                                    <div className="flex justify-between text-sm mb-2 text-gray-400">
                                        <span>Prix sans réduction</span>
                                        <span className="line-through">{Math.round(getOriginalYearlyPrice()).toLocaleString()} {selectedPlan.currency}</span>
                                    </div>
                                )}
                                {billingPeriod === 'yearly' && (
                                    <div className="flex justify-between text-sm mb-2 text-green-400">
                                        <span>Réduction annuelle (20%)</span>
                                        <span>-{Math.round(getOriginalYearlyPrice() - displayPrice).toLocaleString()} {selectedPlan.currency}</span>
                                    </div>
                                )}
                                {discount > 0 && (
                                    <div className="flex justify-between text-lg mb-2 text-green-400">
                                        <span>Code promo</span>
                                        <span>-{discount} {selectedPlan.currency}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-2xl font-bold mt-4">
                                    <span>Total</span>
                                    <span>{Math.round(finalAmount).toLocaleString()} {selectedPlan.currency}</span>
                                </div>
                                <p className="text-gray-400 text-sm mt-2">
                                    Facturé {billingPeriod === 'monthly' ? 'mensuellement' : 'annuellement'}
                                </p>
                            </div>
                        </div>

                        {/* Promo code */}
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                            <label className="block text-sm font-medium mb-2">Code promo</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={promoCode}
                                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                                    placeholder="ENTREZ VOTRE CODE"
                                    className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                                />
                                <button
                                    onClick={applyPromoCode}
                                    className="px-6 py-3 bg-purple-600 hover:bg-purple-500 rounded-xl font-medium transition-colors"
                                >
                                    Appliquer
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right: Payment Method or Confirmation */}
                    <div>
                        {selectedPlan.slug === 'enterprise' ? (
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
                                <h2 className="text-2xl font-bold mb-4">Contactez-nous</h2>
                                <p className="text-gray-400 mb-6">
                                    Pour le plan Entreprise, nous définissons ensemble une offre sur mesure adaptée à vos besoins spécifiques.
                                </p>
                                <button
                                    onClick={() => window.location.href = 'mailto:contact@grh-saas.com'} // Ou navigation vers /contact
                                    className="w-full py-4 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors"
                                >
                                    Contacter l'équipe commerciale
                                </button>
                            </div>
                        ) : finalAmount === 0 ? (
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
                                <h2 className="text-2xl font-bold mb-4">Confirmer l'abonnement</h2>
                                <p className="text-gray-400 mb-6">
                                    Vous avez choisi le plan <strong>{selectedPlan.name}</strong>.
                                    Aucun paiement n'est requis pour commencer.
                                </p>
                                <button
                                    onClick={async () => {
                                        try {
                                            setLoading(true);
                                            await billingService.subscribeFree(selectedPlan.id);

                                            // Rafraîchir l'utilisateur pour mettre à jour le statut d'abonnement
                                            await loadUser();

                                            toast.success('Abonnement activé avec succès !');
                                            navigate('/dashboard');
                                        } catch (error: any) {
                                            toast.error(error.response?.data?.detail || 'Erreur lors de l\'activation');
                                            setLoading(false);
                                        }
                                    }}
                                    disabled={loading}
                                    className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-purple-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? 'Activation...' : 'Confirmer et Commencer'}
                                </button>
                            </div>
                        ) : (
                            <>
                                <h2 className="text-2xl font-bold mb-6">Méthode de paiement</h2>

                                {/* Payment method selector */}
                                <div className="grid grid-cols-3 gap-4 mb-6">
                                    <button
                                        onClick={() => setPaymentMethod('stripe')}
                                        className={`p-4 rounded-xl border-2 transition-all ${paymentMethod === 'stripe'
                                            ? 'border-purple-500 bg-purple-500/10'
                                            : 'border-white/10 bg-white/5 hover:border-white/20'
                                            }`}
                                    >
                                        <CreditCard className="w-8 h-8 mx-auto mb-2" />
                                        <div className="text-sm font-medium">Carte bancaire</div>
                                        <div className="text-xs text-gray-400 mt-1">Visa, Mastercard</div>
                                    </button>

                                    <button
                                        onClick={() => setPaymentMethod('orange_money')}
                                        className={`p-4 rounded-xl border-2 transition-all ${paymentMethod === 'orange_money'
                                            ? 'border-orange-500 bg-orange-500/10'
                                            : 'border-white/10 bg-white/5 hover:border-white/20'
                                            }`}
                                    >
                                        <Smartphone className="w-8 h-8 mx-auto mb-2 text-orange-400" />
                                        <div className="text-sm font-medium">Orange Money</div>
                                        <div className="text-xs text-gray-400 mt-1">Mali</div>
                                    </button>

                                    <button
                                        onClick={() => setPaymentMethod('moov_money')}
                                        className={`p-4 rounded-xl border-2 transition-all ${paymentMethod === 'moov_money'
                                            ? 'border-blue-500 bg-blue-500/10'
                                            : 'border-white/10 bg-white/5 hover:border-white/20'
                                            }`}
                                    >
                                        <Smartphone className="w-8 h-8 mx-auto mb-2 text-blue-400" />
                                        <div className="text-sm font-medium">Moov Money</div>
                                        <div className="text-xs text-gray-400 mt-1">Mali</div>
                                    </button>
                                </div>

                                {/* Payment forms */}
                                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                                    {paymentMethod === 'stripe' && (
                                        stripePromise ? (
                                            <Elements stripe={stripePromise}>
                                                <StripePaymentForm
                                                    planId={selectedPlan.id}
                                                    amount={finalAmount}
                                                    currency={selectedPlan.currency}
                                                />
                                            </Elements>
                                        ) : (
                                            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-center">
                                                Configuration Stripe manquante. Veuillez ajouter VITE_STRIPE_PUBLIC_KEY dans le fichier .env
                                            </div>
                                        )
                                    )}

                                    {paymentMethod === 'orange_money' && (
                                        <OrangeMoneyForm
                                            planId={selectedPlan.id}
                                            amount={finalAmount}
                                            currency={selectedPlan.currency}
                                        />
                                    )}

                                    {paymentMethod === 'moov_money' && (
                                        <MoovMoneyForm
                                            planId={selectedPlan.id}
                                            amount={finalAmount}
                                            currency={selectedPlan.currency}
                                        />
                                    )}
                                </div>

                                {/* Security badges */}
                                <div className="mt-6 flex items-center justify-center gap-4 text-sm text-gray-400">
                                    <div className="flex items-center gap-2">
                                        <Sparkles className="w-4 h-4" />
                                        <span>Paiement sécurisé</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Check className="w-4 h-4" />
                                        <span>SSL 256-bit</span>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;
