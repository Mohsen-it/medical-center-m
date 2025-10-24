import React from 'react';
import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { 
    CalendarIcon, 
    ClockIcon,
    CheckCircleIcon,
    UserGroupIcon,
    ClipboardDocumentListIcon
} from '@heroicons/react/24/outline';

export default function DoctorDashboard({ stats, todayAppointments, upcomingAppointments, doctor }) {
    const statCards = [
        {
            name: 'مواعيد اليوم',
            value: stats.appointments_today,
            icon: CalendarIcon,
            color: 'bg-blue-500',
            bgColor: 'bg-blue-50',
            textColor: 'text-blue-600',
        },
        {
            name: 'مواعيد معلقة',
            value: stats.pending_appointments,
            icon: ClockIcon,
            color: 'bg-yellow-500',
            bgColor: 'bg-yellow-50',
            textColor: 'text-yellow-600',
        },
        {
            name: 'مكتمل اليوم',
            value: stats.completed_appointments_today,
            icon: CheckCircleIcon,
            color: 'bg-green-500',
            bgColor: 'bg-green-50',
            textColor: 'text-green-600',
        },
        {
            name: 'إجمالي المرضى',
            value: stats.total_patients,
            icon: UserGroupIcon,
            color: 'bg-purple-500',
            bgColor: 'bg-purple-50',
            textColor: 'text-purple-600',
        },
        {
            name: 'مواعيد قادمة',
            value: stats.upcoming_appointments,
            icon: ClipboardDocumentListIcon,
            color: 'bg-indigo-500',
            bgColor: 'bg-indigo-50',
            textColor: 'text-indigo-600',
        },
    ];

    const getStatusBadge = (status) => {
        const statusClasses = {
            scheduled: 'status-scheduled',
            confirmed: 'status-confirmed',
            completed: 'status-completed',
            cancelled: 'status-cancelled',
            'no-show': 'status-no-show',
        };
        
        const statusText = {
            scheduled: 'مجدول',
            confirmed: 'مؤكد',
            completed: 'مكتمل',
            cancelled: 'ملغي',
            'no-show': 'لم يحضر',
        };

        return (
            <span className={statusClasses[status]}>
                {statusText[status]}
            </span>
        );
    };

    const getAppointmentType = (type) => {
        const types = {
            consultation: 'استشارة',
            follow_up: 'متابعة',
            emergency: 'طوارئ',
            surgery: 'جراحة',
        };
        return types[type] || type;
    };

    return (
        <AuthenticatedLayout header="لوحة التحكم">
            <Head title="لوحة التحكم" />

            {/* Doctor Info Card */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <div className="p-3 bg-primary-100 rounded-lg">
                            <div className="h-12 w-12 bg-primary-600 rounded-full flex items-center justify-center">
                                <span className="text-white font-bold text-lg">
                                    {doctor.user.name.charAt(0)}
                                </span>
                            </div>
                        </div>
                        <div className="mr-4">
                            <h2 className="text-xl font-bold text-gray-900">د. {doctor.user.name}</h2>
                            <p className="text-sm text-gray-600">{doctor.specialization.name}</p>
                            <p className="text-xs text-gray-500">خبرة: {doctor.experience_years} سنوات</p>
                        </div>
                    </div>
                    <div className="text-left">
                        <div className="flex items-center text-sm text-gray-600">
                            <span className="ml-2">التقييم:</span>
                            <span className="font-bold text-yellow-500">★ {doctor.rating}</span>
                            <span className="text-gray-400">({doctor.rating_count})</span>
                        </div>
                        <div className="text-sm text-gray-600">
                            رسوم الاستشارة: {doctor.consultation_fee} ريال
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {statCards.map((stat) => (
                    <div key={stat.name} className="bg-white rounded-lg shadow-md p-6 card-hover">
                        <div className="flex items-center">
                            <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                                <stat.icon className={`h-6 w-6 ${stat.textColor}`} />
                            </div>
                            <div className="mr-4">
                                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Today's Appointments */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">مواعيد اليوم</h3>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                        {todayAppointments.length > 0 ? (
                            todayAppointments.map((appointment) => (
                                <div key={appointment.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium text-gray-900">{appointment.patient.name}</p>
                                            <p className="text-sm text-gray-500">
                                                {new Date(`2000-01-01 ${appointment.appointment_time}`).toLocaleTimeString('ar-SA', {
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </p>
                                            <p className="text-xs text-gray-400">
                                                {getAppointmentType(appointment.type)}
                                            </p>
                                        </div>
                                        <div className="text-left">
                                            {getStatusBadge(appointment.status)}
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500 text-center py-8">لا توجد مواعيد اليوم</p>
                        )}
                    </div>
                </div>

                {/* Upcoming Appointments */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">المواعيد القادمة</h3>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                        {upcomingAppointments.length > 0 ? (
                            upcomingAppointments.map((appointment) => (
                                <div key={appointment.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium text-gray-900">{appointment.patient.name}</p>
                                            <p className="text-sm text-gray-500">
                                                {new Date(appointment.appointment_date).toLocaleDateString('ar-SA')}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                {new Date(`2000-01-01 ${appointment.appointment_time}`).toLocaleTimeString('ar-SA', {
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </p>
                                        </div>
                                        <div className="text-left">
                                            {getStatusBadge(appointment.status)}
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500 text-center py-8">لا توجد مواعيد قادمة</p>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}