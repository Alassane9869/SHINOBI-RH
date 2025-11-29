import React, { useState } from 'react';
import { Download, FileText, FileSpreadsheet, FileCode, CheckCircle2, X } from 'lucide-react';

interface ExportModalProps {
    isOpen: boolean;
    onClose: () => void;
    employeeId: string;
    employeeName: string;
}

type ExportFormat = 'pdf' | 'excel' | 'csv';
type ExportType = 'complete' | 'personal' | 'leaves' | 'attendance' | 'payroll';

const ExportModal: React.FC<ExportModalProps> = ({
    isOpen,
    onClose,
    employeeId,
    employeeName,
}) => {
    const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('pdf');
    const [selectedType, setSelectedType] = useState<ExportType>('complete');
    const [isExporting, setIsExporting] = useState(false);
    const [exportSuccess, setExportSuccess] = useState(false);

    const formats = [
        {
            id: 'pdf' as ExportFormat,
            name: 'PDF',
            icon: FileText,
            description: 'Document professionnel',
            color: 'text-red-600',
            bgColor: 'bg-red-50',
            borderColor: 'border-red-200',
        },
        {
            id: 'excel' as ExportFormat,
            name: 'Excel',
            icon: FileSpreadsheet,
            description: 'Tableur avec formules',
            color: 'text-green-600',
            bgColor: 'bg-green-50',
            borderColor: 'border-green-200',
        },
        {
            id: 'csv' as ExportFormat,
            name: 'CSV',
            icon: FileCode,
            description: 'Données brutes',
            color: 'text-blue-600',
            bgColor: 'bg-blue-50',
            borderColor: 'border-blue-200',
        },
    ];

    const exportTypes = [
        {
            id: 'complete' as ExportType,
            name: 'Dossier Complet',
            description: 'Toutes les informations de l\'employé',
            supportedFormats: ['pdf', 'excel'],
        },
        {
            id: 'personal' as ExportType,
            name: 'Fiche Personnelle',
            description: 'Informations personnelles et professionnelles',
            supportedFormats: ['pdf', 'excel'],
        },
        {
            id: 'leaves' as ExportType,
            name: 'Historique Congés',
            description: 'Toutes les demandes de congés',
            supportedFormats: ['pdf', 'excel', 'csv'],
        },
        {
            id: 'attendance' as ExportType,
            name: 'Historique Présence',
            description: 'Pointages et absences',
            supportedFormats: ['pdf', 'excel', 'csv'],
        },
        {
            id: 'payroll' as ExportType,
            name: 'Historique Paie',
            description: 'Bulletins de salaire',
            supportedFormats: ['pdf', 'excel', 'csv'],
        },
    ];

    const handleExport = async () => {
        setIsExporting(true);
        setExportSuccess(false);

        try {
            let endpoint = '';

            switch (selectedType) {
                case 'complete':
                    endpoint = `/api/employees/${employeeId}/export/complete-file/?export_format=${selectedFormat}`;
                    break;
                case 'personal':
                    endpoint = `/api/employees/${employeeId}/export/personal-info/?export_format=${selectedFormat}`;
                    break;
                case 'leaves':
                    endpoint = `/api/employees/${employeeId}/export/leaves-history/?export_format=${selectedFormat}`;
                    break;
                case 'attendance':
                    endpoint = `/api/employees/${employeeId}/export/attendance-history/?export_format=${selectedFormat}`;
                    break;
                case 'payroll':
                    endpoint = `/api/employees/${employeeId}/export/payroll-history/?export_format=${selectedFormat}`;
                    break;
            }

            const response = await fetch(endpoint, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                },
            });

            if (!response.ok) {
                throw new Error('Export failed');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;

            const ext = selectedFormat === 'excel' ? 'xlsx' : selectedFormat;
            a.download = `export_${selectedType}_${employeeName.replace(' ', '_')}.${ext}`;

            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            setExportSuccess(true);
            setTimeout(() => {
                onClose();
                setExportSuccess(false);
            }, 2000);
        } catch (error) {
            console.error('Export error:', error);
            alert('Erreur lors de l\'export. Veuillez réessayer.');
        } finally {
            setIsExporting(false);
        }
    };

    const currentType = exportTypes.find(t => t.id === selectedType);
    const isFormatSupported = currentType?.supportedFormats.includes(selectedFormat);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
                className="fixed inset-0 bg-black bg-opacity-50"
                onClick={onClose}
            />

            <div className="relative bg-white rounded-lg shadow-xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b">
                    <h2 className="text-2xl font-bold">
                        Exporter les données de {employeeName}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="space-y-6 p-6">
                    <div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-3">
                            Type d'export
                        </h3>
                        <div className="grid grid-cols-1 gap-3">
                            {exportTypes.map((type) => (
                                <button
                                    key={type.id}
                                    onClick={() => {
                                        setSelectedType(type.id);
                                        if (!type.supportedFormats.includes(selectedFormat)) {
                                            setSelectedFormat(type.supportedFormats[0] as ExportFormat);
                                        }
                                    }}
                                    className={`p-4 rounded-lg border-2 text-left transition-all ${selectedType === type.id
                                        ? 'border-blue-500 bg-blue-50'
                                        : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                >
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <div className="font-semibold text-gray-900">{type.name}</div>
                                            <div className="text-sm text-gray-600 mt-1">{type.description}</div>
                                            <div className="text-xs text-gray-500 mt-2">
                                                Formats: {type.supportedFormats.map(f => f.toUpperCase()).join(', ')}
                                            </div>
                                        </div>
                                        {selectedType === type.id && (
                                            <CheckCircle2 className="w-5 h-5 text-blue-500 flex-shrink-0" />
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-3">
                            Format de fichier
                        </h3>
                        <div className="grid grid-cols-3 gap-3">
                            {formats.map((format) => {
                                const Icon = format.icon;
                                const isSupported = currentType?.supportedFormats.includes(format.id);
                                const isSelected = selectedFormat === format.id;

                                return (
                                    <button
                                        key={format.id}
                                        onClick={() => isSupported && setSelectedFormat(format.id)}
                                        disabled={!isSupported}
                                        className={`p-4 rounded-lg border-2 transition-all ${!isSupported
                                            ? 'opacity-40 cursor-not-allowed border-gray-200'
                                            : isSelected
                                                ? `${format.borderColor} ${format.bgColor}`
                                                : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                    >
                                        <div className="flex flex-col items-center text-center">
                                            <Icon className={`w-8 h-8 mb-2 ${isSupported ? format.color : 'text-gray-400'}`} />
                                            <div className="font-semibold text-gray-900">{format.name}</div>
                                            <div className="text-xs text-gray-600 mt-1">{format.description}</div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <button
                            onClick={onClose}
                            disabled={isExporting}
                            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                        >
                            Annuler
                        </button>
                        <button
                            onClick={handleExport}
                            disabled={isExporting || !isFormatSupported || exportSuccess}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 min-w-[140px] flex items-center justify-center"
                        >
                            {exportSuccess ? (
                                <>
                                    <CheckCircle2 className="w-4 h-4 mr-2" />
                                    Téléchargé !
                                </>
                            ) : isExporting ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                    Export...
                                </>
                            ) : (
                                <>
                                    <Download className="w-4 h-4 mr-2" />
                                    Télécharger
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExportModal;
