import React from 'react';
import { clsx } from 'clsx';

const Button = React.forwardRef(({
    children,
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled = false,
    className = '',
    icon: Icon,
    iconPosition = 'left',
    type = 'button',
    ...props
}, ref) => {
    const baseClasses = 'btn';
    const variantClasses = {
        primary: 'btn-primary',
        secondary: 'btn-secondary',
        success: 'btn-success',
        warning: 'btn-warning',
        danger: 'btn-danger',
        outline: 'btn-outline'
    };
    const sizeClasses = {
        sm: 'btn-sm',
        md: '',
        lg: 'btn-lg'
    };

    const classes = clsx(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        {
            'opacity-50 cursor-not-allowed': disabled || loading,
            'flex items-center': Icon,
        },
        className
    );

    const renderIcon = () => {
        if (!Icon) return null;
        
        return (
            <Icon 
                className={clsx(
                    iconPosition === 'right' ? 'mr-2' : 'ml-2',
                    'h-4 w-4'
                )}
            />
        );
    };

    return (
        <button
            ref={ref}
            type={type}
            disabled={disabled || loading}
            className={classes}
            {...props}
        >
            {loading ? (
                <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {children}
                </>
            ) : (
                <>
                    {iconPosition === 'left' && renderIcon()}
                    {children}
                    {iconPosition === 'right' && renderIcon()}
                </>
            )}
        </button>
    );
});

Button.displayName = 'Button';

export default Button;