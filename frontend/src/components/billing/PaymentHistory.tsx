import React, { useEffect, useState } from 'react';
import { Download, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import billingService, { Payment } from '../../services/billingService';
import toast from 'react-hot-toast';

const PaymentHistory: React.FC = () => {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadHistory();
    }, []);

    const loadHistory = async () => {
        try {
            const data = await billingService.getPaymentHistory();
            setPayments(data);
        } catch (error) {
            console.error('Erreur chargement historique:', error);
        } finally {
            setLoading(false);
        }
    };

    const downloadInvoice = async (invoiceId: number) => {
        try {
            const blob = await billingService.downloadInvoice(invoiceId);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `facture-${invoiceId}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            toast.error('Erreur téléchargement facture');
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'completed':
                return <span className="flex items-center gap-1 text-green-400"><CheckCircle className="w-4 h-4" /> Payé</span>;
            case 'failed':
                return <span className="flex items-center gap-1 text-red-400"><XCircle className="w-4 h-4" /> Échoué</span>;
            case 'pending':
                return <span className="flex items-center gap-1 text-yellow-400"><Clock className="w-4 h-4" /> En attente</span>;
            default:
                return <span className="flex items-center gap-1 text-gray-400"><AlertCircle className="w-4 h-4" /> {status}</span>;
        }
    };

    if (loading) return <div className="text-center py-8 text-gray-400">Chargement de l'historique...</div>;

    if (payments.length === 0) {
        return (
            <div className="text-center py-8 bg-white/5 rounded-xl border border-white/10">
                <p className="text-gray-400">Aucun paiement effectué pour le moment.</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="border-b border-white/10 text-gray-400 text-sm">
                        <th className="py-4 px-4">Date</th>
                        <th className="py-4 px-4">Montant</th>
                        <th className="py-4 px-4">Méthode</th>
                        <th className="py-4 px-4">Statut</th>
                        <th className="py-4 px-4 text-right">Facture</th>
                    </tr>
                </thead>
                <tbody>
                    {payments.map((payment) => (
                        <tr key={payment.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                            <td className="py-4 px-4 text-gray-300">
                                {new Date(payment.created_at).toLocaleDateString()}
                            </td>
                            <td className="py-4 px-4 font-medium">
                                {payment.amount} {payment.currency}
                            </td>
                            <td className="py-4 px-4 text-gray-300 capitalize">
                                {payment.payment_method.replace('_', ' ')}
                            </td>
                            <td className="py-4 px-4">
                                {getStatusBadge(payment.status)}
                            </td>
                            <td className="py-4 px-4 text-right">
                                {payment.status === 'completed' && (
                                    <button
                                        onClick={() => downloadInvoice(payment.id)} // Note: Assuming payment ID maps to invoice for simplicity or need to fetch invoice ID
                                        className="text-purple-400 hover:text-purple-300 transition-colors inline-flex items-center gap-1 text-sm"
                                    >
                                        <Download className="w-4 h-4" /> PDF
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default PaymentHistory;
