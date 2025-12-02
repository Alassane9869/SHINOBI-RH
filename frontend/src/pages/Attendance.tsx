import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import {
    Plus, Search, UserCheck, FileDown, Calendar, CalendarRange, CalendarClock, User, Download, FileText, FileSpreadsheet, Loader2, ChevronDown, TrendingUp, BarChart3, Clock, MessageSquare, AlertCircle
} from 'lucide-react';

import { Button, Input, Select } from '../components/ui';
import DataTable, { DataTableColumn } from '../components/DataTable';
import ModalForm from '../components/ModalForm';
import useAuthStore from '../auth/AuthStore';
import { attendanceService, downloadBlob } from '../api/attendance';
import { Attendance as AttendanceType, AttendanceStatus } from '../types/attendance';
import axiosClient from '../api/axiosClient';

// Schema de validation
const attendanceSchema = z.object({
    employee: z.string().min(1, 'Employé requis'),
    date: z.string().min(1, 'Date requise'),
    check_in: z.string().optional(),
    check_out: z.string().optional(),
    status: z.enum(['present', 'absent', 'late', 'excused'] as const),
    notes: z.string().optional()
});

type AttendanceFormValues = z.infer<typeof attendanceSchema>;

const Attendance: React.FC = () => {
    const { user } = useAuthStore();
    const isEmployee = user?.role === 'employe';
    const queryClient = useQueryClient();

    // State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isJustifyModalOpen, setIsJustifyModalOpen] = useState(false);
    const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
    const [selectedAttendance, setSelectedAttendance] = useState<AttendanceType | null>(null);
    const [exportLoading, setExportLoading] = useState(false);

    // Forms
    const { register, handleSubmit, reset, formState: { errors } } = useForm<AttendanceFormValues>({
        resolver: zodResolver(attendanceSchema)
    });

    const { register: registerJustify, handleSubmit: handleSubmitJustify, reset: resetJustify } = useForm<{ notes: string }>();

    // Queries
    const { data: attendances, isLoading } = useQuery({
        queryKey: ['attendances'],
        queryFn: () => attendanceService.getAll()
    });

    const { data: employees } = useQuery({
        queryKey: ['employees-list'],
        queryFn: async () => {
            const response = await axiosClient.get('/api/employees/');
            // Gérer la pagination DRF
            return response.data.results || response.data;
        },
        enabled: !isEmployee
    });

    // Mutations
    const createMutation = useMutation({
        mutationFn: attendanceService.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['attendances'] });
            toast.success('Présence enregistrée');
            setIsModalOpen(false);
            reset();
        },
        onError: (error: any) => {
            console.error("Creation error:", error);
            const data = error.response?.data;
            if (data && typeof data === 'object') {
                const messages = Object.entries(data)
                    .map(([key, value]) => {
                        const val = Array.isArray(value) ? value.join(', ') : value;
                        return `${key}: ${val}`;
                    })
                    .join('\n');
                toast.error(messages || 'Erreur de validation');
            } else {
                toast.error('Erreur de connexion au serveur');
            }
        }
    });

    const justifyMutation = useMutation({
        mutationFn: ({ id, notes }: { id: string; notes: string }) => attendanceService.justify(id, notes),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['attendances'] });
            toast.success('Justification envoyée');
            setIsJustifyModalOpen(false);
            resetJustify();
        },
        onError: (error: any) => toast.error('Erreur lors de la justification')
    });

    // Handlers
    const handleExport = async (type: 'daily' | 'monthly' | 'weekly' | 'semester' | 'annual', format: 'pdf' | 'excel', params?: any) => {
        try {
            setExportLoading(true);
            const today = new Date();
            let response;

            switch (type) {
                case 'daily':
                    const dateStr = today.toISOString().split('T')[0];
                    response = await attendanceService.exportDaily(dateStr, format);
                    break;
                case 'monthly':
                    response = await attendanceService.exportMonthly(today.getMonth() + 1, today.getFullYear(), format);
                    break;
                case 'weekly':
                    const weekDate = today.toISOString().split('T')[0];
                    response = await attendanceService.exportWeekly(weekDate, format);
                    break;
                case 'semester':
                    const currentSemester = today.getMonth() < 6 ? 1 : 2;
                    response = await attendanceService.exportSemester(today.getFullYear(), currentSemester as 1 | 2, format);
                    break;
                case 'annual':
                    response = await attendanceService.exportAnnual(today.getFullYear(), format);
                    break;
            }

            downloadBlob(response, `export_${type}_${format}`);
            toast.success('Export téléchargé');
        } catch (error) {
            console.error(error);
            toast.error('Erreur lors de l\'export');
        } finally {
            setExportLoading(false);
        }
    };

    // Columns
    const columns: DataTableColumn<AttendanceType>[] = [
        {
            key: 'employee',
            label: 'Employé',
            render: (row) => (
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                        {(row.employee_name || 'E').charAt(0)}
                    </div>
                    <div>
                        <div className="font-semibold text-slate-900 dark:text-white">
                            {row.employee_name || 'Employé'}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                            ID: {row.employee.substring(0, 8)}
                        </div>
                    </div>
                </div>
            ),
        },
        {
            key: 'date',
            label: 'Date',
            render: (row) => (
                <div className="flex items-center text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/50 px-3 py-1 rounded-full w-fit text-sm">
                    <Calendar className="w-3.5 h-3.5 mr-2 text-indigo-500" />
                    {new Date(row.date).toLocaleDateString()}
                </div>
            )
        },
        {
            key: 'check_in',
            label: 'Horaires',
            render: (row) => (
                <div className="flex flex-col gap-1.5 text-xs">
                    <span className="flex items-center text-emerald-700 dark:text-emerald-400 font-medium">
                        <Clock className="w-3.5 h-3.5 mr-1.5" />
                        {row.check_in ? row.check_in.slice(0, 5) : '--:--'}
                    </span>
                    <span className="flex items-center text-amber-700 dark:text-amber-400 font-medium">
                        <Clock className="w-3.5 h-3.5 mr-1.5" />
                        {row.check_out ? row.check_out.slice(0, 5) : '--:--'}
                    </span>
                </div>
            )
        },
        {
            key: 'status',
            label: 'Statut',
            render: (row) => {
                const styles = {
                    present: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800',
                    absent: 'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800',
                    late: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800',
                    excused: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800'
                };
                const labels = {
                    present: 'Présent', absent: 'Absent', late: 'Retard', excused: 'Excusé'
                };
                return (
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${styles[row.status]}`}>
                        {labels[row.status]}
                    </span>
                );
            }
        },
        {
            key: 'notes',
            label: 'Justification',
            render: (row) => row.notes ? (
                <div className="group relative">
                    <div className="max-w-[150px] truncate text-xs text-slate-500 cursor-help flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" />
                        {row.notes}
                    </div>
                    <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block w-48 p-2 bg-slate-800 text-white text-xs rounded shadow-lg z-10">
                        {row.notes}
                    </div>
                </div>
            ) : <span className="text-slate-300">-</span>
        },
        {
            key: 'id',
            label: 'Actions',
            render: (row) => (
                <div className="flex gap-2">
                    {!isEmployee && (row.status === 'absent' || row.status === 'late') && !row.notes && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50"
                            onClick={() => {
                                setSelectedAttendance(row);
                                setIsJustifyModalOpen(true);
                            }}
                            title="Justifier"
                        >
                            <MessageSquare className="w-4 h-4" />
                        </Button>
                    )}
                </div>
            )
        }
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="relative rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-700 shadow-xl">
                {/* Background Effects */}
                <div className="absolute inset-0 overflow-hidden rounded-2xl">
                    <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                </div>

                {/* Content */}
                <div className="relative p-8">
                    <div className="relative flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                        <div className="text-white">
                            <h1 className="text-3xl font-bold flex items-center gap-3">
                                <UserCheck className="w-8 h-8 text-indigo-200" />
                                Gestion des Présences
                            </h1>
                            <p className="text-indigo-100 mt-2 max-w-xl text-lg opacity-90">
                                Suivez les temps de travail, gérez les absences et générez vos rapports en un clic.
                            </p>
                        </div>

                        {!isEmployee && (
                            <div className="flex flex-wrap gap-3">
                                {/* Export Dropdown Menu */}
                                <div className="relative">
                                    <button
                                        onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
                                        className="flex items-center gap-2 px-5 py-2.5 bg-white text-indigo-600 hover:bg-indigo-50 rounded-xl font-semibold shadow-lg transition-all duration-200 hover:scale-105 border-2 border-white/50"
                                        disabled={exportLoading}
                                    >
                                        {exportLoading ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                <span>Export en cours...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Download className="w-5 h-5" />
                                                <span>Exporter</span>
                                                <ChevronDown className={`w-4 h-4 transition-transform ${isExportMenuOpen ? 'rotate-180' : ''}`} />
                                            </>
                                        )}
                                    </button>

                                    {/* Export Dropdown Panel */}
                                    {isExportMenuOpen && (
                                        <div className="absolute top-full mt-2 right-0 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                            <div className="p-3">
                                                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                                                    <BarChart3 className="w-4 h-4 text-indigo-600" />
                                                    Rapports de Présence
                                                </h3>

                                                <div className="space-y-1.5">
                                                    {/* Daily Export */}
                                                    <div className="group p-2 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-all">
                                                        <div className="flex items-center gap-2">
                                                            <div className="p-1.5 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                                                                <Calendar className="w-4 h-4" />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Quotidien</h4>
                                                            </div>
                                                            <div className="flex gap-1">
                                                                <button
                                                                    onClick={() => { handleExport('daily', 'pdf'); setIsExportMenuOpen(false); }}
                                                                    className="px-2 py-1 text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-300 rounded flex items-center gap-1 transition-colors"
                                                                    title="Export PDF"
                                                                >
                                                                    <FileText className="w-3 h-3" />
                                                                </button>
                                                                <button
                                                                    onClick={() => { handleExport('daily', 'excel'); setIsExportMenuOpen(false); }}
                                                                    className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-300 rounded flex items-center gap-1 transition-colors"
                                                                    title="Export Excel"
                                                                >
                                                                    <FileSpreadsheet className="w-3 h-3" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Monthly Export */}
                                                    <div className="group p-2 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-950/30 transition-all">
                                                        <div className="flex items-center gap-2">
                                                            <div className="p-1.5 rounded bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
                                                                <CalendarRange className="w-4 h-4" />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Mensuel</h4>
                                                            </div>
                                                            <div className="flex gap-1">
                                                                <button
                                                                    onClick={() => { handleExport('monthly', 'pdf'); setIsExportMenuOpen(false); }}
                                                                    className="px-2 py-1 text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-300 rounded flex items-center gap-1 transition-colors"
                                                                    title="Export PDF"
                                                                >
                                                                    <FileText className="w-3 h-3" />
                                                                </button>
                                                                <button
                                                                    onClick={() => { handleExport('monthly', 'excel'); setIsExportMenuOpen(false); }}
                                                                    className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-300 rounded flex items-center gap-1 transition-colors"
                                                                    title="Export Excel"
                                                                >
                                                                    <FileSpreadsheet className="w-3 h-3" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Weekly Export */}
                                                    <div className="group p-2 rounded-lg hover:bg-teal-50 dark:hover:bg-teal-950/30 transition-all">
                                                        <div className="flex items-center gap-2">
                                                            <div className="p-1.5 rounded bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400">
                                                                <Calendar className="w-4 h-4" />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Hebdomadaire</h4>
                                                            </div>
                                                            <div className="flex gap-1">
                                                                <button
                                                                    onClick={() => { handleExport('weekly', 'pdf'); setIsExportMenuOpen(false); }}
                                                                    className="px-2 py-1 text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-300 rounded flex items-center gap-1 transition-colors"
                                                                    title="Export PDF"
                                                                >
                                                                    <FileText className="w-3 h-3" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Semester Export */}
                                                    <div className="group p-2 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-all">
                                                        <div className="flex items-center gap-2">
                                                            <div className="p-1.5 rounded bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
                                                                <CalendarRange className="w-4 h-4" />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Semestriel</h4>
                                                            </div>
                                                            <div className="flex gap-1">
                                                                <button
                                                                    onClick={() => { handleExport('semester', 'pdf'); setIsExportMenuOpen(false); }}
                                                                    className="px-2 py-1 text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-300 rounded flex items-center gap-1 transition-colors"
                                                                    title="Export PDF"
                                                                >
                                                                    <FileText className="w-3 h-3" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Annual Export */}
                                                    <div className="group p-2 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all">
                                                        <div className="flex items-center gap-2">
                                                            <div className="p-1.5 rounded bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400">
                                                                <BarChart3 className="w-4 h-4" />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Annuel</h4>
                                                            </div>
                                                            <div className="flex gap-1">
                                                                <button
                                                                    onClick={() => { handleExport('annual', 'pdf'); setIsExportMenuOpen(false); }}
                                                                    className="px-2 py-1 text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-300 rounded flex items-center gap-1 transition-colors"
                                                                    title="Export PDF"
                                                                >
                                                                    <FileText className="w-3 h-3" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="px-3 py-2 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700">
                                                <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                                                    💡 D'autres rapports arrivent bientôt
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <Button
                                    className="bg-white text-indigo-600 hover:bg-indigo-50 border-none shadow-lg font-semibold"
                                    icon={Plus}
                                    onClick={() => setIsModalOpen(true)}
                                >
                                    Nouvelle présence
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Table Section */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-lg overflow-hidden">
                <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 flex justify-between items-center">
                    <h3 className="font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Historique des pointages
                    </h3>
                </div>
                <DataTable
                    columns={columns}
                    data={attendances || []}
                    isLoading={isLoading}
                />
            </div>

            {/* Modal Creation */}
            <ModalForm isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Nouvelle Présence">
                <form onSubmit={handleSubmit((data) => createMutation.mutate(data))} className="space-y-5">
                    <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg border border-indigo-100 dark:border-indigo-800 mb-4">
                        <h4 className="text-sm font-semibold text-indigo-800 dark:text-indigo-300 mb-1 flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" />
                            Information
                        </h4>
                        <p className="text-xs text-indigo-600 dark:text-indigo-400">
                            Veuillez remplir les informations avec précision. Les heures doivent être au format HH:MM.
                        </p>
                    </div>

                    <Select
                        label="Employé"
                        {...register('employee')}
                        options={employees?.map((e: any) => ({
                            value: e.id,
                            label: `${e.user.first_name} ${e.user.last_name}`
                        })) || []}
                        error={errors.employee?.message}
                    />

                    <Input
                        type="date"
                        label="Date"
                        {...register('date')}
                        error={errors.date?.message}
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            type="time"
                            label="Heure d'arrivée"
                            {...register('check_in')}
                            error={errors.check_in?.message}
                        />
                        <Input
                            type="time"
                            label="Heure de départ"
                            {...register('check_out')}
                            error={errors.check_out?.message}
                        />
                    </div>

                    <Select
                        label="Statut"
                        {...register('status')}
                        options={[
                            { value: 'present', label: 'Présent' },
                            { value: 'late', label: 'Retard' },
                            { value: 'absent', label: 'Absent' },
                            { value: 'excused', label: 'Excusé' }
                        ]}
                        error={errors.status?.message}
                    />

                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Annuler</Button>
                        <Button type="submit" variant="primary" loading={createMutation.isPending}>Enregistrer</Button>
                    </div>
                </form>
            </ModalForm>

            {/* Modal Justification */}
            <ModalForm isOpen={isJustifyModalOpen} onClose={() => setIsJustifyModalOpen(false)} title="Justifier l'absence">
                <form onSubmit={handleSubmitJustify((data) => {
                    if (selectedAttendance) {
                        justifyMutation.mutate({ id: selectedAttendance.id, notes: data.notes });
                    }
                })} className="space-y-4">
                    <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg border border-amber-100 dark:border-amber-800 mb-4">
                        <h4 className="text-sm font-semibold text-amber-800 dark:text-amber-300 mb-1 flex items-center gap-2">
                            <MessageSquare className="w-4 h-4" />
                            Justification
                        </h4>
                        <p className="text-xs text-amber-600 dark:text-amber-400">
                            Expliquez la raison de l'absence ou du retard. Cette note sera visible par l'administration.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Motif / Justification</label>
                        <textarea
                            {...registerJustify('notes')}
                            className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 p-3 text-sm focus:ring-2 focus:ring-indigo-500 min-h-[100px]"
                            placeholder="Ex: Problème de transport, rendez-vous médical..."
                            required
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="ghost" onClick={() => setIsJustifyModalOpen(false)}>Annuler</Button>
                        <Button type="submit" variant="primary" loading={justifyMutation.isPending}>Envoyer la justification</Button>
                    </div>
                </form>
            </ModalForm>
        </div>
    );
};

export default Attendance;
