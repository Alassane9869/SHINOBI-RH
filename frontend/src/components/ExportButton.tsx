import React, { useState } from 'react';
import { Download, FileText, FileSpreadsheet, FileCode, Archive, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export type ExportFormat = 'pdf' | 'excel' | 'csv' | 'zip';

interface ExportButtonProps {
    label?: string;
    formats: ExportFormat[];
    onExport: (format: ExportFormat) => Promise<void>;
    icon?: React.ReactNode;
    size?: 'sm' | 'md' | 'lg';
    variant?: 'primary' | 'secondary' | 'outline';
    className?: string;
}

const formatIcons: Record<ExportFormat, React.ReactNode> = {
    pdf: <FileText className="w-4 h-4" />,
    excel: <FileSpreadsheet className="w-4 h-4" />,
    csv: <FileCode className="w-4 h-4" />,
    zip: <Archive className="w-4 h-4" />
};

const formatLabels: Record<ExportFormat, string> = {
    pdf: 'PDF',
    excel: 'Excel',
    csv: 'CSV',
    zip: 'ZIP'
};

const formatColors: Record<ExportFormat, string> = {
    pdf: 'from-red-500 to-red-600',
    excel: 'from-green-500 to-green-600',
    csv: 'from-blue-500 to-blue-600',
    zip: 'from-purple-500 to-purple-600'
};

const ExportButton: React.FC<ExportButtonProps> = ({
    label = 'Exporter',
    formats,
    onExport,
    icon,
    size = 'md',
    variant = 'primary',
    className = ''
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState<ExportFormat | null>(null);

    const sizeClasses = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-base',
        lg: 'px-6 py-3 text-lg'
    };

    const variantClasses = {
        primary: 'bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white shadow-lg shadow-primary-500/30',
        secondary: 'bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white shadow-lg shadow-gray-500/30',
        outline: 'border-2 border-primary-500 text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20'
    };

    const handleExport = async (format: ExportFormat) => {
        setLoading(format);
        try {
            await onExport(format);
        } catch (error) {
            console.error('Export error:', error);
        } finally {
            setLoading(null);
            setIsOpen(false);
        }
    };

    // Si un seul format, bouton direct
    if (formats.length === 1) {
        const format = formats[0];
        return (
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleExport(format)}
                disabled={loading !== null}
                className={`
                    inline-flex items-center gap-2 rounded-xl font-semibold
                    transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
                    ${sizeClasses[size]} ${variantClasses[variant]} ${className}
                `}
            >
                {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                    icon || formatIcons[format]
                )}
                <span>{label} {formatLabels[format]}</span>
            </motion.button>
        );
    }

    // Plusieurs formats : dropdown
    return (
        <div className="relative inline-block">
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className={`
                    inline-flex items-center gap-2 rounded-xl font-semibold
                    transition-all duration-200
                    ${sizeClasses[size]} ${variantClasses[variant]} ${className}
                `}
            >
                {icon || <Download className="w-4 h-4" />}
                <span>{label}</span>
                <svg
                    className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </motion.button>

            {/* Dropdown Menu */}
            {isOpen && (
                <>
                    {/* Overlay */}
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Menu */}
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-2 w-56 rounded-xl bg-white dark:bg-gray-800 shadow-2xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden"
                    >
                        <div className="p-2 space-y-1">
                            {formats.map((format) => (
                                <motion.button
                                    key={format}
                                    whileHover={{ x: 4 }}
                                    onClick={() => handleExport(format)}
                                    disabled={loading !== null}
                                    className={`
                                        w-full flex items-center gap-3 px-4 py-3 rounded-lg
                                        text-left transition-all
                                        hover:bg-gradient-to-r ${formatColors[format]}
                                        hover:text-white
                                        disabled:opacity-50 disabled:cursor-not-allowed
                                        ${loading === format ? 'bg-gray-100 dark:bg-gray-700' : 'text-gray-700 dark:text-gray-300'}
                                    `}
                                >
                                    {loading === format ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <div className={`p-2 rounded-lg bg-gradient-to-br ${formatColors[format]} text-white`}>
                                            {formatIcons[format]}
                                        </div>
                                    )}
                                    <div className="flex-1">
                                        <div className="font-semibold">{formatLabels[format]}</div>
                                        <div className="text-xs opacity-75">
                                            {format === 'pdf' && 'Document portable'}
                                            {format === 'excel' && 'Feuille de calcul'}
                                            {format === 'csv' && 'Données tabulaires'}
                                            {format === 'zip' && 'Archive complète'}
                                        </div>
                                    </div>
                                </motion.button>
                            ))}
                        </div>
                    </motion.div>
                </>
            )}
        </div>
    );
};

export default ExportButton;
