import React from 'react';
import { TrendingUp, TrendingDown, LucideIcon } from 'lucide-react';

interface CardStatProps {
    title: string;
    value: number | string;
    icon: LucideIcon;
    trend?: 'up' | 'down';
    trendValue?: string;
    color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
}

const CardStat: React.FC<CardStatProps> = ({ title, value, icon: Icon, trend, trendValue, color = 'blue' }) => {
    const colorClasses: Record<string, string> = {
        blue: 'bg-blue-500',
        green: 'bg-green-500',
        yellow: 'bg-yellow-500',
        red: 'bg-red-500',
        purple: 'bg-purple-500',
    };

    return (
        <div className="card">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{title}</p>
                    <p className="text-3xl font-bold mt-2">{value}</p>
                    {trend && (
                        <div className="flex items-center mt-2 text-sm">
                            {trend === 'up' ? (
                                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                            ) : (
                                <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                            )}
                            <span className={trend === 'up' ? 'text-green-500' : 'text-red-500'}>
                                {trendValue}
                            </span>
                        </div>
                    )}
                </div>
                <div className={`p-4 rounded-full ${colorClasses[color]}`}>
                    <Icon className="w-8 h-8 text-white" />
                </div>
            </div>
        </div>
    );
};

export default CardStat;
