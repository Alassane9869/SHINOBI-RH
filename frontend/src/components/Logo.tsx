import React from 'react';

interface LogoProps {
    className?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    showText?: boolean;
}

const Logo: React.FC<LogoProps> = ({ className = '', size = 'md', showText = true }) => {
    const sizeClasses = {
        sm: 'h-8',
        md: 'h-12',
        lg: 'h-16',
        xl: 'h-20'
    };

    return (
        <div className={`flex items-center gap-3 ${className}`}>
            <img 
                src="/logo.png" 
                alt="SHNOBI GRH" 
                className={`${sizeClasses[size]} w-auto object-contain`}
            />
            {showText && (
                <div className="flex flex-col">
                    <span className="font-bold text-lg bg-gradient-to-r from-gray-900 to-primary-600 dark:from-white dark:to-primary-400 bg-clip-text text-transparent">
                        SHNOBI GRH
                    </span>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">Premium Edition</p>
                </div>
            )}
        </div>
    );
};

export default Logo;
