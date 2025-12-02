import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Smartphone } from 'lucide-react';
import billingService from '../../services/billingService';
import toast from 'react-hot-toast';

interface MoovMoneyFormProps {
    planId: number;
    amount: number;
    currency: string;
}

const MoovMoneyForm: React.FC<MoovMoneyFormProps> = ({ planId, amount, currency }) => {
    const navigate = useNavigate();
    const [phoneNumber, setPhoneNumber] = useState('');
    const [loading, setLoading] = useState(false);
    const [paymentStatus, setPaymentStatus] = useState<'idle' | 'pending' | 'success' | 'failed'>('idle');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!phoneNumber || phoneNumber.length < 8) {
            toast.error('Numéro de téléphone invalide');
            return;
        }

        setLoading(true);
        setPaymentStatus('pending');

        try {
            const result = await billingService.createMoovMoneyPayment(planId, amount, phoneNumber);

            toast.success('Paiement initié ! Vérifiez votre téléphone.');

            // Simuler la vérification du statut (en production, utiliser des webhooks)
            setTimeout(() => {
                setPaymentStatus('success');
                toast.success('Paiement confirmé ! 🎉');
                navigate('/subscription?success=true');
            }, 5000);

        } catch (error: any) {
            console.error('Erreur paiement Moov Money:', error);
            setPaymentStatus('failed');
            toast.error(error.response?.data?.detail || 'Erreur de paiement');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label className="block text-sm font-medium mb-2">
                    Numéro Moov Money
                </label>
                <div className="relative">
                    <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="+223 XX XX XX XX"
                        className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                        required
                    />
                </div>
                <p className="text-xs text-gray-400 mt-2">
                    Entrez votre numéro Moov Money Mali
                </p>
            </div>

            {paymentStatus === 'pending' && (
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                        <Loader2 className="w-5 h-5 text-blue-400 animate-spin flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="font-medium text-blue-300">Paiement en cours</p>
                            <p className="text-sm text-gray-400 mt-1">
                                Vérifiez votre téléphone et entrez votre code PIN Moov Money pour confirmer le paiement.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <button
                type="submit"
                disabled={loading || paymentStatus === 'pending'}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-semibold rounded-xl transition-all shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
                {loading ? (
                    <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Traitement en cours...
                    </>
                ) : (
                    `Payer ${amount} ${currency} avec Moov Money`
                )}
            </button>

            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <p className="text-sm text-gray-300 font-medium mb-2">Comment ça marche ?</p>
                <ol className="text-xs text-gray-400 space-y-1 list-decimal list-inside">
                    <li>Entrez votre numéro Moov Money</li>
                    <li>Cliquez sur "Payer"</li>
                    <li>Vous recevrez une notification sur votre téléphone</li>
                    <li>Entrez votre code PIN pour confirmer</li>
                    <li>Votre abonnement sera activé immédiatement</li>
                </ol>
            </div>

            <p className="text-xs text-center text-gray-400">
                En cliquant sur "Payer", vous acceptez nos{' '}
                <a href="/terms" className="text-purple-400 hover:text-purple-300">
                    Conditions d'utilisation
                </a>
            </p>
        </form>
    );
};

export default MoovMoneyForm;
