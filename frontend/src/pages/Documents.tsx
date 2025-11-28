import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosClient from '../api/axiosClient';
import DataTable, { DataTableColumn } from '../components/DataTable';
import ModalForm from '../components/ModalForm';
import { Plus, FileText, User, File } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Document as DocumentType, Employee } from '../types';
import { Button, Input, Select, Textarea, FileUpload } from '../components/ui';

const documentSchema = z.object({
    document_type: z.string().min(1, 'Type requis'),
    employee: z.preprocess(
        (val) => {
            if (val === '' || val === null || val === undefined) return undefined;
            return typeof val === 'string' ? parseInt(val, 10) : val;
        },
        z.number().positive().optional()
    ),
    description: z.string().optional(),
});

type DocumentFormData = z.infer<typeof documentSchema>;

const Documents: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [documentFile, setDocumentFile] = useState<File | null>(null);
    const queryClient = useQueryClient();
    const { register, handleSubmit, reset, formState: { errors } } = useForm<DocumentFormData>({
        resolver: zodResolver(documentSchema),
    });

    const { data: documents, isLoading } = useQuery<DocumentType[]>({
        queryKey: ['documents'],
        queryFn: async () => {
            const response = await axiosClient.get('/api/documents/');
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
        mutationFn: async (data: DocumentFormData) => {
            const formData = new FormData();
            Object.keys(data).forEach(key => {
                const value = data[key as keyof DocumentFormData];
                if (value) formData.append(key, String(value));
            });
            if (documentFile) formData.append('file', documentFile);
            return axiosClient.post('/api/documents/', formData);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['documents'] });
            toast.success('Document uploadé');
            setIsModalOpen(false);
            reset();
            setDocumentFile(null);
        },
        onError: (error: any) => {
            const message = error.response?.data?.detail ||
                Object.values(error.response?.data || {}).flat().join(', ') ||
                'Erreur';
            toast.error(message as string);
        }
    });

    const columns: DataTableColumn<DocumentType>[] = [
        {
            key: 'document_type',
            label: 'Type',
            render: (row) => {
                const typeLabels: Record<string, string> = {
                    'contract': 'Contrat',
                    'receipt': 'Reçu',
                    'id_card': "Carte d'identité",
                    'other': 'Autre'
                };
                return typeLabels[row.document_type] || row.document_type;
            }
        },
        { key: 'employee', label: 'Employé', render: (row) => row.employee_name || '-' },
        { key: 'description', label: 'Description' },
        { key: 'created_at', label: 'Date', render: (row) => new Date(row.created_at).toLocaleDateString() },
    ];

    const employeeOptions = employees?.map(emp => ({
        value: String(emp.id),
        label: `${emp.user?.first_name} ${emp.user?.last_name} - ${emp.position}`
    })) || [];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="page-title">Documents</h1>
                    <p className="page-subtitle">Gérez les documents administratifs</p>
                </div>
                <Button variant="primary" icon={Plus} onClick={() => setIsModalOpen(true)}>
                    Nouveau document
                </Button>
            </div>

            <div className="card">
                <DataTable columns={columns} data={documents} isLoading={isLoading} />
            </div>

            <ModalForm isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Upload document">
                <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-6">
                    <Select
                        label="Type de document"
                        {...register('document_type')}
                        options={[
                            { value: '', label: 'Sélectionner' },
                            { value: 'contract', label: 'Contrat' },
                            { value: 'receipt', label: 'Reçu' },
                            { value: 'id_card', label: "Carte d'identité" },
                            { value: 'other', label: 'Autre' }
                        ]}
                        error={errors.document_type?.message}
                        required
                    />

                    <Select
                        label="Employé (optionnel)"
                        {...register('employee')}
                        options={[
                            { value: '', label: 'Aucun (document général)' },
                            ...employeeOptions
                        ]}
                    />

                    <Textarea
                        label="Description"
                        {...register('description')}
                        placeholder="Description du document..."
                    />

                    <FileUpload
                        label="Fichier"
                        accept="application/pdf,image/*"
                        onChange={setDocumentFile}
                        error={!documentFile && mutation.isPending ? 'Fichier requis' : undefined}
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
                            loading={mutation.isPending}
                            disabled={!documentFile}
                        >
                            {mutation.isPending ? 'Upload...' : 'Upload'}
                        </Button>
                    </div>
                </form>
            </ModalForm>
        </div>
    );
};

export default Documents;
