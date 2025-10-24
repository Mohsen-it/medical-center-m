import React, { useEffect } from 'react';
import { clsx } from 'clsx';

const Modal = ({
    isOpen,
    onClose,
    title,
    children,
    size = 'md',
    showCloseButton = true,
    closeOnBackdrop = true,
    className = '',
    ...props
}) => {
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    const sizeClasses = {
        sm: 'max-w-md',
        md: 'max-w-2xl',
        lg: 'max-w-4xl',
        xl: 'max-w-6xl',
        full: 'max-w-full mx-4'
    };

    const handleBackdropClick = (e) => {
        if (closeOnBackdrop && e.target === e.currentTarget) {
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={handleBackdropClick}>
            <div className="modal-container">
                <div className={clsx('modal-content', sizeClasses[size], className)} {...props}>
                    {(title || showCloseButton) && (
                        <div className="modal-header">
                            <div className="flex items-center justify-between">
                                {title && (
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        {title}
                                    </h3>
                                )}
                                {showCloseButton && (
                                    <button
                                        onClick={onClose}
                                        className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                                    >
                                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                    <div className="modal-body">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
};

const ModalHeader = ({ children, className = '', ...props }) => (
    <div className={clsx('modal-header', className)} {...props}>
        {children}
    </div>
);

const ModalBody = ({ children, className = '', ...props }) => (
    <div className={clsx('modal-body', className)} {...props}>
        {children}
    </div>
);

const ModalFooter = ({ children, className = '', ...props }) => (
    <div className={clsx('modal-footer', className)} {...props}>
        {children}
    </div>
);

Modal.Header = ModalHeader;
Modal.Body = ModalBody;
Modal.Footer = ModalFooter;

export default Modal;