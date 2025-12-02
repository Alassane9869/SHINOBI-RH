import axiosClient from './axiosClient';

/**
 * Service pour gérer tous les exports de documents
 */

interface ExportParams {
    [key: string]: string | number | boolean | undefined;
}

/**
 * Fonction générique pour télécharger un fichier depuis une URL
 */
const downloadFile = async (url: string, filename: string, params?: ExportParams): Promise<void> => {
    try {
        const response = await axiosClient.get(url, {
            params,
            responseType: 'blob',
        });

        // Créer un blob avec le bon type MIME
        const contentType = response.headers['content-type'] || 'application/octet-stream';
        const blob = new Blob([response.data], { type: contentType });
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;

        // Extraire le nom du fichier depuis les headers si disponible
        const contentDisposition = response.headers['content-disposition'];
        let finalFilename = filename;

        if (contentDisposition) {
            // Essayer plusieurs patterns pour extraire le filename
            const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
            const matches = filenameRegex.exec(contentDisposition);
            if (matches && matches[1]) {
                finalFilename = matches[1].replace(/['"]/g, '');
            }
        }

        // S'assurer que le filename a la bonne extension basée sur le content-type
        if (!finalFilename.includes('.')) {
            if (contentType.includes('pdf')) {
                finalFilename += '.pdf';
            } else if (contentType.includes('excel') || contentType.includes('spreadsheet')) {
                finalFilename += '.xlsx';
            } else if (contentType.includes('csv')) {
                finalFilename += '.csv';
            }
        }

        link.setAttribute('download', finalFilename);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(downloadUrl);
    } catch (error: any) {
        console.error('Export error:', error);
        const errorMessage = error.response?.data?.detail || error.message || 'Erreur lors du téléchargement';
        throw new Error(errorMessage);
    }
};

// ============= PAYROLL EXPORTS =============

export const exportPayslipAdvanced = async (payrollId: string): Promise<void> => {
    await downloadFile(
        `/payroll/${payrollId}/export/payslip-advanced/`,
        `fiche_paie_${payrollId}.pdf`
    );
};

export const exportPayrollJournal = async (month: number, year: number, format: 'pdf' | 'excel' = 'pdf'): Promise<void> => {
    await downloadFile(
        `/payroll/export/journal-advanced/`,
        `journal_paie_${month}_${year}.${format === 'excel' ? 'xlsx' : 'pdf'}`,
        { month, year, format }
    );
};

export const exportBulkPayslips = async (month: number, year: number): Promise<void> => {
    await downloadFile(
        `/payroll/export/bulk-payslips/`,
        `fiches_paie_${month}_${year}.zip`,
        { month, year }
    );
};

export const exportSalaryCertificate = async (payrollId: string, period: 'monthly' | 'annual' = 'monthly'): Promise<void> => {
    await downloadFile(
        `/payroll/${payrollId}/export/salary-certificate/`,
        `certificat_salaire_${payrollId}.pdf`,
        { period }
    );
};

export const exportCNSSCertificate = async (payrollId: string): Promise<void> => {
    await downloadFile(
        `/payroll/${payrollId}/export/cnss-certificate/`,
        `certificat_cnss_${payrollId}.pdf`
    );
};

// ============= EMPLOYEE EXPORTS =============

export const exportEmployeesList = async (format: 'excel' | 'csv' = 'excel', department?: string): Promise<void> => {
    const endpoint = format === 'excel' ? '/api/employees/export/excel/' : '/api/employees/export/csv/';
    await downloadFile(
        endpoint,
        `liste_employes.${format === 'excel' ? 'xlsx' : 'csv'}`,
        { department }
    );
};

export const exportEmployeeCompleteFile = async (employeeId: string): Promise<void> => {
    await downloadFile(
        `/api/employees/${employeeId}/export/complete-file/`,
        `dossier_employe_${employeeId}.pdf`
    );
};

export const exportWorkCertificate = async (employeeId: string): Promise<void> => {
    await downloadFile(
        `/api/employees/${employeeId}/export/work-certificate-advanced/`,
        `attestation_travail_${employeeId}.pdf`
    );
};

export const exportTransferLetter = async (
    employeeId: string,
    params: {
        new_position: string;
        new_department: string;
        effective_date: string;
        new_salary?: number;
        new_location?: string;
    }
): Promise<void> => {
    await downloadFile(
        `/api/employees/${employeeId}/export/transfer-letter-advanced/`,
        `lettre_mutation_${employeeId}.pdf`,
        params
    );
};

export const exportTerminationLetter = async (
    employeeId: string,
    params: {
        end_date: string;
        termination_type: 'resignation' | 'dismissal' | 'end_of_contract' | 'mutual_agreement';
        notice_period?: number;
        severance_pay?: number;
    }
): Promise<void> => {
    await downloadFile(
        `/api/employees/${employeeId}/export/termination-letter-advanced/`,
        `lettre_fin_contrat_${employeeId}.pdf`,
        params
    );
};

export const exportWorkContract = async (
    employeeId: string,
    params: {
        contract_type: 'CDI' | 'CDD' | 'STAGE';
        start_date: string;
        end_date?: string;
        salary?: number;
        probation_period?: number;
    }
): Promise<void> => {
    await downloadFile(
        `/api/employees/${employeeId}/export/work-contract-advanced/`,
        `contrat_travail_${employeeId}.pdf`,
        params
    );
};

// ============= ATTENDANCE EXPORTS =============

export const exportDailyAttendance = async (
    date: string,
    format: 'pdf' | 'excel' | 'csv' = 'pdf'
): Promise<void> => {
    await downloadFile(
        `/api/attendance/export/daily-advanced/`,
        `presence_quotidienne_${date}.${format === 'excel' ? 'xlsx' : format === 'csv' ? 'csv' : 'pdf'}`,
        { date, format }
    );
};

export const exportMonthlyAttendance = async (
    month: number,
    year: number,
    format: 'pdf' | 'excel' = 'pdf'
): Promise<void> => {
    await downloadFile(
        `/api/attendance/export/monthly-advanced/`,
        `presence_mensuelle_${month}_${year}.${format === 'excel' ? 'xlsx' : 'pdf'}`,
        { month, year, format }
    );
};

// ============= HELPER FUNCTIONS =============

/**
 * Obtient la date actuelle au format YYYY-MM-DD
 */
export const getTodayDate = (): string => {
    return new Date().toISOString().split('T')[0];
};

/**
 * Obtient le mois et l'année actuels
 */
export const getCurrentMonthYear = (): { month: number; year: number } => {
    const now = new Date();
    return {
        month: now.getMonth() + 1,
        year: now.getFullYear()
    };
};

export default {
    // Payroll
    exportPayslipAdvanced,
    exportPayrollJournal,
    exportBulkPayslips,
    exportSalaryCertificate,
    exportCNSSCertificate,

    // Employees
    exportEmployeesList,
    exportEmployeeCompleteFile,
    exportWorkCertificate,
    exportTransferLetter,
    exportTerminationLetter,
    exportWorkContract,

    // Attendance
    exportDailyAttendance,
    exportMonthlyAttendance,

    // Helpers
    getTodayDate,
    getCurrentMonthYear
};
