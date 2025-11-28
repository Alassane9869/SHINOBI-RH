import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    hover?: boolean;
    gradient?: boolean;
    padding?: 'none' | 'sm' | 'md' | 'lg';
}

const Card: React.FC<CardProps> = ({
    children,
    className = '',
    hover = false,
    gradient = false,
    padding = 'md',
}) => {
    const paddingClasses = {
        none: '',
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
    };

    return (
        <div
            className={`card ${hover ? 'card-hover' : ''} ${gradient ? 'card-gradient' : ''} ${paddingClasses[padding]} ${className}`}
        >
            {children}
        </div>
    );
};

export default Card;
