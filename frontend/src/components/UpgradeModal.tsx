import React, { useState, useEffect } from 'react';
import { X, Zap, Check, TrendingUp, Shield, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../auth/AuthStore';

const UpgradeModal: React.FC = () => {
    const { user } = useAuthStore();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const [daysLeft, setDaysLeft] = useState(0);

    useEffect(() => {
        const checkTrialStatus = () => {
            const trialEndDate = user?.company?.trial_end_date;
            if (!trialEndDate || user?.company?.subscription_status !== 'trial') return;

            const end = new Date(trialEndDate);
            const now = new Date();
            const diff = end.getTime() - now.getTime();
            const days = Math.floor(diff / (1000 * 60 * 60 * 24));

            setDaysLeft(days);

            // Afficher le modal si moins de 3 jours restants
            if (days <= 3 && days >= 0) {
                // Vérifier si l'utilisateur a déjà fermé le modal aujourd'hui
                const lastDismissed = localStorage.getItem('upgradeModalDismissed');
                const today = new Date().toDateString();

                if (lastDismissed !== today) {
                    setIsOpen(true);
                }
            }
        };

        checkTrialStatus();
        const interval = setInterval(checkTrialStatus, 3600000); // Vérifier toutes les heures

        return () => clearInterval(interval);
    }, [user?.company?.trial_end_date, user?.company?.subscription_status]);

    const handleDismiss = () => {
        localStorage.setItem('upgradeModalDismissed', new Date().toDateString());
        setIsOpen(false);
    };

    const handleUpgrade = () => {
        setIsOpen(false);
        navigate('/pricing');
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={handleDismiss}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                />

                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="relative max-w-2xl w-full bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 rounded-3xl shadow-2xl overflow-hidden border border-purple-500/20"
                >
                    {/* Animated background */}
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-pink-600/10 to-purple-600/10 animate-gradient bg-[length:200%_auto]" />

                    {/* Close button */}
                    <button
                        onClick={handleDismiss}
                        className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    <div className="relative p-8 text-white">
                        {/* Header */}
                        <div className="text-center mb-8">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 mb-4 animate-pulse">
                                <Clock className="w-8 h-8 text-white" />
                            </div>
                            <h2 className="text-3xl font-bold mb-2">
                                Votre essai se termine bientôt !
                            </h2>
                            <p className="text-xl text-purple-200">
                                Plus que <span className="font-bold text-yellow-400">{daysLeft} jour{daysLeft > 1 ? 's' : ''}</span> pour profiter de toutes les fonctionnalités
                            </p>
                        </div>

                        {/* Benefits */}
                        <div className="grid md:grid-cols-2 gap-4 mb-8">
                            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-purple-500/20 rounded-lg">
                                        <TrendingUp className="w-5 h-5 text-purple-400" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold mb-1">Analytics Avancés</h3>
                                        <p className="text-sm text-gray-300">Tableaux de bord personnalisés et rapports détaillés</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-indigo-500/20 rounded-lg">
                                        <Shield className="w-5 h-5 text-indigo-400" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold mb-1">Support Prioritaire</h3>
                                        <p className="text-sm text-gray-300">Assistance dédiée 24/7 par email et chat</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-pink-500/20 rounded-lg">
                                        <Zap className="w-5 h-5 text-pink-400" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold mb-1">API Access</h3>
                                        <p className="text-sm text-gray-300">Intégrations illimitées avec vos outils</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-green-500/20 rounded-lg">
                                        <Check className="w-5 h-5 text-green-400" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold mb-1">Jusqu'à 50 employés</h3>
                                        <p className="text-sm text-gray-300">Gérez votre équipe en croissance</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Special offer */}
                        <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-xl p-4 mb-6">
                            <p className="text-center text-sm">
                                🎉 <span className="font-semibold">Offre spéciale :</span> Passez au plan Pro maintenant et bénéficiez de <span className="font-bold text-yellow-400">20% de réduction</span> sur les 3 premiers mois !
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row gap-3">
                            <button
                                onClick={handleUpgrade}
                                className="flex-1 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-[1.02]"
                            >
                                Passer au Plan Pro
                            </button>
                            <button
                                onClick={handleDismiss}
                                className="sm:w-32 py-4 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl transition-all border border-white/20"
                            >
                                Plus tard
                            </button>
                        </div>

                        <p className="text-center text-xs text-gray-400 mt-4">
                            Sans engagement • Annulation à tout moment
                        </p>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default UpgradeModal;
