import React from 'react';
import { clsx } from 'clsx';

const Badge = ({
    children,
    variant = 'primary',
    size = 'md',
    className = '',
    ...props
}) => {
    const variantClasses = {
        primary: 'badge-primary',
        success: 'badge-success',
        warning: 'badge-warning',
        danger: 'badge-danger',
        gray: 'badge-gray'
    };

    const sizeClasses = {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-0.5 text-xs',
        lg: 'px-3 py-1 text-sm'
    };

    const classes = clsx(
        'badge',
        variantClasses[variant],
        sizeClasses[size],
        className
    );

    return (
        <span className={classes} {...props}>
            {children}
        </span>
    );
};

export default Badge;