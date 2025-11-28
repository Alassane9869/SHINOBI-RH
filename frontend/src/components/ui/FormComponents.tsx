import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    icon?: React.ReactNode;
    helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, icon, helperText, className = '', ...props }, ref) => {
        return (
            <div className="w-full">
                {label && (
                    <label className="label">
                        {label}
                        {props.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                )}
                <div className="relative group">
                    {icon && (
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors z-10">
                            {icon}
                        </div>
                    )}
                    <input
                        ref={ref}
                        className={`input ${icon ? 'pl-12' : ''} ${error ? 'input-error' : ''} ${className}`}
                        {...props}
                    />
                </div>
                {error && (
                    <p className="text-red-500 text-sm mt-1.5 animate-fade-in-up">
                        {error}
                    </p>
                )}
                {helperText && !error && (
                    <p className="text-gray-500 text-sm mt-1.5">{helperText}</p>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    error?: string;
    options: Array<{ value: string; label: string }>;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
    ({ label, error, options, className = '', ...props }, ref) => {
        return (
            <div className="w-full">
                {label && (
                    <label className="label">
                        {label}
                        {props.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                )}
                <select
                    ref={ref}
                    className={`input ${error ? 'input-error' : ''} ${className}`}
                    {...props}
                >
                    {options.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
                {error && (
                    <p className="text-red-500 text-sm mt-1.5 animate-fade-in-up">
                        {error}
                    </p>
                )}
            </div>
        );
    }
);

Select.displayName = 'Select';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ label, error, className = '', ...props }, ref) => {
        return (
            <div className="w-full">
                {label && (
                    <label className="label">
                        {label}
                        {props.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                )}
                <textarea
                    ref={ref}
                    className={`input min-h-[120px] resize-y ${error ? 'input-error' : ''} ${className}`}
                    {...props}
                />
                {error && (
                    <p className="text-red-500 text-sm mt-1.5 animate-fade-in-up">
                        {error}
                    </p>
                )}
            </div>
        );
    }
);

Textarea.displayName = 'Textarea';

interface FileUploadProps {
    label?: string;
    error?: string;
    accept?: string;
    maxSize?: number;
    onChange?: (file: File | null) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({
    label,
    error,
    accept,
    maxSize = 5,
    onChange,
}) => {
    const [fileName, setFileName] = React.useState<string>('');
    const [isDragging, setIsDragging] = React.useState(false);
    const inputRef = React.useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFileName(file.name);
            onChange?.(file);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) {
            setFileName(file.name);
            onChange?.(file);
        }
    };

    const handleClick = () => {
        inputRef.current?.click();
    };

    return (
        <div className="w-full">
            {label && (
                <label className="label">
                    {label}
                </label>
            )}
            <div
                onClick={handleClick}
                onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer group ${isDragging
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-950 scale-105'
                        : error
                            ? 'border-red-300 dark:border-red-700'
                            : 'border-gray-300 dark:border-gray-600 hover:border-primary-400 dark:hover:border-primary-500 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
            >
                <input
                    ref={inputRef}
                    type="file"
                    accept={accept}
                    onChange={handleFileChange}
                    className="hidden"
                />
                <div className="flex flex-col items-center gap-3">
                    <div className={`w-16 h-16 bg-gradient-to-br from-primary-500 to-cyan-500 rounded-xl flex items-center justify-center transition-transform ${isDragging ? 'scale-110' : 'group-hover:scale-110'}`}>
                        <svg
                            className="w-8 h-8 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                            />
                        </svg>
                    </div>
                    <div>
                        <p className="text-gray-700 dark:text-gray-300 font-medium">
                            {fileName || 'Glissez-déposez un fichier ici, ou cliquez pour sélectionner'}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">Taille max: {maxSize} MB</p>
                    </div>
                </div>
            </div>
            {error && (
                <p className="text-red-500 text-sm mt-1.5 animate-fade-in-up">
                    {error}
                </p>
            )}
        </div>
    );
};
