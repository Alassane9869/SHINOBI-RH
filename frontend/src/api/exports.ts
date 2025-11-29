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
            responseType: 'blob', // Important pour les fichiers
        });

        // Créer un lien de téléchargement
        const blob = new Blob([response.data]);
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;

        // Extraire le nom du fichier depuis les headers si disponible
        const contentDisposition = response.headers['content-disposition'];
        if (contentDisposition) {
            const filenameMatch = contentDisposition.match(/filename="?(.+)"?/i);
            if (filenameMatch && filenameMatch[1]) {
                filename = filenameMatch[1];
            }
        }

        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
        console.error('Export error:', error);
        throw error;
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
    await downloadFile(
        `/employees/export/list-advanced/`,
        `liste_employes.${format === 'excel' ? 'xlsx' : 'csv'}`,
        { format, department }
    );
};

export const exportEmployeeCompleteFile = async (employeeId: string): Promise<void> => {
    await downloadFile(
        `/employees/${employeeId}/export/complete-file/`,
        `dossier_employe_${employeeId}.pdf`
    );
};

export const exportWorkCertificate = async (employeeId: string): Promise<void> => {
    await downloadFile(
        `/employees/${employeeId}/export/work-certificate-advanced/`,
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
        `/employees/${employeeId}/export/transfer-letter-advanced/`,
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
        `/employees/${employeeId}/export/termination-letter-advanced/`,
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
        `/employees/${employeeId}/export/work-contract-advanced/`,
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
        `/attendance/export/daily-advanced/`,
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
        `/attendance/export/monthly-advanced/`,
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
