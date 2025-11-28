import React, { useCallback } from 'react';
import { useDropzone, Accept } from 'react-dropzone';
import { Upload, X } from 'lucide-react';

interface FileUploaderProps {
    onFileSelect: (file: File | null) => void;
    accept?: Accept;
    maxSize?: number;
    preview?: File | null;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onFileSelect, accept, maxSize = 5242880, preview }) => {
    const onDrop = useCallback(
        (acceptedFiles: File[]) => {
            if (acceptedFiles.length > 0) {
                onFileSelect(acceptedFiles[0]);
            }
        },
        [onFileSelect]
    );

    const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
        onDrop,
        accept,
        maxSize,
        multiple: false,
    });

    return (
        <div className="space-y-4">
            <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${isDragActive
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-gray-300 dark:border-gray-600 hover:border-primary-400'
                    }`}
            >
                <input {...getInputProps()} />
                <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                {isDragActive ? (
                    <p className="text-primary-600 dark:text-primary-400">Déposez le fichier ici...</p>
                ) : (
                    <div>
                        <p className="text-gray-600 dark:text-gray-400">
                            Glissez-déposez un fichier ici, ou cliquez pour sélectionner
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                            Taille max: {(maxSize / 1024 / 1024).toFixed(0)} MB
                        </p>
                    </div>
                )}
            </div>

            {fileRejections.length > 0 && (
                <div className="text-red-600 text-sm">
                    {fileRejections[0].errors[0].message}
                </div>
            )}

            {preview && (
                <div className="relative">
                    {preview.type?.startsWith('image/') ? (
                        <img
                            src={URL.createObjectURL(preview)}
                            alt="Preview"
                            className="max-w-xs rounded-lg"
                        />
                    ) : (
                        <div className="flex items-center space-x-2 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                            <span className="text-sm">{preview.name}</span>
                            <span className="text-xs text-gray-500">
                                ({(preview.size / 1024).toFixed(0)} KB)
                            </span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default FileUploader;
