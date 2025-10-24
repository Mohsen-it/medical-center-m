import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { Button, Card } from '@/Components';
import { ExclamationTriangleIcon, HomeIcon } from '@heroicons/react/24/outline';

export default function ErrorPage({ status, message }) {
    const errorMessages = {
        404: {
            title: 'الصفحة غير موجودة',
            description: 'عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها.',
            icon: '🔍',
        },
        403: {
            title: 'غير مصرح بالوصول',
            description: 'ليس لديك الصلاحيات الكافية للوصول إلى هذه الصفحة.',
            icon: '🔒',
        },
        500: {
            title: 'خطأ في الخادم',
            description: 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى لاحقاً.',
            icon: '⚠️',
        },
        503: {
            title: 'الخدمة غير متاحة',
            description: 'الخدمة غير متاحة حالياً للصيانة. يرجى المحاولة مرة أخرى لاحقاً.',
            icon: '🔧',
        },
    };

    const error = errorMessages[status] || errorMessages[500];

    return (
        <>
            <Head title={error.title} />
            <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
                <div className="sm:mx-auto sm:w-full sm:max-w-md">
                    <div className="text-center">
                        <div className="text-6xl mb-4">{error.icon}</div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            {error.title}
                        </h1>
                        <p className="text-gray-600 mb-8">
                            {message || error.description}
                        </p>
                        
                        <Card className="text-center">
                            <Card.Body className="p-6">
                                <div className="flex items-center justify-center mb-4">
                                    <ExclamationTriangleIcon className="h-12 w-12 text-yellow-500" />
                                </div>
                                <h2 className="text-lg font-semibold text-gray-900 mb-2">
                                    خطأ {status}
                                </h2>
                                <p className="text-gray-600 mb-6">
                                    {message || error.description}
                                </p>
                                <div className="space-y-3">
                                    <Link href="/">
                                        <Button className="w-full">
                                            <HomeIcon className="h-4 w-4 ml-2" />
                                            العودة للرئيسية
                                        </Button>
                                    </Link>
                                    <Button
                                        variant="outline"
                                        className="w-full"
                                        onClick={() => window.history.back()}
                                    >
                                        العودة للخلف
                                    </Button>
                                </div>
                            </Card.Body>
                        </Card>

                        <div className="mt-8 text-center">
                            <p className="text-sm text-gray-500">
                                إذا استمرت المشكلة، يرجى التواصل مع الدعم الفني
                            </p>
                            <div className="mt-4">
                                <Link 
                                    href="mailto:support@medical-center.com"
                                    className="text-primary-600 hover:text-primary-800 text-sm font-medium"
                                >
                                    support@medical-center.com
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}