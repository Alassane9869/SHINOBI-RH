import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosClient from '../api/axiosClient';
import DataTable, { DataTableColumn } from '../components/DataTable';
import ModalForm from '../components/ModalForm';
import { Plus, Calendar, Clock, UserCheck } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Attendance as AttendanceType, Employee } from '../types';
import { Button, Input, Select } from '../components/ui';

const attendanceSchema = z.object({
    employee: z.coerce.number().positive('Employé requis'),
    date: z.string().min(1, 'Date requise'),
    time_in: z.string().optional(),
    time_out: z.string().optional(),
    status: z.string().min(1, 'Statut requis'),
});

type AttendanceFormData = z.infer<typeof attendanceSchema>;

const Attendance: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const queryClient = useQueryClient();
    const { register, handleSubmit, reset, formState: { errors } } = useForm<AttendanceFormData>({
        resolver: zodResolver(attendanceSchema),
    });

    const { data: attendances, isLoading } = useQuery<AttendanceType[]>({
        queryKey: ['attendances'],
        queryFn: async () => {
            const response = await axiosClient.get('/api/attendance/');
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
        mutationFn: (data: AttendanceFormData) => axiosClient.post('/api/attendance/', data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['attendances'] });
            toast.success('Présence enregistrée');
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

    const columns: DataTableColumn<AttendanceType>[] = [
        {
            key: 'employee',
            label: 'Employé',
            render: (row) => (
                <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-xs">
                        {(row.employee_name || String(row.employee)).charAt(0)}
                    </div>
                    <span className="font-medium">{row.employee_name || String(row.employee)}</span>
                </div>
            )
        },
        {
            key: 'date',
            label: 'Date',
            render: (row) => (
                <div className="flex items-center text-slate-500 dark:text-gray-400">
                    <Calendar className="w-4 h-4 mr-2" />
                    {row.date}
                </div>
            )
        },
        {
            key: 'time_in',
            label: 'Arrivée',
            render: (row) => row.time_in ? (
                <div className="flex items-center text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-md w-fit text-xs font-medium">
                    <Clock className="w-3 h-3 mr-1.5" />
                    {row.time_in}
                </div>
            ) : '-'
        },
        {
            key: 'time_out',
            label: 'Départ',
            render: (row) => row.time_out ? (
                <div className="flex items-center text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 px-2 py-1 rounded-md w-fit text-xs font-medium">
                    <Clock className="w-3 h-3 mr-1.5" />
                    {row.time_out}
                </div>
            ) : '-'
        },
        {
            key: 'status',
            label: 'Statut',
            render: (row) => {
                const statusConfig: Record<string, { label: string; color: string }> = {
                    'present': { label: 'Présent', color: 'bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-400' },
                    'absent': { label: 'Absent', color: 'bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-400' },
                    'late': { label: 'Retard', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-400' },
                    'excused': { label: 'Excusé', color: 'bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-400' }
                };
                const config = statusConfig[row.status] || { label: row.status, color: 'bg-gray-100 text-gray-800' };

                return (
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${config.color}`}>
                        {config.label}
                    </span>
                );
            }
        },
    ];

    const employeeOptions = employees?.map(emp => ({
        value: String(emp.id),
        label: `${emp.user?.first_name} ${emp.user?.last_name} - ${emp.position}`
    })) || [];

    return (
        <div className="space-y-8">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 dark:border-white/10 pb-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
                        <UserCheck className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                        Présences
                    </h1>
                    <p className="text-slate-500 dark:text-gray-400 mt-1 ml-11">
                        Suivez les arrivées et départs de vos collaborateurs en temps réel.
                    </p>
                </div>
                <Button variant="primary" icon={Plus} onClick={() => setIsModalOpen(true)}>
                    Nouvelle présence
                </Button>
            </div>

            {/* Data Table */}
            <DataTable columns={columns} data={attendances} isLoading={isLoading} />

            {/* Modal */}
            <ModalForm isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Enregistrer présence">
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

                    <Input
                        label="Date"
                        type="date"
                        {...register('date')}
                        icon={<Calendar className="w-5 h-5" />}
                        error={errors.date?.message}
                        required
                    />

                    <div className="grid grid-cols-2 gap-6">
                        <Input
                            label="Heure d'arrivée"
                            type="time"
                            {...register('time_in')}
                            icon={<Clock className="w-5 h-5" />}
                        />
                        <Input
                            label="Heure de départ"
                            type="time"
                            {...register('time_out')}
                            icon={<Clock className="w-5 h-5" />}
                        />
                    </div>

                    <Select
                        label="Statut"
                        {...register('status')}
                        options={[
                            { value: '', label: 'Sélectionner' },
                            { value: 'present', label: 'Présent' },
                            { value: 'absent', label: 'Absent' },
                            { value: 'late', label: 'Retard' },
                            { value: 'excused', label: 'Excusé' }
                        ]}
                        error={errors.status?.message}
                        required
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
                        >
                            {mutation.isPending ? 'Enregistrement...' : 'Enregistrer'}
                        </Button>
                    </div>
                </form>
            </ModalForm>
        </div>
    );
};

export default Attendance;
