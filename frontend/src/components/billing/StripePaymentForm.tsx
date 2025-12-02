import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { Loader2 } from 'lucide-react';
import billingService from '../../services/billingService';
import toast from 'react-hot-toast';
import axiosClient from '../../api/axiosClient';
import useAuthStore from '../../auth/AuthStore';

interface StripePaymentFormProps {
    planId: number;
    amount: number;
    currency: string;
    planSlug: string;
}

const StripePaymentForm: React.FC<StripePaymentFormProps> = ({ planId, amount, currency, planSlug }) => {
    const stripe = useStripe();
    const elements = useElements();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [paymentAttempts, setPaymentAttempts] = useState(0);
    const [isBlocked, setIsBlocked] = useState(false);
    const { loadUser } = useAuthStore();

    const MAX_ATTEMPTS = 5;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        if (isBlocked) {
            toast.error('Nombre maximum de tentatives atteint. Veuillez contacter le support.');
            return;
        }

        setLoading(true);

        try {
            // Créer le PaymentIntent
            const { client_secret } = await billingService.createStripePaymentIntent(planId, amount);

            // Confirmer le paiement
            const { error, paymentIntent } = await stripe.confirmCardPayment(client_secret, {
                payment_method: {
                    card: elements.getElement(CardElement)!,
                }
            });

            if (error) {
                const newAttempts = paymentAttempts + 1;
                setPaymentAttempts(newAttempts);
                const remainingAttempts = MAX_ATTEMPTS - newAttempts;

                if (remainingAttempts > 0) {
                    toast.error(`${error.message || 'Erreur de paiement'}. ${remainingAttempts} tentative(s) restante(s).`);
                } else {
                    toast.error('Nombre maximum de tentatives atteint. Veuillez contacter le support.');
                    setIsBlocked(true);
                }
            } else if (paymentIntent.status === 'succeeded') {
                // Retrieve pending registration data
                const pendingData = localStorage.getItem('pending_registration');
                if (!pendingData) {
                    toast.error('Données d\'inscription manquantes. Veuillez vous réinscrire.');
                    navigate('/register');
                    return;
                }

                const registrationData = JSON.parse(pendingData);

                // Create account with selected plan
                const response = await axiosClient.post('/api/auth/register-company/', {
                    ...registrationData,
                    selected_plan: planSlug
                });

                // Store tokens
                if (response.data.access && response.data.refresh) {
                    localStorage.setItem('access_token', response.data.access);
                    localStorage.setItem('refresh_token', response.data.refresh);
                }

                // Clear pending registration data
                localStorage.removeItem('pending_registration');

                // Refresh user
                await loadUser();

                toast.success('Paiement réussi ! Compte créé avec succès ! 🎉');
                navigate('/dashboard');
            }
        } catch (error: any) {
            console.error('Erreur paiement:', error);
            toast.error(error.response?.data?.detail || 'Erreur de paiement');
        } finally {
            setLoading(false);
        }
    };

    const cardElementOptions = {
        style: {
            base: {
                fontSize: '16px',
                color: '#ffffff',
                '::placeholder': {
                    color: '#9ca3af',
                },
                backgroundColor: 'transparent',
            },
            invalid: {
                color: '#ef4444',
            },
        },
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {isBlocked && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl">
                    <p className="text-sm text-red-400">
                        ⚠️ Nombre maximum de tentatives atteint. Veuillez contacter le support.
                    </p>
                </div>
            )}

            {paymentAttempts > 0 && paymentAttempts < MAX_ATTEMPTS && (
                <div className="p-3 bg-orange-500/10 border border-orange-500/30 rounded-xl">
                    <p className="text-sm text-orange-400">
                        {MAX_ATTEMPTS - paymentAttempts} tentative(s) de paiement restante(s)
                    </p>
                </div>
            )}

            <div>
                <label className="block text-sm font-medium mb-2">Informations de carte</label>
                <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                    <CardElement options={cardElementOptions} />
                </div>
                <p className="text-xs text-gray-400 mt-2">
                    Vos informations de paiement sont sécurisées et cryptées
                </p>
            </div>

            <button
                type="submit"
                disabled={!stripe || loading || isBlocked}
                className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
                {loading ? (
                    <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Traitement en cours...
                    </>
                ) : (
                    `Payer ${amount} ${currency}`
                )}
            </button>

            <p className="text-xs text-center text-gray-400">
                En cliquant sur "Payer", vous acceptez nos{' '}
                <a href="/terms" className="text-purple-400 hover:text-purple-300">
                    Conditions d'utilisation
                </a>
            </p>
        </form>
    );
};

export default StripePaymentForm;
