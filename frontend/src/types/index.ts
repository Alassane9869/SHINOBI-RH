// Types globaux pour l'application
export interface User {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    role: 'owner' | 'admin' | 'rh' | 'manager' | 'employe';
    company: number;
    has_employee_profile?: boolean;
}

export interface Employee {
    id: number | string;
    user: User;
    company: number;
    photo?: string;
    address?: string;
    phone?: string;
    position: string;
    department?: string;
    date_hired?: string;
    contract_pdf?: string;
    base_salary: number;
}

export interface Attendance {
    id: number;
    employee: number;
    employee_name?: string;
    date: string;
    time_in?: string;
    time_out?: string;
    status: 'present' | 'absent' | 'late' | 'excused';
}

export interface Leave {
    id: number;
    employee: number;
    employee_name?: string;
    leave_type: 'sick' | 'vacation' | 'unpaid' | 'maternity' | 'other';
    start_date: string;
    end_date: string;
    reason?: string;
    attachment?: string;
    status: 'pending' | 'approved' | 'rejected';
}

export interface Payroll {
    id: number;
    employee: number;
    employee_name?: string;
    month: number;
    year: number;
    basic_salary: number;
    bonus?: number;
    deductions?: number;
    net_salary: number;
    is_paid: boolean;
}

export interface Document {
    id: number;
    document_type: 'contract' | 'receipt' | 'id_card' | 'other';
    employee?: number;
    employee_name?: string;
    file: string;
    description?: string;
    created_at: string;
}

export interface Company {
    id: number;
    name: string;
    email: string;
    phone: string;
    address: string;
    website?: string;
}

export interface DashboardStats {
    total_employees: number;
    pending_leaves: number;
    total_attendances: number;
    total_payrolls: number;
    total_leaves: number;
    total_documents: number;
    payroll_mass: number;
    chart_data: { name: string; value: number }[];
}

// Types pour les formulaires
export interface LoginFormData {
    email: string;
    password: string;
}

export interface RegisterCompanyFormData {
    name: string;
    email: string;
    address: string;
    phone: string;
    website?: string;
    admin_email: string;
    admin_password: string;
    admin_first_name: string;
    admin_last_name: string;
}

export interface UserFormData {
    email: string;
    first_name: string;
    last_name: string;
    role: 'owner' | 'admin' | 'rh' | 'manager' | 'employe';
    password?: string;
}

export interface EmployeeFormData {
    user_id?: number;
    position: string;
    department?: string;
    base_salary?: number;
    address?: string;
    phone?: string;
    date_hired?: string;
    photo?: File;
}

// Types pour les props des composants
export interface DataTableColumn<T> {
    key: keyof T | string;
    label: string;
    render?: (row: T) => React.ReactNode;
}

export interface DataTableProps<T> {
    columns: DataTableColumn<T>[];
    data?: T[];
    isLoading?: boolean;
    onEdit?: (row: T) => void;
    onDelete?: (row: T) => void;
    onView?: (row: T) => void;
}

export interface ModalFormProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

export interface ConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
}

export interface CardStatProps {
    title: string;
    value: number | string;
    icon: React.ComponentType<{ className?: string }>;
    color: 'blue' | 'green' | 'yellow' | 'purple' | 'red';
}

export interface FileUploaderProps {
    onFileSelect: (file: File | null) => void;
    accept?: Record<string, string[]>;
    maxSize?: number;
    preview?: File | null;
}
