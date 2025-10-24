import React from 'react';
import { clsx } from 'clsx';

const Card = React.forwardRef(({
    children,
    className = '',
    header,
    footer,
    hover = true,
    ...props
}, ref) => {
    const classes = clsx(
        'card',
        {
            'hover:shadow-2xl hover:-translate-y-1': hover,
        },
        className
    );

    return (
        <div ref={ref} className={classes} {...props}>
            {header && (
                <div className="card-header">
                    {header}
                </div>
            )}
            <div className="card-body">
                {children}
            </div>
            {footer && (
                <div className="card-footer">
                    {footer}
                </div>
            )}
        </div>
    );
});

const CardHeader = ({ children, className = '', ...props }) => (
    <div className={clsx('card-header', className)} {...props}>
        {children}
    </div>
);

const CardBody = ({ children, className = '', ...props }) => (
    <div className={clsx('card-body', className)} {...props}>
        {children}
    </div>
);

const CardFooter = ({ children, className = '', ...props }) => (
    <div className={clsx('card-footer', className)} {...props}>
        {children}
    </div>
);

Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;

export default Card;