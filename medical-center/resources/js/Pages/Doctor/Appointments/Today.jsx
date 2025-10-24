import React, { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Button, Card, Badge, Alert } from '@/Components';
import { 
    CalendarIcon, 
    CheckCircleIcon, 
    ClockIcon, 
    XCircleIcon,
    UserIcon,
    PlayIcon
} from '@heroicons/react/24/outline';

export default function TodayAppointments({ appointments, totalAppointments }) {
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 60000); // Update every minute

        return () => clearInterval(timer);
    }, []);

    const getStatusBadge = (status) => {
        const statusClasses = {
            scheduled: 'bg-blue-100 text-blue-800',
            confirmed: 'bg-green-100 text-green-800',
            completed: 'bg-emerald-100 text-emerald-800',
            cancelled: 'bg-red-100 text-red-800',
            'no-show': 'bg-gray-100 text-gray-800',
        };
        
        const statusText = {
            scheduled: 'مجدول',
            confirmed: 'مؤكد',
            completed: 'مكتمل',
            cancelled: 'ملغي',
            'no-show': 'لم يحضر',
        };

        return (
            <Badge className={statusClasses[status]}>
                {statusText[status]}
            </Badge>
        );
    };

    const getTypeBadge = (type) => {
        const typeClasses = {
            consultation: 'bg-blue-100 text-blue-800',
            follow_up: 'bg-green-100 text-green-800',
            emergency: 'bg-red-100 text-red-800',
            surgery: 'bg-purple-100 text-purple-800',
        };
        
        const typeText = {
            consultation: 'استشارة',
            follow_up: 'متابعة',
            emergency: 'طوارئ',
            surgery: 'جراحة',
        };

        return (
            <Badge className={typeClasses[type]}>
                {typeText[type]}
            </Badge>
        );
    };

    const isOverdue = (appointment) => {
        const appointmentTime = new Date(`2000-01-01 ${appointment.appointment_time}`);
        const now = new Date();
        const currentMinutes = now.getHours() * 60 + now.getMinutes();
        const appointmentMinutes = appointmentTime.getHours() * 60 + appointmentTime.getMinutes();
        
        return currentMinutes > appointmentMinutes + 15 && ['scheduled', 'confirmed'].includes(appointment.status);
    };

    const formatTime = (time) => {
        return new Date(`2000-01-01 ${time}`).toLocaleTimeString('ar-SA', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const stats = {
        total: totalAppointments,
        scheduled: appointments.scheduled?.length || 0,
        confirmed: appointments.confirmed?.length || 0,
        completed: appointments.completed?.length || 0,
        cancelled: appointments.cancelled?.length || 0,
    };

    return (
        <AuthenticatedLayout header="مواعيد اليوم">
            <Head title="مواعيد اليوم" />

            <div className="max-w-7xl mx-auto space-y-6">
                {/* Current Time and Stats */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <Card className="text-center">
                        <Card.Body className="p-4">
                            <div className="text-2xl font-bold text-primary-600">
                                {currentTime.toLocaleTimeString('ar-SA', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </div>
                            <div className="text-sm text-gray-500">الوقت الحالي</div>
                        </Card.Body>
                    </Card>

                    <Card className="text-center">
                        <Card.Body className="p-4">
                            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
                            <div className="text-sm text-gray-500">إجمالي المواعيد</div>
                        </Card.Body>
                    </Card>

                    <Card className="text-center">
                        <Card.Body className="p-4">
                            <div className="text-2xl font-bold text-blue-600">{stats.confirmed}</div>
                            <div className="text-sm text-gray-500">مؤكدة</div>
                        </Card.Body>
                    </Card>

                    <Card className="text-center">
                        <Card.Body className="p-4">
                            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
                            <div className="text-sm text-gray-500">مكتملة</div>
                        </Card.Body>
                    </Card>

                    <Card className="text-center">
                        <Card.Body className="p-4">
                            <div className="text-2xl font-bold text-red-600">{stats.cancelled}</div>
                            <div className="text-sm text-gray-500">ملغية</div>
                        </Card.Body>
                    </Card>
                </div>

                {/* Confirmed Appointments */}
                {appointments.confirmed && appointments.confirmed.length > 0 && (
                    <Card>
                        <Card.Header>
                            <div className="flex items-center">
                                <CheckCircleIcon className="h-5 w-5 text-green-600 ml-2" />
                                <h3 className="text-lg font-semibold text-gray-900">
                                    المواعيد المؤكدة ({appointments.confirmed.length})
                                </h3>
                            </div>
                        </Card.Header>
                        <Card.Body>
                            <div className="space-y-4">
                                {appointments.confirmed.map((appointment) => (
                                    <div
                                        key={appointment.id}
                                        className={`border rounded-lg p-4 ${
                                            isOverdue(appointment) ? 'border-red-300 bg-red-50' : 'border-gray-200'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-4 space-x-reverse">
                                                <div className="text-2xl font-bold text-gray-900">
                                                    {formatTime(appointment.appointment_time)}
                                                </div>
                                                <div>
                                                    <h4 className="font-medium text-gray-900">
                                                        {appointment.patient.name}
                                                    </h4>
                                                    <p className="text-sm text-gray-500">
                                                        {appointment.patient.phone}
                                                    </p>
                                                </div>
                                                <div>
                                                    {getTypeBadge(appointment.type)}
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2 space-x-reverse">
                                                {isOverdue(appointment) && (
                                                    <Alert variant="warning" className="text-xs">
                                                        متأخر
                                                    </Alert>
                                                )}
                                                <Link href={route('doctor.appointments.start', appointment.id)}>
                                                    <Button size="sm">
                                                        <PlayIcon className="h-4 w-4 ml-1" />
                                                        بدء الكشف
                                                    </Button>
                                                </Link>
                                            </div>
                                        </div>
                                        {appointment.notes && (
                                            <p className="mt-2 text-sm text-gray-600">
                                                {appointment.notes}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </Card.Body>
                    </Card>
                )}

                {/* Scheduled Appointments */}
                {appointments.scheduled && appointments.scheduled.length > 0 && (
                    <Card>
                        <Card.Header>
                            <div className="flex items-center">
                                <ClockIcon className="h-5 w-5 text-blue-600 ml-2" />
                                <h3 className="text-lg font-semibold text-gray-900">
                                    المواعيد المجدولة ({appointments.scheduled.length})
                                </h3>
                            </div>
                        </Card.Header>
                        <Card.Body>
                            <div className="space-y-4">
                                {appointments.scheduled.map((appointment) => (
                                    <div
                                        key={appointment.id}
                                        className="border border-gray-200 rounded-lg p-4"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-4 space-x-reverse">
                                                <div className="text-2xl font-bold text-gray-900">
                                                    {formatTime(appointment.appointment_time)}
                                                </div>
                                                <div>
                                                    <h4 className="font-medium text-gray-900">
                                                        {appointment.patient.name}
                                                    </h4>
                                                    <p className="text-sm text-gray-500">
                                                        {appointment.patient.phone}
                                                    </p>
                                                </div>
                                                <div>
                                                    {getTypeBadge(appointment.type)}
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2 space-x-reverse">
                                                <Link href={route('doctor.appointments.show', appointment.id)}>
                                                    <Button variant="outline" size="sm">
                                                        تفاصيل
                                                    </Button>
                                                </Link>
                                            </div>
                                        </div>
                                        {appointment.notes && (
                                            <p className="mt-2 text-sm text-gray-600">
                                                {appointment.notes}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </Card.Body>
                    </Card>
                )}

                {/* Completed Appointments */}
                {appointments.completed && appointments.completed.length > 0 && (
                    <Card>
                        <Card.Header>
                            <div className="flex items-center">
                                <CheckCircleIcon className="h-5 w-5 text-green-600 ml-2" />
                                <h3 className="text-lg font-semibold text-gray-900">
                                    المواعيد المكتملة ({appointments.completed.length})
                                </h3>
                            </div>
                        </Card.Header>
                        <Card.Body>
                            <div className="space-y-4">
                                {appointments.completed.map((appointment) => (
                                    <div
                                        key={appointment.id}
                                        className="border border-green-200 bg-green-50 rounded-lg p-4"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-4 space-x-reverse">
                                                <div className="text-lg font-bold text-green-700">
                                                    {formatTime(appointment.appointment_time)}
                                                </div>
                                                <div>
                                                    <h4 className="font-medium text-gray-900">
                                                        {appointment.patient.name}
                                                    </h4>
                                                    <p className="text-sm text-gray-500">
                                                        {appointment.patient.phone}
                                                    </p>
                                                </div>
                                                <div>
                                                    {getTypeBadge(appointment.type)}
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2 space-x-reverse">
                                                {appointment.medical_record && (
                                                    <Badge className="bg-green-100 text-green-800">
                                                        تم إنشاء سجل طبي
                                                    </Badge>
                                                )}
                                                <Link href={route('doctor.appointments.show', appointment.id)}>
                                                    <Button variant="outline" size="sm">
                                                        عرض
                                                    </Button>
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card.Body>
                    </Card>
                )}

                {/* Cancelled Appointments */}
                {appointments.cancelled && appointments.cancelled.length > 0 && (
                    <Card>
                        <Card.Header>
                            <div className="flex items-center">
                                <XCircleIcon className="h-5 w-5 text-red-600 ml-2" />
                                <h3 className="text-lg font-semibold text-gray-900">
                                    المواعيد الملغاة ({appointments.cancelled.length})
                                </h3>
                            </div>
                        </Card.Header>
                        <Card.Body>
                            <div className="space-y-4">
                                {appointments.cancelled.map((appointment) => (
                                    <div
                                        key={appointment.id}
                                        className="border border-red-200 bg-red-50 rounded-lg p-4"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-4 space-x-reverse">
                                                <div className="text-lg font-bold text-red-700">
                                                    {formatTime(appointment.appointment_time)}
                                                </div>
                                                <div>
                                                    <h4 className="font-medium text-gray-900">
                                                        {appointment.patient.name}
                                                    </h4>
                                                    <p className="text-sm text-gray-500">
                                                        {appointment.patient.phone}
                                                    </p>
                                                </div>
                                                <div>
                                                    {getTypeBadge(appointment.type)}
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2 space-x-reverse">
                                                <Link href={route('doctor.appointments.show', appointment.id)}>
                                                    <Button variant="outline" size="sm">
                                                        عرض
                                                    </Button>
                                                </Link>
                                            </div>
                                        </div>
                                        {appointment.cancellation_reason && (
                                            <p className="mt-2 text-sm text-red-600">
                                                <strong>سبب الإلغاء:</strong> {appointment.cancellation_reason}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </Card.Body>
                    </Card>
                )}

                {/* No Appointments */}
                {totalAppointments === 0 && (
                    <Card>
                        <Card.Body className="text-center py-12">
                            <CalendarIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                لا توجد مواعيد اليوم
                            </h3>
                            <p className="text-gray-500">
                                جميع مواعيدك لهذا اليوم تم عرضها هنا
                            </p>
                        </Card.Body>
                    </Card>
                )}
            </div>
        </AuthenticatedLayout>
    );
}