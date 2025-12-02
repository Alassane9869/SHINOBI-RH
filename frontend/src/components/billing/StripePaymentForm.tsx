import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { Loader2 } from 'lucide-react';
import billingService from '../../services/billingService';
import toast from 'react-hot-toast';

interface StripePaymentFormProps {
    planId: number;
    amount: number;
    currency: string;
}

const StripePaymentForm: React.FC<StripePaymentFormProps> = ({ planId, amount, currency }) => {
    const stripe = useStripe();
    const elements = useElements();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!stripe || !elements) {
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
                toast.error(error.message || 'Erreur de paiement');
            } else if (paymentIntent.status === 'succeeded') {
                toast.success('Paiement réussi ! 🎉');
                navigate('/subscription?success=true');
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
                disabled={!stripe || loading}
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
