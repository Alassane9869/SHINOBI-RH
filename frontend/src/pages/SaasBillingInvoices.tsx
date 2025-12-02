import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Download, Mail, FileText, CheckCircle, Clock, XCircle } from 'lucide-react';
import axiosClient from '../api/axiosClient';
import toast from 'react-hot-toast';

interface Invoice {
    id: number;
    invoice_number: string;
    company_name: string;
    amount: number;
    currency: string;
    status: string;
    issue_date: string;
    due_date: string;
    pdf_url: string | null;
}

const SaasBillingInvoices: React.FC = () => {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        loadInvoices();
    }, []);

    const loadInvoices = async () => {
        try {
            const response = await axiosClient.get('/api/billing/saas/invoices/');
            setInvoices(response.data);
        } catch (error) {
            console.error('Erreur chargement factures:', error);
            toast.error('Erreur de chargement');
        } finally {
            setLoading(false);
        }
    };

    const downloadPDF = async (invoiceId: number) => {
        try {
            const response = await axiosClient.get(`/api/billing/invoices/${invoiceId}/download/`, {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `facture_${invoiceId}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            toast.success('Facture téléchargée');
        } catch (error) {
            toast.error('Erreur de téléchargement');
        }
    };

    const resendEmail = async (invoiceId: number) => {
        try {
            await axiosClient.post(`/api/billing/saas/invoices/${invoiceId}/resend/`);
            toast.success('Email renvoyé');
        } catch (error) {
            toast.error('Erreur d\'envoi');
        }
    };

    const getStatusBadge = (status: string) => {
        const styles: Record<string, { bg: string; icon: any }> = {
            paid: { bg: 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400', icon: CheckCircle },
            pending: { bg: 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400', icon: Clock },
            overdue: { bg: 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400', icon: XCircle },
        };
        const config = styles[status] || styles.pending;
        const Icon = config.icon;
        return { className: config.bg, icon: <Icon className="w-4 h-4" /> };
    };

    const filteredInvoices = invoices.filter(inv => {
        const matchesSearch = inv.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            inv.invoice_number.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    if (loading) {
        return <div className="flex items-center justify-center h-96"><div className="text-gray-400">Chargement...</div></div>;
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">📄 Factures</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">Gérez toutes les factures</p>
            </div>

            {/* Filters */}
            <div className="flex gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Rechercher par entreprise ou numéro..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                </div>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                    <option value="all">Tous les statuts</option>
                    <option value="paid">Payée</option>
                    <option value="pending">En attente</option>
                    <option value="overdue">En retard</option>
                </select>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-900">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Numéro</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Entreprise</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Montant</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Statut</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Date émission</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {filteredInvoices.map((invoice) => {
                            const statusConfig = getStatusBadge(invoice.status);
                            return (
                                <tr key={invoice.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                    <td className="px-6 py-4">
                                        <span className="font-mono text-sm font-medium text-gray-900 dark:text-white">
                                            {invoice.invoice_number}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{invoice.company_name}</td>
                                    <td className="px-6 py-4">
                                        <span className="font-bold text-gray-900 dark:text-white">
                                            {invoice.amount.toLocaleString()} {invoice.currency}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit ${statusConfig.className}`}>
                                            {statusConfig.icon}
                                            {invoice.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                                        {new Date(invoice.issue_date).toLocaleDateString('fr-FR')}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => downloadPDF(invoice.id)}
                                                className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm flex items-center gap-1"
                                                title="Télécharger PDF"
                                            >
                                                <Download className="w-4 h-4" /> PDF
                                            </button>
                                            <button
                                                onClick={() => resendEmail(invoice.id)}
                                                className="px-3 py-1 bg-green-600 hover:bg-green-500 text-white rounded-lg text-sm flex items-center gap-1"
                                                title="Renvoyer par email"
                                            >
                                                <Mail className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default SaasBillingInvoices;
