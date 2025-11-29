import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosClient from '../api/axiosClient';
import DataTable, { DataTableColumn } from '../components/DataTable';
import ModalForm from '../components/ModalForm';
import ExportButton from '../components/ExportButton';
import exportService, { getCurrentMonthYear } from '../api/exports';
import { Plus, DollarSign, Calendar, User, Calculator, FileText, Receipt, Archive } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Payroll as PayrollType, Employee } from '../types';
import { Button, Input, Select } from '../components/ui';

const payrollSchema = z.object({
    employee: z.coerce.number().positive('Employé requis'),
    month: z.coerce.number().min(1).max(12, 'Mois entre 1 et 12'),
    year: z.coerce.number().min(2020, 'Année invalide'),
    base_salary: z.coerce.number().positive('Salaire requis'),
    bonus: z.coerce.number().optional(),
    deductions: z.coerce.number().optional(),
});

type PayrollFormData = z.infer<typeof payrollSchema>;

const Payroll: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const queryClient = useQueryClient();
    const { register, handleSubmit, reset, formState: { errors } } = useForm<PayrollFormData>({
        resolver: zodResolver(payrollSchema),
    });

    const { month: currentMonth, year: currentYear } = getCurrentMonthYear();

    const { data: payrolls, isLoading } = useQuery<PayrollType[]>({
        queryKey: ['payrolls'],
        queryFn: async () => {
            const response = await axiosClient.get('/api/payroll/');
            return response.data.results || response.data;
        },
    });

    const { data: employees } = useQuery<Employee[]>({
        queryKey: ['employees-list'],
        queryFn: async () => {
            const response = await axiosClient.get('/api/employees/');
            return response.data.results || response.data;
        },
    });

    const mutation = useMutation({
        mutationFn: (data: PayrollFormData) => axiosClient.post('/api/payroll/', data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['payrolls'] });
            toast.success('Paie créée');
            setIsModalOpen(false);
            reset();
        },
        onError: (error: any) => {
            const message = error.response?.data?.detail ||
                Object.values(error.response?.data || {}).flat().join(', ') ||
                'Erreur';
            toast.error(message as string);
        }
    });

    const downloadPayslip = async (id: number) => {
        try {
            const response = await axiosClient.get(`/api/payroll/${id}/pdf/`, {
                responseType: 'blob'
            });

            if (response.data.type === 'application/json') {
                const text = await response.data.text();
                const error = JSON.parse(text);
                throw new Error(error.detail || 'Erreur lors du téléchargement');
            }

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;

            let filename = `bulletin_paie_${id}.pdf`;
            const contentDisposition = response.headers['content-disposition'];
            if (contentDisposition) {
                const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
                if (filenameMatch && filenameMatch[1]) {
                    filename = filenameMatch[1];
                }
            }

            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error: any) {
            console.error('Download error:', error);
            toast.error(error.message || 'Erreur lors du téléchargement');
        }
    };

    const downloadReceipt = async (id: number) => {
        try {
            const response = await axiosClient.get(`/api/payroll/${id}/payment_receipt/`, {
                responseType: 'blob'
            });

            if (response.data.type === 'application/json') {
                const text = await response.data.text();
                const error = JSON.parse(text);
                throw new Error(error.detail || 'Erreur lors du téléchargement');
            }

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;

            let filename = `recu_paiement_${id}.pdf`;
            const contentDisposition = response.headers['content-disposition'];
            if (contentDisposition) {
                const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
                if (filenameMatch && filenameMatch[1]) {
                    filename = filenameMatch[1];
                }
            }

            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            toast.success('Reçu téléchargé');
        } catch (error: any) {
            console.error('Download error:', error);
            toast.error(error.message || 'Erreur lors du téléchargement du reçu');
        }
    };

    const columns: DataTableColumn<PayrollType>[] = [
        { key: 'employee', label: 'Employé', render: (row) => row.employee_name || String(row.employee) },
        { key: 'month', label: 'Mois' },
        { key: 'year', label: 'Année' },
        { key: 'base_salary', label: 'Salaire', render: (row) => `${row.base_salary} €` },
        { key: 'net_salary', label: 'Net', render: (row) => `${row.net_salary} €` },
        {
            key: 'is_paid',
            label: 'Payé',
            render: (row) => (
                <span className={`px-2 py-1 rounded text-xs font-medium ${row.is_paid ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                    }`}>
                    {row.is_paid ? 'Oui' : 'Non'}
                </span>
            )
        },
    ];

    const employeeOptions = employees?.map(emp => ({
        value: String(emp.id),
        label: `${emp.user?.first_name} ${emp.user?.last_name} - ${emp.position}`
    })) || [];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="page-title">Paie</h1>
                    <p className="page-subtitle">Gérez les salaires et bulletins de paie</p>
                </div>
                <div className="flex gap-3">
                    <ExportButton
                        label="Journal"
                        formats={['pdf', 'excel']}
                        onExport={(format) => exportService.exportPayrollJournal(currentMonth, currentYear, format as 'pdf' | 'excel')}
                        variant="outline"
                    />
                    <ExportButton
                        label="Bulletins (ZIP)"
                        formats={['zip']}
                        onExport={() => exportService.exportBulkPayslips(currentMonth, currentYear)}
                        variant="outline"
                        icon={<Archive className="w-4 h-4" />}
                    />
                    <Button variant="primary" icon={Plus} onClick={() => setIsModalOpen(true)}>
                        Nouvelle paie
                    </Button>
                </div>
            </div>

            <div className="card">
                <DataTable
                    columns={[
                        ...columns,
                        {
                            key: 'actions',
                            label: 'Documents',
                            render: (row) => (
                                <div className="flex gap-2 justify-end">
                                    <button
                                        onClick={() => row.id && downloadPayslip(row.id)}
                                        className="p-1.5 rounded-lg text-primary-600 hover:bg-primary-50 dark:text-primary-400 dark:hover:bg-primary-500/10 transition-colors"
                                        title="Télécharger bulletin"
                                    >
                                        <FileText className="w-4 h-4" />
                                    </button>
                                    {row.is_paid && (
                                        <button
                                            onClick={() => row.id && downloadReceipt(row.id)}
                                            className="p-1.5 rounded-lg text-green-600 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-500/10 transition-colors"
                                            title="Télécharger reçu"
                                        >
                                            <Receipt className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            )
                        }
                    ]}
                    data={payrolls}
                    isLoading={isLoading}
                />
            </div>

            <ModalForm isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Créer paie">
                <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-6">
                    <Select
                        label="Employé"
                        {...register('employee')}
                        options={[
                            { value: '', label: 'Sélectionner un employé' },
                            ...employeeOptions
                        ]}
                        error={errors.employee?.message}
                        required
                    />

                    <div className="grid grid-cols-2 gap-6">
                        <Input
                            label="Mois"
                            type="number"
                            min="1"
                            max="12"
                            {...register('month')}
                            icon={<Calendar className="w-5 h-5" />}
                            placeholder="1-12"
                            error={errors.month?.message}
                            required
                        />
                        <Input
                            label="Année"
                            type="number"
                            {...register('year')}
                            icon={<Calendar className="w-5 h-5" />}
                            placeholder="2025"
                            error={errors.year?.message}
                            required
                        />
                    </div>

                    <Input
                        label="Salaire de base"
                        type="number"
                        {...register('base_salary')}
                        icon={<DollarSign className="w-5 h-5" />}
                        error={errors.base_salary?.message}
                        required
                    />

                    <div className="grid grid-cols-2 gap-6">
                        <Input
                            label="Bonus"
                            type="number"
                            {...register('bonus')}
                            icon={<DollarSign className="w-5 h-5" />}
                            placeholder="0"
                        />
                        <Input
                            label="Déductions"
                            type="number"
                            {...register('deductions')}
                            icon={<Calculator className="w-5 h-5" />}
                            placeholder="0"
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setIsModalOpen(false)}
                        >
                            Annuler
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            loading={mutation.isPending}
                        >
                            {mutation.isPending ? 'Création...' : 'Créer'}
                        </Button>
                    </div>
                </form>
            </ModalForm>
        </div>
    );
};

export default Payroll;
