import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosClient from '../api/axiosClient';
import DataTable, { DataTableColumn } from '../components/DataTable';
import ModalForm from '../components/ModalForm';
import ConfirmDialog from '../components/ConfirmDialog';
import { Plus, User as UserIcon, Mail, Lock, Shield } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { User } from '../types';
import { Button, Input, Select } from '../components/ui';

const userSchema = z.object({
    email: z.string().email('Email invalide'),
    first_name: z.string().min(2, 'Prénom requis'),
    last_name: z.string().min(2, 'Nom requis'),
    role: z.enum(['admin', 'rh', 'manager', 'employe']),
    password: z.string().min(8, 'Mot de passe min 8 caractères').optional().or(z.literal('')),
});

type UserFormData = z.infer<typeof userSchema>;

const Users: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const queryClient = useQueryClient();

    const { register, handleSubmit, reset, formState: { errors } } = useForm<UserFormData>({
        resolver: zodResolver(userSchema),
    });

    // Fetch users
    const { data: users, isLoading } = useQuery<User[]>({
        queryKey: ['users'],
        queryFn: async () => {
            const response = await axiosClient.get('/api/users/');
            return response.data.results || response.data;
        },
    });

    // Create/Update user
    const mutation = useMutation({
        mutationFn: async (data: UserFormData) => {
            if (selectedUser) {
                // Remove password if empty during update
                const updateData = { ...data };
                if (!updateData.password) {
                    delete updateData.password;
                }
                return axiosClient.put(`/api/users/${selectedUser.id}/`, updateData);
            }
            return axiosClient.post('/api/users/', data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            toast.success(selectedUser ? 'Utilisateur modifié' : 'Utilisateur créé');
            handleCloseModal();
        },
        onError: (error: any) => {
            const message = error.response?.data?.detail ||
                Object.values(error.response?.data || {}).flat().join(', ') ||
                'Erreur';
            toast.error(message as string);
        }
    });

    // Delete user
    const deleteMutation = useMutation({
        mutationFn: (id: number) => axiosClient.delete(`/api/users/${id}/`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            toast.success('Utilisateur supprimé');
            setIsDeleteDialogOpen(false);
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.detail || 'Erreur lors de la suppression');
        }
    });

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedUser(null);
        reset({
            email: '',
            first_name: '',
            last_name: '',
            role: 'employe',
            password: ''
        });
    };

    const handleEdit = (user: User) => {
        setSelectedUser(user);
        reset({
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
            role: user.role,
            password: '' // Password not loaded for security
        });
        setIsModalOpen(true);
    };

    const handleDelete = (user: User) => {
        setSelectedUser(user);
        setIsDeleteDialogOpen(true);
    };

    const columns: DataTableColumn<User>[] = [
        { key: 'email', label: 'Email' },
        {
            key: 'name',
            label: 'Nom complet',
            render: (row) => `${row.first_name} ${row.last_name}`
        },
        {
            key: 'role',
            label: 'Rôle',
            render: (row) => {
                const roleLabels: Record<string, string> = {
                    'admin': 'Administrateur',
                    'rh': 'RH',
                    'manager': 'Manager',
                    'employe': 'Employé'
                };
                return (
                    <span className={`px-2 py-1 rounded text-xs font-medium ${row.role === 'admin' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' :
                        row.role === 'rh' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
                            row.role === 'manager' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                                'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                        }`}>
                        {roleLabels[row.role] || row.role}
                    </span>
                );
            }
        },
        {
            key: 'has_employee',
            label: 'Profil employé',
            render: (row) => row.has_employee_profile ? '✅ Oui' : '❌ Non'
        },
    ];

    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('');

    // ... existing queries ...

    // Filter users
    const filteredUsers = users?.filter(user => {
        const searchLower = searchTerm.toLowerCase();
        const fullName = `${user.first_name} ${user.last_name}`.toLowerCase();
        const email = user.email.toLowerCase();

        const matchesSearch = fullName.includes(searchLower) || email.includes(searchLower);
        const matchesRole = roleFilter ? user.role === roleFilter : true;

        return matchesSearch && matchesRole;
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="page-title">Utilisateurs</h1>
                    <p className="page-subtitle">Gérez les accès et les rôles des utilisateurs</p>
                </div>
                <Button variant="primary" icon={Plus} onClick={() => { setSelectedUser(null); reset(); setIsModalOpen(true); }}>
                    Nouvel utilisateur
                </Button>
            </div>

            <div className="card space-y-4">
                {/* Filters Toolbar */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                        <Input
                            placeholder="Rechercher un utilisateur..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            icon={<UserIcon className="w-5 h-5" />}
                            className="max-w-md"
                        />
                    </div>
                    <div className="w-full sm:w-48">
                        <select
                            className="input w-full"
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                        >
                            <option value="">Tous les rôles</option>
                            <option value="admin">Administrateur</option>
                            <option value="rh">RH</option>
                            <option value="manager">Manager</option>
                            <option value="employe">Employé</option>
                        </select>
                    </div>
                </div>

                <DataTable
                    columns={columns}
                    data={filteredUsers}
                    isLoading={isLoading}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />
            </div>

            {/* Modal Form */}
            <ModalForm
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title={selectedUser ? 'Modifier utilisateur' : 'Nouvel utilisateur'}
            >
                <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input
                            label="Prénom"
                            {...register('first_name')}
                            icon={<UserIcon className="w-5 h-5" />}
                            error={errors.first_name?.message}
                            placeholder="Ex: Jean"
                            required
                        />
                        <Input
                            label="Nom"
                            {...register('last_name')}
                            icon={<UserIcon className="w-5 h-5" />}
                            error={errors.last_name?.message}
                            placeholder="Ex: Dupont"
                            required
                        />
                        <div className="col-span-1 md:col-span-2">
                            <Input
                                label="Email"
                                type="email"
                                {...register('email')}
                                icon={<Mail className="w-5 h-5" />}
                                error={errors.email?.message}
                                placeholder="Ex: jean.dupont@entreprise.com"
                                required
                            />
                        </div>
                        <div className="col-span-1 md:col-span-2">
                            <Select
                                label="Rôle"
                                {...register('role')}
                                options={[
                                    { value: 'employe', label: 'Employé' },
                                    { value: 'manager', label: 'Manager' },
                                    { value: 'rh', label: 'Ressources Humaines' },
                                    { value: 'admin', label: 'Administrateur' }
                                ]}
                                error={errors.role?.message}
                                required
                            />
                        </div>
                        <div className="col-span-1 md:col-span-2">
                            <Input
                                label={selectedUser ? 'Mot de passe (laisser vide pour ne pas changer)' : 'Mot de passe'}
                                type="password"
                                {...register('password')}
                                icon={<Lock className="w-5 h-5" />}
                                error={errors.password?.message}
                                placeholder="••••••••"
                                required={!selectedUser}
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={handleCloseModal}
                        >
                            Annuler
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            loading={mutation.isPending}
                        >
                            {mutation.isPending ? 'Enregistrement...' : 'Enregistrer'}
                        </Button>
                    </div>
                </form>
            </ModalForm>

            {/* Delete Confirmation */}
            <ConfirmDialog
                isOpen={isDeleteDialogOpen}
                onClose={() => setIsDeleteDialogOpen(false)}
                onConfirm={() => selectedUser?.id && deleteMutation.mutate(selectedUser.id)}
                title="Supprimer l'utilisateur"
                message="Êtes-vous sûr de vouloir supprimer cet utilisateur ?"
            />
        </div>
    );
};

export default Users;
