import React from 'react';
import { clsx } from 'clsx';
import Card from './Card';

const StatCard = ({
    title,
    value,
    icon: Icon,
    variant = 'primary',
    trend,
    loading = false,
    className = '',
    ...props
}) => {
    const variantClasses = {
        primary: 'from-primary-500 to-primary-600',
        success: 'from-success-500 to-success-600',
        warning: 'from-warning-500 to-warning-600',
        danger: 'from-danger-500 to-danger-600',
        info: 'from-blue-500 to-blue-600'
    };

    const iconClasses = clsx(
        'stat-icon',
        `bg-gradient-to-br ${variantClasses[variant]}`
    );

    const trendClasses = clsx(
        'text-sm font-medium',
        {
            'text-success-600': trend && trend > 0,
            'text-danger-600': trend && trend < 0,
            'text-gray-500': !trend
        }
    );

    if (loading) {
        return (
            <Card className={className} {...props}>
                <div className="animate-pulse">
                    <div className="h-12 w-12 bg-gray-200 rounded-lg mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
            </Card>
        );
    }

    return (
        <Card className={className} {...props}>
            <div className="flex items-center justify-between">
                <div>
                    <p className="stat-label">{title}</p>
                    <p className="stat-value">{value}</p>
                    {trend !== undefined && (
                        <p className={trendClasses}>
                            {trend > 0 && '+'}
                            {trend}%
                        </p>
                    )}
                </div>
                {Icon && (
                    <div className={iconClasses}>
                        <Icon className="h-6 w-6" />
                    </div>
                )}
            </div>
        </Card>
    );
};

export default StatCard;