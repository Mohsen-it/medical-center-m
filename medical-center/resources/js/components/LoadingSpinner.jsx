import React from 'react';

export default function LoadingSpinner({ size = 'md', className = '' }) {
    const sizeClasses = {
        sm: 'h-4 w-4',
        md: 'h-8 w-8',
        lg: 'h-12 w-12',
        xl: 'h-16 w-16',
    };

    return (
        <div className={`flex items-center justify-center ${className}`}>
            <div
                className={`
                    ${sizeClasses[size]}
                    animate-spin rounded-full border-2 border-gray-300 border-t-primary-600
                `}
            />
        </div>
    );
}

export function FullPageLoading() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
                <LoadingSpinner size="lg" />
                <p className="mt-4 text-gray-600">جاري التحميل...</p>
            </div>
        </div>
    );
}

export function CardLoading({ height = 'h-48' }) {
    return (
        <div className={`${height} bg-white rounded-lg shadow-md p-6`}>
            <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                </div>
            </div>
        </div>
    );
}

export function TableLoading({ rows = 5 }) {
    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="animate-pulse">
                <div className="bg-gray-50 h-12 border-b border-gray-200"></div>
                {Array.from({ length: rows }).map((_, index) => (
                    <div key={index} className="h-16 border-b border-gray-100 last:border-b-0">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mx-6 mt-6"></div>
                    </div>
                ))}
            </div>
        </div>
    );
}