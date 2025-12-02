export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';

export interface Attendance {
    id: string;
    employee: string; // ID
    employee_name?: string;
    date: string;
    check_in: string | null;
    check_out: string | null;
    status: AttendanceStatus;
    notes: string | null;
    created_at: string;
    updated_at: string;
}

export interface AttendanceStats {
    total_present: number;
    total_late: number;
    total_absent: number;
    total_excused: number;
    present_rate: number;
    late_rate: number;
    absent_rate: number;
}

// Form Data pour création/modification
export interface AttendanceFormData {
    employee: string;
    date: string;
    check_in?: string;
    check_out?: string;
    status: AttendanceStatus;
    notes?: string;
}

export interface AttendanceFilters {
    search?: string;
    date?: string;
    month?: number;
    year?: number;
}
