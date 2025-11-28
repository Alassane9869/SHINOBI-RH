import React from 'react';

interface BadgeProps {
    children: React.ReactNode;
    variant?: 'success' | 'warning' | 'error' | 'info' | 'neutral';
    className?: string;
    pulse?: boolean;
}

const Badge: React.FC<BadgeProps> = ({
    children,
    variant = 'neutral',
    className = '',
    pulse = false,
}) => {
    const variantClass = `badge-${variant}`;

    return (
        <span className={`badge ${variantClass} ${pulse ? 'animate-pulse-slow' : ''} ${className}`}>
            {children}
        </span>
    );
};

export default Badge;
