import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosClient from '../api/axiosClient';
import DataTable, { DataTableColumn } from '../components/DataTable';
import ModalForm from '../components/ModalForm';
import ConfirmDialog from '../components/ConfirmDialog';
import ExportButton from '../components/ExportButton';
import exportService from '../api/exports';
import { Plus, User as UserIcon, Briefcase, Building2, DollarSign, MapPin, Phone, Calendar, FileText } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Employee, User } from '../types';
import { Button, Input, Select, FileUpload } from '../components/ui';

const employeeSchema = z.object({
    user_id: z.string().min(1, "Utilisateur requis"),
    position: z.string().min(2, 'Poste requis'),
    department: z.string().optional().or(z.literal('')),
    base_salary: z.preprocess(
        (val) => {
            if (val === '' || val === null || val === undefined) return undefined;
            return typeof val === 'string' ? parseFloat(val) : val;
        },
        z.number().optional()
    ),
    address: z.string().optional().or(z.literal('')),
    phone: z.string().optional().or(z.literal('')),
    date_hired: z.string().optional().or(z.literal('')),
});

type EmployeeFormData = z.infer<typeof employeeSchema>;

const Employees: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const queryClient = useQueryClient();

    const { register, handleSubmit, reset, formState: { errors } } = useForm<EmployeeFormData>({
        resolver: zodResolver(employeeSchema),
    });

    // Fetch employees
    const { data: employees, isLoading } = useQuery<Employee[]>({
        queryKey: ['employees'],
        queryFn: async () => {
            const response = await axiosClient.get('/api/employees/');
            return response.data.results || response.data;
        },
    });

    // Fetch available users
    const { data: availableUsers } = useQuery<User[]>({
        queryKey: ['available-users'],
        queryFn: async () => {
            const response = await axiosClient.get('/api/auth/users/without-employee/');
            return response.data;
        },
        enabled: isModalOpen && !selectedEmployee,
    });

    // Create/Update employee
    const mutation = useMutation({
        mutationFn: async (data: EmployeeFormData) => {
            const dataToSend = selectedEmployee
                ? { ...data, user_id: undefined }
                : data;

            // If there's a photo, use FormData
            if (photoFile) {
                const formData = new FormData();
                Object.keys(dataToSend).forEach(key => {
                    const value = dataToSend[key as keyof typeof dataToSend];
                    if (value !== undefined && value !== null && value !== '') {
                        formData.append(key, String(value));
                    }
                });
                formData.append('photo', photoFile);

                if (selectedEmployee) {
                    return axiosClient.put(`/api/employees/${selectedEmployee.id}/`, formData);
                }
                return axiosClient.post('/api/employees/', formData);
            }

            // Otherwise, send as JSON
            if (selectedEmployee) {
                return axiosClient.put(`/api/employees/${selectedEmployee.id}/`, dataToSend);
            }
            return axiosClient.post('/api/employees/', dataToSend);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['employees'] });
            queryClient.invalidateQueries({ queryKey: ['available-users'] });
            toast.success(selectedEmployee ? 'Employé modifié' : 'Employé créé');
            handleCloseModal();
        },
        onError: (error: any) => {
            const message = error.response?.data?.detail ||
                Object.values(error.response?.data || {}).flat().join(', ') ||
                'Erreur';
            toast.error(message as string);
        }
    });

    // Delete employee
    const deleteMutation = useMutation({
        mutationFn: (id: number) => axiosClient.delete(`/api/employees/${id}/`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['employees'] });
            queryClient.invalidateQueries({ queryKey: ['available-users'] });
            toast.success('Employé supprimé');
            setIsDeleteDialogOpen(false);
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.detail || 'Erreur lors de la suppression');
        }
    });

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedEmployee(null);
        setPhotoFile(null);
        reset({
            user_id: '',
            position: '',
            department: '',
            base_salary: undefined,
            address: '',
            phone: '',
            date_hired: ''
        });
    };

    const handleEdit = (employee: Employee) => {
        setSelectedEmployee(employee);
        reset({
            user_id: String(employee.user.id),
            position: employee.position,
            department: employee.department || '',
            base_salary: employee.base_salary ? Number(employee.base_salary) : undefined,
            address: employee.address || '',
            phone: employee.phone || '',
            date_hired: employee.date_hired || ''
        });
        setIsModalOpen(true);
    };

    const handleDelete = (employee: Employee) => {
        setSelectedEmployee(employee);
        setIsDeleteDialogOpen(true);
    };

    const downloadDocument = async (employee: Employee, type: 'sheet' | 'contract' | 'certificate' | 'transfer' | 'end-contract') => {
        try {
            const id = String(employee.id);
            switch (type) {
                case 'sheet':
                    await exportService.exportEmployeeCompleteFile(id);
                    break;
                case 'contract':
                    await exportService.exportWorkContract(id, {
                        contract_type: 'CDI',
                        start_date: employee.date_hired || new Date().toISOString().split('T')[0],
                        salary: employee.base_salary ? Number(employee.base_salary) : undefined
                    });
                    break;
                case 'certificate':
                    await exportService.exportWorkCertificate(id);
                    break;
                case 'transfer':
                    await exportService.exportTransferLetter(id, {
                        new_position: employee.position,
                        new_department: employee.department || '',
                        effective_date: new Date().toISOString().split('T')[0]
                    });
                    break;
                case 'end-contract':
                    await exportService.exportTerminationLetter(id, {
                        end_date: new Date().toISOString().split('T')[0],
                        termination_type: 'end_of_contract'
                    });
                    break;
            }
            toast.success('Document téléchargé');
        } catch (error: any) {
            console.error('Download error:', error);
            toast.error(error.message || 'Erreur lors du téléchargement');
        }
    };

    const columns: DataTableColumn<Employee>[] = [
        { key: 'user', label: 'Nom', render: (row) => `${row.user?.first_name} ${row.user?.last_name}` },
        { key: 'position', label: 'Poste' },
        { key: 'department', label: 'Département' },
        { key: 'date_hired', label: 'Date d\'embauche' },
        { key: 'base_salary', label: 'Salaire', render: (row) => row.base_salary ? `${row.base_salary} €` : '-' },
    ];

    const userOptions = availableUsers?.map(user => ({
        value: String(user.id),
        label: `${user.first_name} ${user.last_name} (${user.email}) - ${user.role}`
    })) || [];

    const [searchTerm, setSearchTerm] = useState('');
    const [departmentFilter, setDepartmentFilter] = useState('');

    // Filter employees
    const filteredEmployees = employees?.filter(employee => {
        const searchLower = searchTerm.toLowerCase();
        const fullName = `${employee.user?.first_name} ${employee.user?.last_name}`.toLowerCase();
        const position = employee.position.toLowerCase();
        const department = employee.department?.toLowerCase() || '';

        const matchesSearch = fullName.includes(searchLower) ||
            position.includes(searchLower) ||
            department.includes(searchLower);

        const matchesDepartment = departmentFilter ? department === departmentFilter.toLowerCase() : true;

        return matchesSearch && matchesDepartment;
    });

    // Get unique departments for filter
    const departments = Array.from(new Set(employees?.map(e => e.department).filter(Boolean))) as string[];

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="page-title">Employés</h1>
                    <p className="page-subtitle">Gérez vos employés et leurs informations</p>
                </div>
                <div className="flex gap-3">
                    <ExportButton
                        label="Liste des employés"
                        formats={['excel', 'csv']}
                        onExport={(format) => exportService.exportEmployeesList(format as 'excel' | 'csv', departmentFilter || undefined)}
                        variant="outline"
                    />
                    <Button variant="primary" icon={Plus} onClick={() => setIsModalOpen(true)}>
                        Nouvel employé
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
                            value={departmentFilter}
                            onChange={(e) => setDepartmentFilter(e.target.value)}
                        >
                            <option value="">Tous les départements</option>
                            {departments.map(dept => (
                                <option key={dept} value={dept}>{dept}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <DataTable
                    columns={columns}
                    data={filteredEmployees}
                    isLoading={isLoading}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onView={(row) => {
                        if (row.id) downloadDocument(row, 'sheet');
                    }}
                    customActions={(row: Employee) => (
                        <div className="dropdown dropdown-end">
                            <div tabIndex={0} role="button" className="btn btn-ghost btn-xs">
                                <FileText className="w-4 h-4" />
                            </div>
                            <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
                                <li><a onClick={() => row.id && downloadDocument(row, 'sheet')}>Fiche Employé</a></li>
                                <li><a onClick={() => row.id && downloadDocument(row, 'contract')}>Contrat</a></li>
                                <li><a onClick={() => row.id && downloadDocument(row, 'certificate')}>Attestation</a></li>
                                <li><a onClick={() => row.id && downloadDocument(row, 'transfer')}>Lettre Mutation</a></li>
                                <li><a onClick={() => row.id && downloadDocument(row, 'end-contract')}>Fin Contrat</a></li>
                            </ul>
                        </div>
                    )}
                />
            </div>

            {/* Modal Form */}
            <ModalForm
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title={selectedEmployee ? 'Modifier employé' : 'Nouvel employé'}
                size="lg"
            >
                <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-6">
                    {/* User Selection */}
                    {!selectedEmployee && (
                        <Select
                            label="Utilisateur"
                            {...register('user_id')}
                            options={[
                                { value: '', label: 'Sélectionner un utilisateur' },
                                ...userOptions
                            ]}
                            error={errors.user_id?.message}
                            required
                        />
                    )}

                    {/* Grid Layout for Form Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input
                            label="Poste"
                            {...register('position')}
                            icon={<Briefcase className="w-5 h-5" />}
                            error={errors.position?.message}
                            placeholder="Ex: Développeur Full Stack"
                            required
                        />

                        <Input
                            label="Département"
                            {...register('department')}
                            icon={<Building2 className="w-5 h-5" />}
                            placeholder="Ex: IT"
                        />

                        <Input
                            label="Salaire de base"
                            type="number"
                            step="0.01"
                            {...register('base_salary')}
                            icon={<DollarSign className="w-5 h-5" />}
                            placeholder="Ex: 50000"
                        />

                        <Input
                            label="Date d'embauche"
                            type="date"
                            {...register('date_hired')}
                            icon={<Calendar className="w-5 h-5" />}
                        />

                        <Input
                            label="Téléphone"
                            {...register('phone')}
                            icon={<Phone className="w-5 h-5" />}
                            placeholder="Ex: +33 6 12 34 56 78"
                        />

                        <Input
                            label="Adresse"
                            {...register('address')}
                            icon={<MapPin className="w-5 h-5" />}
                            placeholder="Ex: 123 Rue de Paris"
                        />
                    </div>

                    {/* Photo Upload */}
                    <FileUpload
                        label="Photo de profil"
                        accept="image/*"
                        onChange={(file) => setPhotoFile(file)}
                        maxSize={5}
                    />

                    {/* Form Actions */}
                    <div className="flex justify-end gap-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleCloseModal}
                        >
                            Annuler
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            loading={mutation.isPending}
                        >
                            {selectedEmployee ? 'Enregistrer' : 'Créer'}
                        </Button>
                    </div>
                </form>
            </ModalForm>

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                isOpen={isDeleteDialogOpen}
                onClose={() => setIsDeleteDialogOpen(false)}
                onConfirm={() => selectedEmployee?.id && deleteMutation.mutate(selectedEmployee.id)}
                title="Supprimer l'employé"
                message={`Êtes-vous sûr de vouloir supprimer ${selectedEmployee?.user?.first_name} ${selectedEmployee?.user?.last_name} ?`}
                confirmText="Supprimer"
            />
        </div>
    );
};

export default Employees;
