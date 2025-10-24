import React, { useEffect } from 'react';
import { CheckCircleIcon, ExclamationTriangleIcon, XCircleIcon, InformationCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';

export default function NotificationToast({ 
    type = 'info', 
    message, 
    title, 
    duration = 5000, 
    onClose,
    show = true 
}) {
    useEffect(() => {
        if (show && duration > 0) {
            const timer = setTimeout(() => {
                onClose();
            }, duration);

            return () => clearTimeout(timer);
        }
    }, [show, duration, onClose]);

    if (!show) return null;

    const icons = {
        success: <CheckCircleIcon className="h-6 w-6 text-green-500" />,
        error: <XCircleIcon className="h-6 w-6 text-red-500" />,
        warning: <ExclamationTriangleIcon className="h-6 w-6 text-yellow-500" />,
        info: <InformationCircleIcon className="h-6 w-6 text-blue-500" />,
    };

    const bgColors = {
        success: 'bg-green-50 border-green-200',
        error: 'bg-red-50 border-red-200',
        warning: 'bg-yellow-50 border-yellow-200',
        info: 'bg-blue-50 border-blue-200',
    };

    return (
        <div className={`fixed top-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 p-4 rounded-lg border ${bgColors[type]} shadow-lg transform transition-all duration-300 ease-in-out`}>
            <div className="flex items-start">
                <div className="flex-shrink-0">
                    {icons[type]}
                </div>
                <div className="mr-3 w-0 flex-1">
                    {title && (
                        <p className="text-sm font-medium text-gray-900">
                            {title}
                        </p>
                    )}
                    <p className="text-sm text-gray-600 mt-1">
                        {message}
                    </p>
                </div>
                <div className="flex-shrink-0 ml-4">
                    <button
                        onClick={onClose}
                        className="inline-flex text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600 transition-colors"
                    >
                        <XMarkIcon className="h-5 w-5" />
                    </button>
                </div>
            </div>
        </div>
    );
}

export function NotificationContainer({ notifications = [], onRemove }) {
    return (
        <div className="fixed top-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 space-y-2">
            {notifications.map((notification) => (
                <NotificationToast
                    key={notification.id}
                    type={notification.type}
                    title={notification.title}
                    message={notification.message}
                    duration={notification.duration}
                    onClose={() => onRemove(notification.id)}
                    show={notification.show}
                />
            ))}
        </div>
    );
}