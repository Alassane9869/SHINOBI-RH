import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, Sparkles, Zap } from 'lucide-react';
import billingService, { SubscriptionPlan } from '../services/billingService';
import toast from 'react-hot-toast';

const PricingPage: React.FC = () => {
    const navigate = useNavigate();
    const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
    const [loading, setLoading] = useState(true);
    const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');

    useEffect(() => {
        loadPlans();
    }, []);

    const loadPlans = async () => {
        try {
            const data = await billingService.getPlans();
            setPlans(data.filter(p => p.is_active));
        } catch (error) {
            console.error('Erreur chargement plans:', error);
            toast.error('Erreur de chargement des plans');
        } finally {
            setLoading(false);
        }
    };

    const handleSelectPlan = (planSlug: string) => {
        console.log('Selected plan slug:', planSlug, 'Billing period:', billingPeriod);
        if (!planSlug) {
            alert('Erreur: Slug du plan manquant');
            return;
        }
        navigate(`/checkout?plan=${planSlug}&period=${billingPeriod}`);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#000212] flex items-center justify-center text-white">
                Chargement des plans...
            </div>
        );
    }

    // Utiliser uniquement les plans mensuels comme base
    const monthlyPlans = plans.filter(p => p.period === 'monthly');

    // Calculer le prix selon la période sélectionnée
    const getDisplayPrice = (monthlyPrice: number) => {
        if (billingPeriod === 'yearly') {
            // Prix annuel avec 20% de réduction
            const yearlyPrice = monthlyPrice * 12 * 0.8; // 20% off
            return yearlyPrice;
        }
        return monthlyPrice;
    };

    const getOriginalYearlyPrice = (monthlyPrice: number) => {
        return monthlyPrice * 12;
    };

    return (
        <div className="min-h-screen bg-[#000212] text-white py-12 px-6">
            {/* Background effects */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-800/20 rounded-full blur-[120px] opacity-30 animate-pulse-slow"></div>
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-indigo-800/20 rounded-full blur-[120px] opacity-30 animate-pulse-slow delay-1000"></div>
            </div>

            <div className="max-w-7xl mx-auto relative z-10">
                {/* Header */}
                <div className="text-center mb-16">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-5xl md:text-6xl font-bold mb-6"
                    >
                        Choisissez votre plan
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-xl text-gray-400 mb-8"
                    >
                        Commencez gratuitement, évoluez selon vos besoins
                    </motion.p>

                    {/* Billing Period Toggle */}
                    <div className="inline-flex items-center gap-4 bg-white/5 border border-white/10 rounded-full p-1">
                        <button
                            onClick={() => setBillingPeriod('monthly')}
                            className={`px-6 py-2 rounded-full transition-all ${billingPeriod === 'monthly'
                                ? 'bg-purple-600 text-white'
                                : 'text-gray-400 hover:text-white'
                                }`}
                        >
                            Mensuel
                        </button>
                        <button
                            onClick={() => setBillingPeriod('yearly')}
                            className={`px-6 py-2 rounded-full transition-all ${billingPeriod === 'yearly'
                                ? 'bg-purple-600 text-white'
                                : 'text-gray-400 hover:text-white'
                                }`}
                        >
                            Annuel
                            <span className="ml-2 text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full">
                                -20%
                            </span>
                        </button>
                    </div>
                </div>

                {/* Plans Grid */}
                <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {monthlyPlans.map((plan, index) => {
                        const displayPrice = getDisplayPrice(plan.price);
                        const originalYearlyPrice = getOriginalYearlyPrice(plan.price);
                        const isYearly = billingPeriod === 'yearly';

                        return (
                            <motion.div
                                key={plan.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className={`relative p-8 rounded-3xl border ${plan.is_popular
                                    ? 'border-purple-500/50 bg-purple-500/5 scale-105'
                                    : 'border-white/10 bg-white/5'
                                    } flex flex-col`}
                            >
                                {plan.is_popular && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-purple-500 text-white text-xs font-bold rounded-full uppercase tracking-wider flex items-center gap-1">
                                        <Sparkles className="w-3 h-3" />
                                        Populaire
                                    </div>
                                )}

                                <div className="mb-6">
                                    <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                                    <p className="text-gray-400 text-sm">{plan.description}</p>
                                </div>

                                <div className="mb-6">
                                    {plan.slug.toLowerCase() === 'enterprise' ? (
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-4xl font-bold">Sur devis</span>
                                            <span className="text-gray-500">/mois</span>
                                        </div>
                                    ) : plan.price === 0 ? (
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-4xl font-bold">Gratuit</span>
                                        </div>
                                    ) : (
                                        <div>
                                            <div className="flex items-baseline gap-2">
                                                <span className="text-4xl font-bold">
                                                    {Math.round(displayPrice).toLocaleString()}
                                                </span>
                                                <span className="text-gray-400">{plan.currency}</span>
                                                <span className="text-gray-500">
                                                    /{isYearly ? 'an' : 'mois'}
                                                </span>
                                            </div>
                                            {isYearly && (
                                                <div className="mt-2 flex items-center gap-2">
                                                    <span className="text-sm text-gray-500 line-through">
                                                        {Math.round(originalYearlyPrice).toLocaleString()} {plan.currency}
                                                    </span>
                                                    <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full font-semibold">
                                                        Économisez {Math.round(originalYearlyPrice - displayPrice).toLocaleString()} {plan.currency}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <ul className="space-y-3 mb-8 flex-1">
                                    {plan.max_employees && (
                                        <li className="flex items-start gap-2">
                                            <Check className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                                            <span className="text-gray-300">
                                                Jusqu'à {plan.max_employees} employés
                                            </span>
                                        </li>
                                    )}
                                    {Object.entries(plan.features).map(([key, value]) =>
                                        value ? (
                                            <li key={key} className="flex items-start gap-2">
                                                <Check className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                                                <span className="text-gray-300 capitalize">
                                                    {key.replace(/_/g, ' ')}
                                                </span>
                                            </li>
                                        ) : null
                                    )}
                                </ul>

                                <button
                                    onClick={() => handleSelectPlan(plan.slug)}
                                    className={`w-full py-4 rounded-xl font-semibold transition-all ${plan.is_popular
                                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-500/25'
                                        : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                                        }`}
                                >
                                    {plan.slug.toLowerCase() === 'enterprise'
                                        ? 'Choisir Enterprise'
                                        : plan.price === 0 ? 'Commencer gratuitement' : 'Choisir ce plan'}
                                </button>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Features Comparison */}
                <div className="mt-20 text-center">
                    <p className="text-gray-400">
                        Tous les plans incluent : Sécurité SSL, Sauvegardes quotidiennes, Support email
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PricingPage;
