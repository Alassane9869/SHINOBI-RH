import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'outline' | 'subtle' | 'danger' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    loading?: boolean;
    icon?: LucideIcon;
    children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
    variant = 'primary',
    size = 'md',
    loading = false,
    icon: Icon,
    children,
    className = '',
    disabled,
    ...props
}) => {
    const sizes = {
        sm: 'px-3 py-2 text-xs',
        md: 'px-5 py-3 text-sm',
        lg: 'px-7 py-4 text-base',
    };

    // Les variants sont gérés par les classes CSS globales
    const variantClass = `btn-${variant}`;

    return (
        <button
            className={`btn ${variantClass} ${sizes[size]} ${className}`}
            disabled={disabled || loading}
            {...props}
        >
            {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
            ) : Icon ? (
                <Icon className="w-4 h-4" />
            ) : null}
            {children}
        </button>
    );
};

export default Button;
