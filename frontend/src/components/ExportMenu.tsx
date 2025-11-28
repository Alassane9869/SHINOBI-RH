import React, { useState } from 'react';
import { Download, FileText, FileSpreadsheet, FileType } from 'lucide-react';
import axiosClient from '../api/axiosClient';
import toast from 'react-hot-toast';

interface ExportMenuProps {
    module: 'employees' | 'leaves' | 'payroll' | 'attendance';
    className?: string;
}

const ExportMenu: React.FC<ExportMenuProps> = ({ module, className = '' }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isExporting, setIsExporting] = useState(false);

    const handleExport = async (format: 'pdf' | 'excel' | 'csv') => {
        setIsExporting(true);
        setIsOpen(false);

        try {
            const response = await axiosClient.get(`/api/${module}/export/${format}/`, {
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;

            const extension = format === 'excel' ? 'xlsx' : format;
            const filename = `${module}_${new Date().toISOString().split('T')[0]}.${extension}`;
            link.setAttribute('download', filename);

            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            toast.success(`Export ${format.toUpperCase()} réussi`);
        } catch (error) {
            console.error('Export error:', error);
            toast.error('Erreur lors de l\'export');
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className={`relative ${className}`}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                disabled={isExporting}
                className="btn btn-outline flex items-center gap-2"
            >
                <Download className="w-4 h-4" />
                {isExporting ? 'Export en cours...' : 'Exporter'}
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-20 overflow-hidden">
                        <button
                            onClick={() => handleExport('pdf')}
                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
                        >
                            <FileText className="w-4 h-4 text-red-600" />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-200">PDF</span>
                        </button>
                        <button
                            onClick={() => handleExport('excel')}
                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
                        >
                            <FileSpreadsheet className="w-4 h-4 text-green-600" />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Excel</span>
                        </button>
                        <button
                            onClick={() => handleExport('csv')}
                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
                        >
                            <FileType className="w-4 h-4 text-blue-600" />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-200">CSV</span>
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default ExportMenu;
