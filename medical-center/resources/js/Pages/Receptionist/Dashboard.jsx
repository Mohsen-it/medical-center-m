import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { 
    Button, 
    Card, 
    Badge, 
    StatCard,
    Alert,
    Table
} from '@/Components';
import { 
    CalendarIcon, 
    CheckCircleIcon,
    ClockIcon,
    UserGroupIcon,
    UserPlusIcon,
    PlusIcon,
    EyeIcon,
    XCircleIcon,
    UserCircleIcon,
    PhoneIcon,
    BellIcon
} from '@heroicons/react/24/outline';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function ReceptionistDashboard({ stats, todayAppointments, waitingList, hourlyData }) {
    const [showAlert, setShowAlert] = useState(false);

    const getStatusBadge = (status) => {
        const variants = {
            scheduled: 'primary',
            confirmed: 'success',
            completed: 'gray',
            cancelled: 'danger',
            'no-show': 'warning',
        };
        
        const texts = {
            scheduled: 'مجدول',
            confirmed: 'مؤكد',
            completed: 'مكتمل',
            cancelled: 'ملغي',
            'no-show': 'لم يحضر',
        };

        return (
            <Badge variant={variants[status]}>
                {texts[status]}
            </Badge>
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

    const handleCheckIn = (appointmentId) => {
        router.patch(`/receptionist/appointments/${appointmentId}/check-in`, {}, {
            onSuccess: () => setShowAlert(true)
        });
    };

    const handleCancel = (appointmentId) => {
        router.patch(`/receptionist/appointments/${appointmentId}/cancel`, {}, {
            onSuccess: () => setShowAlert(true)
        });
    };

    return (
        <AuthenticatedLayout header="لوحة التحكم">
            <Head title="لوحة التحكم" />

            {/* Success Alert */}
            {showAlert && (
                <div className="mb-6">
                    <Alert variant="success" dismissible onDismiss={() => setShowAlert(false)}>
                        تم تحديث الحالة بنجاح
                    </Alert>
                </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
                <StatCard
                    title="مواعيد اليوم"
                    value={stats.appointments_today}
                    icon={CalendarIcon}
                    variant="primary"
                />
                <StatCard
                    title="مسجل اليوم"
                    value={stats.checked_in_today}
                    icon={CheckCircleIcon}
                    variant="success"
                />
                <StatCard
                    title="في الانتظار"
                    value={stats.pending_checkins}
                    icon={ClockIcon}
                    variant="warning"
                />
                <StatCard
                    title="إجمالي المرضى"
                    value={stats.total_patients}
                    icon={UserGroupIcon}
                    variant="info"
                />
                <StatCard
                    title="مرضى جدد"
                    value={stats.new_patients_this_month}
                    icon={UserPlusIcon}
                    variant="secondary"
                />
                <StatCard
                    title="ملغي اليوم"
                    value={stats.cancelled_today}
                    icon={XCircleIcon}
                    variant="danger"
                />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Today's Appointments */}
                <div className="xl:col-span-2">
                    <Card>
                        <Card.Header>
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">مواعيد اليوم</h3>
                                    <p className="text-sm text-gray-600 mt-1">
                                        {new Date().toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                    </p>
                                </div>
                                <Link href="/receptionist/appointments/create">
                                    <Button>
                                        <PlusIcon className="h-4 w-4 ml-2" />
                                        حجز موعد جديد
                                    </Button>
                                </Link>
                            </div>
                        </Card.Header>
                        <Card.Body>
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
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                الإجراءات
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {todayAppointments.map((appointment) => (
                                            <tr key={appointment.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    <div className="flex items-center">
                                                        <ClockIcon className="h-4 w-4 text-gray-400 ml-2" />
                                                        {new Date(`2000-01-01 ${appointment.appointment_time}`).toLocaleTimeString('ar-SA', {
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="h-8 w-8 flex-shrink-0">
                                                            <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                                                                <span className="text-xs font-medium text-primary-600">
                                                                    {appointment.patient.name.charAt(0)}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="mr-2">
                                                            <div className="text-sm font-medium text-gray-900">{appointment.patient.name}</div>
                                                            <div className="text-xs text-gray-500">{appointment.patient.phone}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    د. {appointment.doctor.user.name}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <Badge variant="primary" size="sm">
                                                        {appointment.specialization.name}
                                                    </Badge>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <Badge variant="info" size="sm">
                                                        {getAppointmentType(appointment.type)}
                                                    </Badge>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {getStatusBadge(appointment.status)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    <div className="flex items-center space-x-2 space-x-reverse">
                                                        <Link href={`/receptionist/appointments/${appointment.id}`}>
                                                            <Button variant="outline" size="sm">
                                                                <EyeIcon className="h-4 w-4" />
                                                            </Button>
                                                        </Link>
                                                        {appointment.status === 'scheduled' && (
                                                            <Button 
                                                                variant="success" 
                                                                size="sm"
                                                                onClick={() => handleCheckIn(appointment.id)}
                                                            >
                                                                <CheckCircleIcon className="h-4 w-4" />
                                                            </Button>
                                                        )}
                                                        {appointment.status === 'confirmed' && (
                                                            <Button 
                                                                variant="danger" 
                                                                size="sm"
                                                                onClick={() => handleCancel(appointment.id)}
                                                            >
                                                                <XCircleIcon className="h-4 w-4" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </Card.Body>
                    </Card>
                </div>

                {/* Right Sidebar */}
                <div className="space-y-8">
                    {/* Waiting List */}
                    <Card>
                        <Card.Header>
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-gray-900">قائمة الانتظار</h3>
                                <Badge variant="warning">{waitingList.length}</Badge>
                            </div>
                        </Card.Header>
                        <Card.Body>
                            {waitingList.length > 0 ? (
                                <div className="space-y-3 max-h-96 overflow-y-auto">
                                    {waitingList.map((appointment, index) => (
                                        <div key={appointment.id} className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition-colors duration-150">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center">
                                                    <div className="bg-primary-100 text-primary-600 rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm mr-3">
                                                        {index + 1}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900 text-sm">{appointment.patient.name}</p>
                                                        <p className="text-xs text-gray-500">د. {appointment.doctor.user.name}</p>
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
                                                <div className="flex items-center">
                                                    <PhoneIcon className="h-4 w-4 text-gray-400 ml-2" />
                                                    <span className="text-xs text-gray-600">{appointment.patient.phone}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <ClockIcon className="h-8 w-8 text-gray-400 mx-auto mb-3" />
                                    <p className="text-sm text-gray-500">لا يوجد مرضى في الانتظار</p>
                                </div>
                            )}
                        </Card.Body>
                    </Card>

                    {/* Quick Actions */}
                    <Card>
                        <Card.Header>
                            <h3 className="text-lg font-semibold text-gray-900">إجراءات سريعة</h3>
                        </Card.Header>
                        <Card.Body>
                            <div className="space-y-3">
                                <Link href="/receptionist/patients/create">
                                    <Button variant="outline" className="w-full">
                                        <UserPlusIcon className="h-4 w-4 ml-2" />
                                        تسجيل مريض جديد
                                    </Button>
                                </Link>
                                <Link href="/receptionist/appointments">
                                    <Button variant="outline" className="w-full">
                                        <CalendarIcon className="h-4 w-4 ml-2" />
                                        جميع المواعيد
                                    </Button>
                                </Link>
                                <Link href="/receptionist/patients">
                                    <Button variant="outline" className="w-full">
                                        <UserGroupIcon className="h-4 w-4 ml-2" />
                                        البحث عن مريض
                                    </Button>
                                </Link>
                                <Link href="/receptionist/attendance">
                                    <Button variant="outline" className="w-full">
                                        <CheckCircleIcon className="h-4 w-4 ml-2" />
                                        سجل الحضور
                                    </Button>
                                </Link>
                            </div>
                        </Card.Body>
                    </Card>

                    {/* Hourly Statistics */}
                    <Card>
                        <Card.Header>
                            <h3 className="text-lg font-semibold text-gray-900">إحصائيات ساعية</h3>
                            <p className="text-sm text-gray-600 mt-1">توزيع المواعيد بالساعة</p>
                        </Card.Header>
                        <Card.Body>
                            <ResponsiveContainer width="100%" height={200}>
                                <BarChart data={hourlyData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="hour" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="count" fill="#0ea5e9" />
                                </BarChart>
                            </ResponsiveContainer>
                        </Card.Body>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}