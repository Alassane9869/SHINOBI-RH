import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosClient from '../api/axiosClient';
import DataTable, { DataTableColumn } from '../components/DataTable';
import ModalForm from '../components/ModalForm';
import ExportMenu from '../components/ExportMenu';
import ConfirmDialog from '../components/ConfirmDialog';
import { Plus, Check, X, Calendar, FileText, AlertCircle, User as UserIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import useAuthStore from '../auth/AuthStore';
import { Leave } from '../types';
import { Button, Input, Select, Textarea, FileUpload } from '../components/ui';

const leaveSchema = z.object({
    leave_type: z.string().min(1, 'Type requis'),
    start_date: z.string().min(1, 'Date de début requise'),
    end_date: z.string().min(1, 'Date de fin requise'),
    reason: z.string().optional(),
}).refine((data) => {
    const start = new Date(data.start_date);
    const end = new Date(data.end_date);
    return end >= start;
}, {
    message: "La date de fin doit être après ou égale à la date de début",
    path: ["end_date"],
});

type LeaveFormData = z.infer<typeof leaveSchema>;

const Leaves: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
    const queryClient = useQueryClient();
    const { register, handleSubmit, reset, formState: { errors } } = useForm<LeaveFormData>({
        resolver: zodResolver(leaveSchema),
    });
    const { user } = useAuthStore();

    const { data: leaves, isLoading } = useQuery<Leave[]>({
        queryKey: ['leaves'],
        queryFn: async () => {
            const response = await axiosClient.get('/api/leaves/');
            return response.data.results || response.data;
        },
    });

    const createMutation = useMutation({
        mutationFn: async (data: LeaveFormData) => {
            const formData = new FormData();
            Object.keys(data).forEach(key => formData.append(key, data[key as keyof LeaveFormData] as string));
            if (attachmentFile) formData.append('attachment', attachmentFile);
            return axiosClient.post('/api/leaves/', formData);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['leaves'] });
            toast.success('Demande de congé créée');
            setIsModalOpen(false);
            reset();
            setAttachmentFile(null);
        },
        onError: (error: any) => {
            const message = error.response?.data?.detail ||
                Object.values(error.response?.data || {}).flat().join(', ') ||
                'Erreur';
            toast.error(message as string);
        }
    });

    const approveMutation = useMutation({
        mutationFn: (id: number) => axiosClient.post(`/api/leaves/${id}/approve/`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['leaves'] });
            toast.success('Congé approuvé');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.detail || 'Erreur');
        }
    });

    const rejectMutation = useMutation({
        mutationFn: (id: number) => axiosClient.post(`/api/leaves/${id}/reject/`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['leaves'] });
            toast.success('Congé rejeté');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.detail || 'Erreur');
        }
    });

    const downloadDocument = async (id: number, type: 'request' | 'decision') => {
        try {
            const endpoint = `/api/leaves/${id}/export/${type}/`;
            const response = await axiosClient.get(endpoint, {
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
            link.setAttribute('download', `${type}_conge_${id}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            toast.success('Document téléchargé');
        } catch (error: any) {
            console.error('Download error:', error);
            toast.error(error.message || 'Erreur lors du téléchargement');
        }
    };

    const canApprove = user?.role ? ['admin', 'rh', 'manager'].includes(user.role) : false;

    const columns: DataTableColumn<Leave>[] = [
        { key: 'employee', label: 'Employé', render: (row) => row.employee_name || String(row.employee) },
        {
            key: 'leave_type',
            label: 'Type',
            render: (row) => {
                const typeLabels: Record<string, string> = {
                    'sick': 'Maladie',
                    'vacation': 'Vacances',
                    'unpaid': 'Sans solde',
                    'maternity': 'Maternité',
                    'other': 'Autre'
                };
                return typeLabels[row.leave_type] || row.leave_type;
            }
        },
        { key: 'start_date', label: 'Début' },
        { key: 'end_date', label: 'Fin' },
        {
            key: 'status',
            label: 'Statut',
            render: (row) => {
                const statusLabels: Record<string, string> = {
                    'approved': 'Approuvé',
                    'rejected': 'Rejeté',
                    'pending': 'En attente'
                };
                return (
                    <span className={`px-2 py-1 rounded text-xs font-medium ${row.status === 'approved' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                        row.status === 'rejected' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
                            'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                        }`}>
                        {statusLabels[row.status] || row.status}
                    </span>
                );
            }
        },
        {
            key: 'actions',
            label: 'Actions',
            render: (row) => {
                if (canApprove && row.status === 'pending' && row.id) {
                    return (
                        <div className="flex space-x-2">
                            <button
                                onClick={() => row.id && approveMutation.mutate(row.id)}
                                className="text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 transition-colors"
                                title="Approuver"
                                disabled={approveMutation.isPending}
                            >
                                <Check className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => row.id && rejectMutation.mutate(row.id)}
                                className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                                title="Rejeter"
                                disabled={rejectMutation.isPending}
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    );
                }
                return null;
            }
        }
    ];

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [typeFilter, setTypeFilter] = useState('');

    // ... existing queries ...

    // Filter leaves
    const filteredLeaves = leaves?.filter(leave => {
        const searchLower = searchTerm.toLowerCase();
        const employeeName = (leave.employee_name || String(leave.employee)).toLowerCase();

        const matchesSearch = employeeName.includes(searchLower);
        const matchesStatus = statusFilter ? leave.status === statusFilter : true;
        const matchesType = typeFilter ? leave.leave_type === typeFilter : true;

        return matchesSearch && matchesStatus && matchesType;
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="page-title">Congés</h1>
                    <p className="page-subtitle">Gérez les demandes de congés et absences</p>
                </div>
                <div className="flex gap-3">
                    <ExportMenu module="leaves" />
                    <Button variant="primary" icon={Plus} onClick={() => setIsModalOpen(true)}>
                        Nouvelle demande
                    </Button>
                </div>
            </div>

            <div className="card space-y-4">
                {/* Filters Toolbar */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                        <Input
                            placeholder="Rechercher un employé..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            icon={<UserIcon className="w-5 h-5" />}
                            className="max-w-md"
                        />
                    </div>
                    <div className="w-full sm:w-48">
                        <select
                            className="input w-full"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="">Tous les statuts</option>
                            <option value="pending">En attente</option>
                            <option value="approved">Approuvé</option>
                            <option value="rejected">Rejeté</option>
                        </select>
                    </div>
                    <div className="w-full sm:w-48">
                        <select
                            className="input w-full"
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                        >
                            <option value="">Tous les types</option>
                            <option value="sick">Maladie</option>
                            <option value="vacation">Vacances</option>
                            <option value="unpaid">Sans solde</option>
                            <option value="maternity">Maternité</option>
                            <option value="other">Autre</option>
                        </select>
                    </div>
                </div>

                <DataTable
                    columns={columns}
                    data={filteredLeaves}
                    isLoading={isLoading}
                    customActions={(row: Leave) => (
                        <div className="dropdown dropdown-end">
                            <div tabIndex={0} role="button" className="btn btn-ghost btn-xs">
                                <FileText className="w-4 h-4" />
                            </div>
                            <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
                                <li><a onClick={() => row.id && downloadDocument(row.id, 'request')}>Demande (PDF)</a></li>
                                {row.status !== 'pending' && (
                                    <li><a onClick={() => row.id && downloadDocument(row.id, 'decision')}>Décision (PDF)</a></li>
                                )}
                            </ul>
                        </div>
                    )}
                />
            </div>

            <ModalForm isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Demande de congé">
                <form onSubmit={handleSubmit((data) => createMutation.mutate(data))} className="space-y-6">
                    <Select
                        label="Type de congé"
                        {...register('leave_type')}
                        options={[
                            { value: '', label: 'Sélectionner' },
                            { value: 'sick', label: 'Maladie' },
                            { value: 'vacation', label: 'Vacances' },
                            { value: 'unpaid', label: 'Sans solde' },
                            { value: 'maternity', label: 'Maternité' },
                            { value: 'other', label: 'Autre' }
                        ]}
                        error={errors.leave_type?.message}
                        required
                    />

                    <div className="grid grid-cols-2 gap-6">
                        <Input
                            label="Date de début"
                            type="date"
                            {...register('start_date')}
                            icon={<Calendar className="w-5 h-5" />}
                            error={errors.start_date?.message}
                            required
                        />
                        <Input
                            label="Date de fin"
                            type="date"
                            {...register('end_date')}
                            icon={<Calendar className="w-5 h-5" />}
                            error={errors.end_date?.message}
                            required
                        />
                    </div>

                    <Textarea
                        label="Raison"
                        {...register('reason')}
                        placeholder="Expliquez la raison de votre demande..."
                        error={errors.reason?.message}
                    />

                    <FileUpload
                        label="Pièce justificative"
                        accept="application/pdf,image/*"
                        onChange={setAttachmentFile}
                    />

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
                            loading={createMutation.isPending}
                        >
                            {createMutation.isPending ? 'Envoi...' : 'Soumettre'}
                        </Button>
                    </div>
                </form>
            </ModalForm>
        </div>
    );
};

export default Leaves;
