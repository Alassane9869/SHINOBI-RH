import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosClient from '../api/axiosClient';
import ModalForm from '../components/ModalForm';
import ConfirmDialog from '../components/ConfirmDialog';
import ExportButton from '../components/ExportButton';
import ExportModal from '../components/ExportModal';
import exportService from '../api/exports';
import {
    Plus, User as UserIcon, Briefcase, Building2, DollarSign, MapPin, Phone, Calendar, FileText,
    ChevronRight, ChevronLeft, Check, Camera, AlertCircle, Download, FileCheck,
    FileSignature, ArrowRightLeft, FileX, BarChart3, MoreVertical, Search, Filter,
    LayoutGrid, List, ArrowUpDown, RefreshCw, Users, TrendingUp, Clock, Edit, Trash2, Eye, Lock, Unlock
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import Button from '../components/ui/Button';
import { Input } from '../components/ui/FormComponents';

// Types
interface User {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    role: string;
}

interface Employee {
    id?: number;
    user_id: number;
    user?: User;
    position: string;
    department: string;
    date_hired: string;
    base_salary: string;
    address: string;
    phone: string;
    photo?: string;
    status?: 'active' | 'on_leave' | 'terminated';
}

// Schema
const employeeSchema = z.object({
    user_id: z.string().min(1, 'Utilisateur requis'),
    position: z.string().min(2, 'Poste requis'),
    department: z.string().min(2, 'Département requis'),
    base_salary: z.preprocess((val) => Number(val), z.number().min(0, 'Salaire invalide')),
    address: z.string().min(5, 'Adresse requise'),
    phone: z.string().min(8, 'Téléphone requis'),
    date_hired: z.string().min(1, 'Date d\'embauche requise'),
});

type EmployeeFormData = z.infer<typeof employeeSchema>;

const EmployeeActionMenu = ({ employee }: { employee: any }) => {
    const [isOpen, setIsOpen] = React.useState(false);

    const downloadDocument = async (type: string) => {
        const id = String(employee.id!);
        try {
            switch (type) {
                case 'sheet': await exportService.exportEmployeeCompleteFile(id); break;
                case 'contract': await exportService.exportWorkContract(id, { contract_type: 'CDI', start_date: employee.date_hired, salary: Number(employee.base_salary) }); break;
                case 'certificate': await exportService.exportWorkCertificate(id); break;
                case 'transfer': await exportService.exportTransferLetter(id, { new_position: employee.position, new_department: employee.department, effective_date: new Date().toISOString().split('T')[0] }); break;
                case 'end-contract': await exportService.exportTerminationLetter(id, { end_date: new Date().toISOString().split('T')[0], termination_type: 'end_of_contract' }); break;
            }
            toast.success('Document téléchargé');
            setIsOpen(false);
        } catch (error: any) {
            toast.error('Erreur lors du téléchargement');
        }
    };

    // Close dropdown when clicking outside
    React.useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (!target.closest('.employee-menu-container')) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('click', handleClickOutside);
            return () => document.removeEventListener('click', handleClickOutside);
        }
    }, [isOpen]);

    return (
        <div className="relative employee-menu-container">
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen(!isOpen);
                }}
                className="p-2.5 rounded-xl bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/40 text-green-600 dark:text-green-400 transition-all duration-200 hover:scale-110 shadow-sm"
                aria-label="Documents"
            >
                <FileText size={18} />
            </button>

            {isOpen && (
                <div className="absolute right-0 top-full mt-2 z-50 p-1.5 shadow-xl bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg rounded-xl w-52 border border-gray-200/50 dark:border-gray-700/50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <button
                        onClick={() => downloadDocument('sheet')}
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg cursor-pointer transition-colors"
                    >
                        <FileText size={16} className="text-blue-500" />
                        <span className="font-medium">Fiche complète</span>
                    </button>

                    <button
                        onClick={() => downloadDocument('contract')}
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg cursor-pointer transition-colors"
                    >
                        <FileSignature size={16} className="text-green-500" />
                        <span className="font-medium">Contrat de travail</span>
                    </button>

                    <button
                        onClick={() => downloadDocument('certificate')}
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg cursor-pointer transition-colors"
                    >
                        <FileCheck size={16} className="text-purple-500" />
                        <span className="font-medium">Attestation</span>
                    </button>

                    <div className="my-1 border-t border-gray-200 dark:border-gray-700"></div>

                    <button
                        onClick={() => downloadDocument('transfer')}
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg cursor-pointer transition-colors"
                    >
                        <ArrowRightLeft size={16} className="text-orange-500" />
                        <span className="font-medium">Lettre de mutation</span>
                    </button>

                    <button
                        onClick={() => downloadDocument('end-contract')}
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg cursor-pointer transition-colors"
                    >
                        <FileX size={16} className="text-red-500" />
                        <span className="font-medium">Fin de contrat</span>
                    </button>
                </div>
            )}
        </div>
    );
};

const Employees = () => {
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
    const [currentStep, setCurrentStep] = useState(1);
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [departmentFilter, setDepartmentFilter] = useState('all');
    const [sortBy, setSortBy] = useState<'name' | 'salary' | 'date'>('name');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null);
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const [employeeToExport, setEmployeeToExport] = useState<Employee | null>(null);

    const { register, handleSubmit, formState: { errors }, reset, setValue, trigger } = useForm<EmployeeFormData>({
        resolver: zodResolver(employeeSchema),
    });

    // Queries
    const { data: employees, isLoading } = useQuery({
        queryKey: ['employees'],
        queryFn: async () => {
            const { data } = await axiosClient.get('/api/employees/');
            // Handle both paginated and non-paginated responses
            return (Array.isArray(data) ? data : data.results || []) as Employee[];
        }
    });

    const { data: availableUsers } = useQuery({
        queryKey: ['available-users'],
        queryFn: async () => {
            const { data } = await axiosClient.get('/api/auth/users/without-employee/');
            return data as User[];
        }
    });

    // Mutations
    const mutation = useMutation({
        mutationFn: async (formData: EmployeeFormData) => {
            // If there's a photo, use FormData, otherwise use JSON
            if (photoFile) {
                const payload = new FormData();

                // Don't send user_id when updating (can't change user association)
                Object.entries(formData).forEach(([key, value]) => {
                    if (selectedEmployee && key === 'user_id') {
                        return; // Skip user_id for updates
                    }
                    payload.append(key, String(value));
                });

                payload.append('photo', photoFile);

                if (selectedEmployee) {
                    return axiosClient.patch(`/api/employees/${selectedEmployee.id}/`, payload, {
                        headers: { 'Content-Type': 'multipart/form-data' }
                    });
                }
                return axiosClient.post('/api/employees/', payload, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                // No photo, use regular JSON
                const payload: any = { ...formData };

                // Don't send user_id when updating
                if (selectedEmployee) {
                    delete payload.user_id;
                }

                if (selectedEmployee) {
                    return axiosClient.patch(`/api/employees/${selectedEmployee.id}/`, payload);
                }
                return axiosClient.post('/api/employees/', payload);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['employees'] });
            queryClient.invalidateQueries({ queryKey: ['available-users'] });
            toast.success(selectedEmployee ? 'Employé modifié' : 'Employé créé');
            handleCloseModal();
        },
        onError: (error: any) => {
            console.error('Error details:', error.response?.data);
            const errorMessage = error.response?.data?.detail
                || error.response?.data?.message
                || Object.values(error.response?.data || {}).flat().join(', ')
                || 'Erreur lors de la mise à jour';
            toast.error(errorMessage);
        }
    });


    const deleteMutation = useMutation({
        mutationFn: (id: number) => axiosClient.delete(`/api/employees/${id}/`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['employees'] });
            queryClient.invalidateQueries({ queryKey: ['available-users'] });
            toast.success('Employé supprimé');
            setIsDeleteDialogOpen(false);
        },
        onError: (error: any) => toast.error('Erreur lors de la suppression')
    });

    // Handlers
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedEmployee(null);
        setPhotoFile(null);
        setCurrentStep(1);
        reset();
    };

    const handleEdit = (employee: Employee) => {
        setSelectedEmployee(employee);
        setValue('user_id', String(employee.user_id)); // Set user_id for validation
        setValue('position', employee.position);
        setValue('department', employee.department);
        setValue('base_salary', Number(employee.base_salary));
        setValue('address', employee.address);
        setValue('phone', employee.phone);
        setValue('date_hired', employee.date_hired);
        setIsModalOpen(true);
    };

    const handleDelete = (employee: Employee) => {
        setEmployeeToDelete(employee);
        setIsDeleteDialogOpen(true);
    };

    // Filtering & Sorting
    const filteredEmployees = employees?.filter(employee => {
        const searchLower = searchTerm.toLowerCase();
        const fullName = `${employee.user?.first_name} ${employee.user?.last_name}`.toLowerCase();
        const matchesSearch = fullName.includes(searchLower) || employee.position.toLowerCase().includes(searchLower);
        const matchesDepartment = departmentFilter === 'all' || employee.department === departmentFilter;
        return matchesSearch && matchesDepartment;
    }).sort((a, b) => {
        let comparison = 0;
        if (sortBy === 'name') comparison = `${a.user?.first_name}`.localeCompare(`${b.user?.first_name}` || '');
        else if (sortBy === 'salary') comparison = Number(a.base_salary) - Number(b.base_salary);
        else comparison = new Date(a.date_hired).getTime() - new Date(b.date_hired).getTime();
        return sortOrder === 'asc' ? comparison : -comparison;
    });

    // Stats
    const totalEmployees = employees?.length || 0;
    const departments = Array.from(new Set(employees?.map(e => e.department).filter(Boolean)));
    const totalPayroll = employees?.reduce((acc, curr) => acc + Number(curr.base_salary), 0) || 0;

    // Wizard Navigation
    const nextStep = async () => {
        let isValid = false;
        if (currentStep === 1) {
            isValid = await trigger(['user_id']);
        } else if (currentStep === 2) {
            isValid = await trigger(['position', 'department', 'base_salary', 'date_hired']);
        }
        if (isValid) setCurrentStep(prev => prev + 1);
    };
    const prevStep = () => setCurrentStep(prev => prev - 1);
    const steps = [
        { id: 1, title: 'Utilisateur', icon: UserIcon },
        { id: 2, title: 'Professionnel', icon: Briefcase },
        { id: 3, title: 'Personnel', icon: MapPin },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-900 dark:from-white dark:via-blue-200 dark:to-purple-200 bg-clip-text text-transparent flex items-center gap-3">
                        <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg">
                            <Users className="text-white w-8 h-8" />
                        </div>
                        Gestion des Employés
                    </h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 ml-1">
                        {totalEmployees} employé(s) • {departments.length} département(s)
                    </p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <ExportButton
                        label="Exporter Liste"
                        formats={['excel', 'csv']}
                        onExport={(format) => exportService.exportEmployeesList(format as 'excel' | 'csv')}
                        variant="outline"
                    />
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl flex items-center gap-2 text-sm font-medium shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                    >
                        <Plus size={18} />
                        <span>Nouvel Employé</span>
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-white/80 to-white/40 dark:from-gray-800/80 dark:to-gray-800/40 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                    <div className="flex items-center gap-4">
                        <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg">
                            <Users className="text-white w-7 h-7" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Total Employés</p>
                            <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mt-1">{totalEmployees}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-gradient-to-br from-white/80 to-white/40 dark:from-gray-800/80 dark:to-gray-800/40 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                    <div className="flex items-center gap-4">
                        <div className="p-4 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-lg">
                            <Building2 className="text-white w-7 h-7" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Départements</p>
                            <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mt-1">{departments.length}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-gradient-to-br from-white/80 to-white/40 dark:from-gray-800/80 dark:to-gray-800/40 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                    <div className="flex items-center gap-4">
                        <div className="p-4 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg">
                            <DollarSign className="text-white w-7 h-7" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Masse Salariale</p>
                            <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mt-1">{totalPayroll.toLocaleString()} FCFA</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Toolbar */}
            <div className="bg-gradient-to-br from-white/80 to-white/40 dark:from-gray-800/80 dark:to-gray-800/40 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 rounded-2xl p-5 shadow-lg">
                <div className="flex flex-col md:flex-row gap-4 justify-between">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Rechercher un employé..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all backdrop-blur-sm"
                        />
                    </div>
                    <div className="flex gap-3 overflow-x-auto pb-1 md:pb-0">
                        <select
                            value={departmentFilter}
                            onChange={(e) => setDepartmentFilter(e.target.value)}
                            className="px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-white text-sm font-medium backdrop-blur-sm focus:ring-2 focus:ring-blue-500 transition-all"
                        >
                            <option value="all">Tous les départements</option>
                            {departments.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                        <div className="flex border border-gray-200 dark:border-gray-600 rounded-xl overflow-hidden backdrop-blur-sm">
                            <button
                                onClick={() => setViewMode('list')}
                                className={`px-4 py-3 ${viewMode === 'list' ? 'bg-blue-500 text-white' : 'bg-white/50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300'} hover:bg-blue-400 hover:text-white transition-all border-r border-gray-200 dark:border-gray-600`}
                            >
                                <List className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`px-4 py-3 ${viewMode === 'grid' ? 'bg-blue-500 text-white' : 'bg-white/50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300'} hover:bg-blue-400 hover:text-white transition-all`}
                            >
                                <LayoutGrid className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Employees List - Modern Glassmorphism Cards */}
            {isLoading ? (
                <div className="flex justify-center py-20">
                    <div className="relative">
                        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 dark:border-blue-800"></div>
                        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600 absolute top-0 left-0"></div>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {filteredEmployees?.map((employee, index) => (
                        <div
                            key={employee.id}
                            className="group relative bg-gradient-to-br from-white/90 to-white/50 dark:from-gray-800/90 dark:to-gray-800/50 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 rounded-2xl p-5 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
                            style={{ animationDelay: `${index * 30}ms` }}
                        >
                            {/* Gradient Border Effect */}
                            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-xl"></div>

                            <div className="flex items-center gap-5">
                                {/* Avatar with status */}
                                <div className="relative flex-shrink-0">
                                    <div className="w-14 h-14 rounded-2xl overflow-hidden shadow-lg ring-4 ring-blue-500/20 group-hover:ring-blue-500/40 transition-all duration-300 group-hover:scale-110">
                                        {employee.photo ? (
                                            <img
                                                src={employee.photo.startsWith('http') ? employee.photo : `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}${employee.photo}`}
                                                alt={`${employee.user?.first_name} ${employee.user?.last_name}`}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    // Si l'image ne charge pas, afficher les initiales
                                                    e.currentTarget.style.display = 'none';
                                                    if (e.currentTarget.nextElementSibling) {
                                                        (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'flex';
                                                    }
                                                }}
                                            />
                                        ) : null}
                                        <div className={`w-full h-full bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg ${employee.photo ? 'hidden' : ''}`}>
                                            {employee.user?.first_name?.[0]}{employee.user?.last_name?.[0]}
                                        </div>
                                    </div>
                                    {/* Status indicator */}
                                    <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-3 border-white dark:border-gray-800 shadow-lg ${employee.status === 'active' ? 'bg-emerald-500' : 'bg-gray-400'
                                        } ${employee.status === 'active' ? 'animate-pulse' : ''}`}></div>
                                </div>

                                {/* Main Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3 mb-1.5">
                                        <h3 className="font-bold text-gray-900 dark:text-white text-lg group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                            {employee.user?.first_name} {employee.user?.last_name}
                                        </h3>
                                        {/* Role Badge */}
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/50">
                                            {employee.user?.role || 'Employé'}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 flex-wrap">
                                        <span className="flex items-center gap-1.5 min-w-[200px]" title={employee.user?.email}>
                                            <div className="p-1 rounded-md bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                            <span className="font-medium truncate max-w-[180px]">{employee.user?.email}</span>
                                        </span>

                                        <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-mono text-[10px] font-semibold text-gray-500 dark:text-gray-400">
                                            <span className="select-none text-gray-400">#</span>
                                            {typeof employee.id === 'string' && (employee.id as string).length > 8
                                                ? (employee.id as string).substring(0, 8).toUpperCase()
                                                : String(employee.id).padStart(5, '0')}
                                        </span>

                                        <div className="flex items-center gap-3 ml-auto mr-4">
                                            <span className="flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-gray-400">
                                                <Briefcase className="w-3.5 h-3.5 text-gray-400" />
                                                {employee.position}
                                            </span>
                                            <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600"></span>
                                            <span className="flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-gray-400">
                                                <Building2 className="w-3.5 h-3.5 text-gray-400" />
                                                {employee.department}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions - Always visible */}
                                <div className="flex items-center gap-2 transition-all duration-200 pl-4 border-l border-gray-100 dark:border-gray-700/50">
                                    <button
                                        onClick={() => handleEdit(employee)}
                                        className="p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-gray-400 hover:text-blue-600 dark:text-gray-500 dark:hover:text-blue-400 transition-colors"
                                        aria-label="Modifier"
                                    >
                                        <Edit size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(employee)}
                                        className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-600 dark:text-gray-500 dark:hover:text-red-400 transition-colors"
                                        aria-label="Supprimer"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                    <EmployeeActionMenu employee={employee} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )
            }

            {/* Modal Form - Wizard Style */}
            <ModalForm
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title={selectedEmployee ? 'Modifier employé' : 'Nouvel employé'}
                size="lg"
            >
                <div className="flex flex-col h-full max-h-[70vh]">
                    {/* Steps Indicator */}
                    <div className="flex items-center justify-between mb-8 px-4">
                        {steps.map((step, index) => {
                            const Icon = step.icon;
                            const isActive = currentStep === step.id;
                            const isCompleted = currentStep > step.id;

                            return (
                                <div key={step.id} className="flex flex-col items-center relative z-10">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${isActive ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg scale-110' :
                                        isCompleted ? 'bg-green-500 text-white' :
                                            'bg-gray-100 dark:bg-gray-700 text-gray-400'
                                        }`}>
                                        {isCompleted ? <Check size={22} /> : <Icon size={22} />}
                                    </div>
                                    <span className={`text-xs mt-2 font-semibold ${isActive ? 'text-blue-600 dark:text-blue-400' :
                                        isCompleted ? 'text-green-500' :
                                            'text-gray-400'
                                        }`}>
                                        {step.title}
                                    </span>
                                    {index < steps.length - 1 && (
                                        <div className={`absolute top-6 left-1/2 w-[calc(100%+2rem)] h-0.5 -z-10 ${isCompleted ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'
                                            }`} />
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Form Content */}
                    <form id="employee-form" onSubmit={handleSubmit((data) => mutation.mutate(data))} className="flex-1 overflow-y-auto px-1">
                        {currentStep === 1 && (
                            <div className="space-y-4 animate-fadeIn">
                                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl flex items-start gap-3 border border-blue-200 dark:border-blue-800">
                                    <AlertCircle className="text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" size={20} />
                                    <p className="text-sm text-blue-800 dark:text-blue-200 font-medium">
                                        Associez ce profil employé à un compte utilisateur existant. L'utilisateur pourra ensuite accéder à son espace employé.
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Utilisateur *</label>
                                    {selectedEmployee ? (
                                        <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600 flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                                                {selectedEmployee.user?.first_name?.[0]}{selectedEmployee.user?.last_name?.[0]}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-900 dark:text-white">
                                                    {selectedEmployee.user?.first_name} {selectedEmployee.user?.last_name}
                                                </p>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">{selectedEmployee.user?.email}</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <select
                                            {...register('user_id')}
                                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition-all"
                                        >
                                            <option value="">Sélectionner un utilisateur</option>
                                            {availableUsers?.map(user => (
                                                <option key={user.id} value={user.id}>
                                                    {user.first_name} {user.last_name} ({user.email})
                                                </option>
                                            ))}
                                        </select>
                                    )}
                                    {errors.user_id && <p className="text-red-500 text-xs mt-1 font-medium">{errors.user_id.message}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Photo de profil</label>
                                    <div className="flex items-start gap-6">
                                        <div className="relative group flex-shrink-0">
                                            <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center overflow-hidden border-2 border-gray-200 dark:border-gray-600 shadow-lg">
                                                {photoFile ? (
                                                    <img src={URL.createObjectURL(photoFile)} alt="Preview" className="w-full h-full object-cover" />
                                                ) : selectedEmployee?.photo ? (
                                                    <img src={selectedEmployee.photo} alt="Current" className="w-full h-full object-cover" />
                                                ) : (
                                                    <UserIcon className="w-12 h-12 text-gray-400" />
                                                )}
                                            </div>
                                            <label className="absolute -bottom-2 -right-2 p-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full cursor-pointer hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:scale-110">
                                                <Camera size={18} />
                                                <input type="file" className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && setPhotoFile(e.target.files[0])} />
                                            </label>
                                        </div>
                                        <div className="flex flex-col justify-center gap-1">
                                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Formats acceptés</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">JPG, PNG ou GIF</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Taille max: 2MB</p>
                                            {photoFile && (
                                                <p className="text-xs text-green-600 dark:text-green-400 font-medium mt-1">✓ Photo sélectionnée</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {currentStep === 2 && (
                            <div className="space-y-4 animate-fadeIn">
                                <div className="grid grid-cols-2 gap-4">
                                    <Input label="Poste *" {...register('position')} error={errors.position?.message} placeholder="Ex: Développeur Fullstack" icon={<Briefcase size={18} />} />
                                    <Input label="Département *" {...register('department')} error={errors.department?.message} placeholder="Ex: IT / R&D" icon={<Building2 size={18} />} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <Input label="Salaire de base *" type="number" {...register('base_salary')} error={errors.base_salary?.message} placeholder="0.00" icon={<DollarSign size={18} />} />
                                    <Input label="Date d'embauche *" type="date" {...register('date_hired')} error={errors.date_hired?.message} icon={<Calendar size={18} />} />
                                </div>
                            </div>
                        )}

                        {currentStep === 3 && (
                            <div className="space-y-4 animate-fadeIn">
                                <Input label="Adresse *" {...register('address')} error={errors.address?.message} placeholder="Adresse complète" icon={<MapPin size={18} />} />
                                <Input label="Téléphone *" {...register('phone')} error={errors.phone?.message} placeholder="+33 6 12 34 56 78" icon={<Phone size={18} />} />
                            </div>
                        )}
                    </form>

                    {/* Footer Actions */}
                    <div className="flex justify-between mt-8 pt-4 border-t border-gray-100 dark:border-gray-700">
                        {currentStep > 1 ? (
                            <Button variant="outline" onClick={prevStep} icon={ChevronLeft}>Précédent</Button>
                        ) : (
                            <div />
                        )}

                        {currentStep < 3 ? (
                            <Button variant="primary" onClick={nextStep} icon={ChevronRight} iconPosition="right">Suivant</Button>
                        ) : (
                            <Button variant="primary" onClick={handleSubmit((data) => mutation.mutate(data))} loading={mutation.isPending} icon={Check}>
                                {selectedEmployee ? 'Mettre à jour' : 'Créer l\'employé'}
                            </Button>
                        )}
                    </div>
                </div>
            </ModalForm>

            <ConfirmDialog
                isOpen={isDeleteDialogOpen}
                onClose={() => setIsDeleteDialogOpen(false)}
                onConfirm={() => employeeToDelete && deleteMutation.mutate(employeeToDelete.id!)}
                title="Supprimer l'employé"
                message={`Êtes-vous sûr de vouloir supprimer ${employeeToDelete?.user?.first_name} ${employeeToDelete?.user?.last_name} ?`}
                confirmText="Supprimer"
                cancelText="Annuler"
            />

            <ExportModal
                isOpen={isExportModalOpen}
                onClose={() => setIsExportModalOpen(false)}
                employeeId={String(employeeToExport?.id || 0)}
                employeeName={`${employeeToExport?.user?.first_name} ${employeeToExport?.user?.last_name}`}
            />
        </div >
    );
};

export default Employees;
