import axiosClient from './axiosClient';
import { Attendance, AttendanceFormData, AttendanceFilters } from '../types/attendance';

const BASE_URL = '/api/attendance/records/';
const EXPORT_BASE_URL = '/api/attendance/exports/'; // Exports sont à /exports/, pas /records/exports/

export const attendanceService = {
    /**
     * Récupérer toutes les présences
     */
    getAll: async (filters?: AttendanceFilters) => {
        const params = new URLSearchParams();
        if (filters?.search) params.append('search', filters.search);
        if (filters?.date) params.append('date', filters.date);

        const response = await axiosClient.get<any>(`${BASE_URL}`, { params });
        // Gérer la pagination DRF (results) ou le tableau direct
        return response.data.results || response.data;
    },

    /**
     * Créer une nouvelle présence
     */
    create: async (data: AttendanceFormData) => {
        const response = await axiosClient.post<Attendance>(`${BASE_URL}`, data);
        return response.data;
    },

    /**
     * Mettre à jour une présence
     */
    update: async (id: string, data: Partial<AttendanceFormData>) => {
        const response = await axiosClient.patch<Attendance>(`${BASE_URL}${id}/`, data);
        return response.data;
    },

    /**
     * Supprimer une présence
     */
    delete: async (id: string) => {
        await axiosClient.delete(`${BASE_URL}${id}/`);
    },

    /**
     * Justifier une absence (pour les employés)
     */
    justify: async (id: string, notes: string) => {
        const response = await axiosClient.patch<Attendance>(`${BASE_URL}${id}/justify/`, { notes });
        return response.data;
    },

    /**
     * Exporter le rapport quotidien
     */
    exportDaily: async (date: string, format: 'pdf' | 'excel' | 'csv' = 'pdf') => {
        const response = await axiosClient.get(`${EXPORT_BASE_URL}daily/`, {
            params: { date, format },
            responseType: 'blob'
        });
        return response;
    },

    /**
     * Exporter le rapport mensuel
     */
    exportMonthly: async (month: number, year: number, format: 'pdf' | 'excel' = 'pdf') => {
        const response = await axiosClient.get(`${EXPORT_BASE_URL}monthly/`, {
            params: { month, year, format },
            responseType: 'blob'
        });
        return response;
    },

    /**
     * Exporter le rapport hebdomadaire
     */
    exportWeekly: async (date: string, format: 'pdf' | 'excel' = 'pdf') => {
        const response = await axiosClient.get(`${EXPORT_BASE_URL}weekly/`, {
            params: { date, format },
            responseType: 'blob'
        });
        return response;
    },

    /**
     * Exporter le rapport semestriel
     */
    exportSemester: async (year: number, semester: 1 | 2, format: 'pdf' | 'excel' = 'pdf') => {
        const response = await axiosClient.get(`${EXPORT_BASE_URL}semester/`, {
            params: { year, semester, format },
            responseType: 'blob'
        });
        return response;
    },

    /**
     * Exporter le rapport annuel
     */
    exportAnnual: async (year: number, format: 'pdf' | 'excel' = 'pdf') => {
        const response = await axiosClient.get(`${EXPORT_BASE_URL}annual/`, {
            params: { year, format },
            responseType: 'blob'
        });
        return response;
    },

    /**
     * Exporter le rapport individuel
     */
    exportIndividual: async (employeeId: string, startDate: string, endDate: string, format: 'pdf' | 'excel' = 'pdf') => {
        const response = await axiosClient.get(`${EXPORT_BASE_URL}individual/`, {
            params: { employee_id: employeeId, start_date: startDate, end_date: endDate, format },
            responseType: 'blob'
        });
        return response;
    }
};

/**
 * Helper pour télécharger un fichier blob
 */
export const downloadBlob = (response: any, defaultFilename: string) => {
    if (!response || !response.data) {
        console.error('Download failed: No data received');
        return;
    }

    const contentType = response.headers?.['content-type'] || 'application/octet-stream';
    const blob = new Blob([response.data], { type: contentType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;

    // Essayer de récupérer le nom du fichier depuis le header
    const contentDisposition = response.headers?.['content-disposition'];
    let filename = defaultFilename;
    if (contentDisposition) {
        const matches = /filename[^;=\\n]*=((['"]).*?\\2|[^;\\n]*)/.exec(contentDisposition);
        if (matches != null && matches[1]) {
            filename = matches[1].replace(/['"]/g, '');
        }
    }

    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
};
