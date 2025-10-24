import React from 'react';
import { clsx } from 'clsx';
import {
    ExclamationTriangleIcon,
    CheckCircleIcon,
    InformationCircleIcon,
    XMarkIcon,
} from '@heroicons/react/24/outline';

const Alert = ({
    variant = 'info',
    children,
    dismissible = false,
    onDismiss,
    className = '',
    ...props
}) => {
    const variantClasses = {
        success: 'alert-success',
        warning: 'alert-warning',
        danger: 'alert-danger',
        info: 'alert-info'
    };

    const icons = {
        success: CheckCircleIcon,
        warning: ExclamationTriangleIcon,
        danger: ExclamationTriangleIcon,
        info: InformationCircleIcon
    };

    const Icon = icons[variant];

    const classes = clsx(
        'alert',
        variantClasses[variant],
        {
            'flex items-center justify-between': dismissible,
        },
        className
    );

    return (
        <div className={classes} {...props}>
            <div className="flex items-center">
                <Icon className="h-5 w-5 ml-2 flex-shrink-0" />
                <div className="flex-1">
                    {children}
                </div>
            </div>
            {dismissible && (
                <button
                    onClick={onDismiss}
                    className="mr-2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                    <XMarkIcon className="h-4 w-4" />
                </button>
            )}
        </div>
    );
};

export default Alert;