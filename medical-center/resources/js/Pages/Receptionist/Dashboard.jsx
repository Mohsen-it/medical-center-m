import React from 'react';
import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { 
    CalendarIcon, 
    CheckCircleIcon,
    ClockIcon,
    UserGroupIcon,
    UserPlusIcon,
    XCircleIcon
} from '@heroicons/react/24/outline';

export default function ReceptionistDashboard({ stats, todayAppointments, waitingList }) {
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
            name: 'مسجل اليوم',
            value: stats.checked_in_today,
            icon: CheckCircleIcon,
            color: 'bg-green-500',
            bgColor: 'bg-green-50',
            textColor: 'text-green-600',
        },
        {
            name: 'في الانتظار',
            value: stats.pending_checkins,
            icon: ClockIcon,
            color: 'bg-yellow-500',
            bgColor: 'bg-yellow-50',
            textColor: 'text-yellow-600',
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
            name: 'مرضى جدد هذا الشهر',
            value: stats.new_patients_this_month,
            icon: UserPlusIcon,
            color: 'bg-indigo-500',
            bgColor: 'bg-indigo-50',
            textColor: 'text-indigo-600',
        },
        {
            name: 'ملغي اليوم',
            value: stats.cancelled_today,
            icon: XCircleIcon,
            color: 'bg-red-500',
            bgColor: 'bg-red-50',
            textColor: 'text-red-600',
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Today's Appointments */}
                <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">مواعيد اليوم</h3>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        الوقت
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        المريض
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        الطبيب
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        التخصص
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        النوع
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        الحالة
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {todayAppointments.map((appointment) => (
                                    <tr key={appointment.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {new Date(`2000-01-01 ${appointment.appointment_time}`).toLocaleTimeString('ar-SA', {
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {appointment.patient.name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            د. {appointment.doctor.user.name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {appointment.specialization.name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {getAppointmentType(appointment.type)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getStatusBadge(appointment.status)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Waiting List */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">قائمة الانتظار</h3>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                        {waitingList.length > 0 ? (
                            waitingList.map((appointment, index) => (
                                <div key={appointment.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <div className="bg-primary-100 text-primary-600 rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm mr-3">
                                                {index + 1}
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">{appointment.patient.name}</p>
                                                <p className="text-sm text-gray-500">د. {appointment.doctor.user.name}</p>
                                                <p className="text-xs text-gray-400">
                                                    {appointment.checked_in_at && 
                                                        new Date(appointment.checked_in_at).toLocaleTimeString('ar-SA', {
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })
                                                    }
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500 text-center py-8">لا يوجد مرضى في الانتظار</p>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}