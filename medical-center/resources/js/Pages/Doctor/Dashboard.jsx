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
    ClockIcon,
    CheckCircleIcon,
    UserGroupIcon,
    ClipboardDocumentListIcon,
    PlusIcon,
    EyeIcon,
    UserCircleIcon,
    DocumentTextIcon,
    StarIcon
} from '@heroicons/react/24/outline';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function DoctorDashboard({ stats, todayAppointments, upcomingAppointments, doctor, weeklyData }) {
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

            {/* Doctor Info Card */}
            <Card className="mb-8">
                <Card.Body>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <div className="p-4 bg-primary-100 rounded-xl">
                                <div className="h-16 w-16 bg-primary-600 rounded-full flex items-center justify-center">
                                    <span className="text-white font-bold text-xl">
                                        {doctor.user.name.charAt(0)}
                                    </span>
                                </div>
                            </div>
                            <div className="mr-6">
                                <h2 className="text-2xl font-bold text-gray-900">د. {doctor.user.name}</h2>
                                <p className="text-lg text-gray-600">{doctor.specialization.name}</p>
                                <div className="flex items-center mt-2 space-x-4 space-x-reverse">
                                    <div className="flex items-center text-sm text-gray-600">
                                        <span className="ml-2">الخبرة:</span>
                                        <span className="font-medium">{doctor.experience_years} سنوات</span>
                                    </div>
                                    <div className="flex items-center text-sm text-gray-600">
                                        <span className="ml-2">التقييم:</span>
                                        <div className="flex items-center">
                                            <StarIcon className="h-4 w-4 text-yellow-400 ml-1" />
                                            <span className="font-medium">{doctor.rating}</span>
                                            <span className="text-gray-400 mr-1">({doctor.rating_count})</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="text-left">
                            <div className="text-sm text-gray-600 mb-2">رسوم الاستشارة</div>
                            <div className="text-2xl font-bold text-primary-600">{doctor.consultation_fee} ريال</div>
                            <Badge variant={doctor.is_available ? 'success' : 'gray'} className="mt-2">
                                {doctor.is_available ? 'متاح' : 'غير متاح'}
                            </Badge>
                        </div>
                    </div>
                </Card.Body>
            </Card>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                <StatCard
                    title="مواعيد اليوم"
                    value={stats.appointments_today}
                    icon={CalendarIcon}
                    variant="primary"
                />
                <StatCard
                    title="مواعيد معلقة"
                    value={stats.pending_appointments}
                    icon={ClockIcon}
                    variant="warning"
                />
                <StatCard
                    title="مكتمل اليوم"
                    value={stats.completed_appointments_today}
                    icon={CheckCircleIcon}
                    variant="success"
                />
                <StatCard
                    title="إجمالي المرضى"
                    value={stats.total_patients}
                    icon={UserGroupIcon}
                    variant="info"
                />
                <StatCard
                    title="مواعيد قادمة"
                    value={stats.upcoming_appointments}
                    icon={ClipboardDocumentListIcon}
                    variant="secondary"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Today's Appointments */}
                <div className="lg:col-span-2">
                    <Card>
                        <Card.Header>
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">مواعيد اليوم</h3>
                                    <p className="text-sm text-gray-600 mt-1">
                                        {new Date().toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                    </p>
                                </div>
                                <Link href="/doctor/appointments/create">
                                    <Button variant="outline" size="sm">
                                        <PlusIcon className="h-4 w-4 ml-2" />
                                        موعد جديد
                                    </Button>
                                </Link>
                            </div>
                        </Card.Header>
                        <Card.Body>
                            {todayAppointments.length > 0 ? (
                                <div className="space-y-4">
                                    {todayAppointments.map((appointment) => (
                                        <div key={appointment.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow duration-200">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center">
                                                    <div className="h-12 w-12 flex-shrink-0">
                                                        <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center">
                                                            <span className="text-primary-600 font-medium">
                                                                {appointment.patient.name.charAt(0)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="mr-4">
                                                        <p className="font-medium text-gray-900">{appointment.patient.name}</p>
                                                        <div className="flex items-center text-sm text-gray-600 mt-1">
                                                            <ClockIcon className="h-4 w-4 ml-1" />
                                                            {new Date(`2000-01-01 ${appointment.appointment_time}`).toLocaleTimeString('ar-SA', {
                                                                hour: '2-digit',
                                                                minute: '2-digit'
                                                            })}
                                                        </div>
                                                        <div className="text-xs text-gray-500 mt-1">
                                                            {getAppointmentType(appointment.type)}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-2 space-x-reverse">
                                                    {getStatusBadge(appointment.status)}
                                                    <div className="flex space-x-1 space-x-reverse">
                                                        <Link href={`/doctor/appointments/${appointment.id}`}>
                                                            <Button variant="outline" size="sm">
                                                                <EyeIcon className="h-4 w-4" />
                                                            </Button>
                                                        </Link>
                                                        {appointment.status === 'confirmed' && (
                                                            <Button 
                                                                variant="success" 
                                                                size="sm"
                                                                onClick={() => {
                                                                    router.patch(`/doctor/appointments/${appointment.id}/complete`, {}, {
                                                                        onSuccess: () => setShowAlert(true)
                                                                    });
                                                                }}
                                                            >
                                                                <CheckCircleIcon className="h-4 w-4" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-500">لا توجد مواعد اليوم</p>
                                </div>
                            )}
                        </Card.Body>
                    </Card>
                </div>

                {/* Upcoming Appointments */}
                <div>
                    <Card>
                        <Card.Header>
                            <h3 className="text-lg font-semibold text-gray-900">المواعيد القادمة</h3>
                            <p className="text-sm text-gray-600 mt-1">الأيام القادمة</p>
                        </Card.Header>
                        <Card.Body>
                            {upcomingAppointments.length > 0 ? (
                                <div className="space-y-3 max-h-96 overflow-y-auto">
                                    {upcomingAppointments.map((appointment) => (
                                        <div key={appointment.id} className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition-colors duration-150">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="font-medium text-gray-900 text-sm">{appointment.patient.name}</p>
                                                    <div className="text-xs text-gray-600 mt-1">
                                                        {new Date(appointment.appointment_date).toLocaleDateString('ar-SA')}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {new Date(`2000-01-01 ${appointment.appointment_time}`).toLocaleTimeString('ar-SA', {
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </div>
                                                </div>
                                                {getStatusBadge(appointment.status)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <ClockIcon className="h-8 w-8 text-gray-400 mx-auto mb-3" />
                                    <p className="text-sm text-gray-500">لا توجد مواعد قادمة</p>
                                </div>
                            )}
                        </Card.Body>
                    </Card>

                    {/* Quick Actions */}
                    <Card className="mt-6">
                        <Card.Header>
                            <h3 className="text-lg font-semibold text-gray-900">إجراءات سريعة</h3>
                        </Card.Header>
                        <Card.Body>
                            <div className="space-y-3">
                                <Link href="/doctor/patients">
                                    <Button variant="outline" className="w-full">
                                        <UserGroupIcon className="h-4 w-4 ml-2" />
                                        مرضاي
                                    </Button>
                                </Link>
                                <Link href="/doctor/medical-records">
                                    <Button variant="outline" className="w-full">
                                        <DocumentTextIcon className="h-4 w-4 ml-2" />
                                        السجلات الطبية
                                    </Button>
                                </Link>
                                <Link href="/doctor/prescriptions">
                                    <Button variant="outline" className="w-full">
                                        <ClipboardDocumentListIcon className="h-4 w-4 ml-2" />
                                        الوصفات الطبية
                                    </Button>
                                </Link>
                                <Link href="/doctor/schedule">
                                    <Button variant="outline" className="w-full">
                                        <CalendarIcon className="h-4 w-4 ml-2" />
                                        جدولي
                                    </Button>
                                </Link>
                            </div>
                        </Card.Body>
                    </Card>
                </div>
            </div>

            {/* Weekly Chart */}
            <Card className="mt-8">
                <Card.Header>
                    <h3 className="text-lg font-semibold text-gray-900">إحصائيات الأسبوع</h3>
                    <p className="text-sm text-gray-600 mt-1">
                        عدد المواعيد خلال الأسبوع الحالي
                    </p>
                </Card.Header>
                <Card.Body>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={weeklyData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="day" />
                            <YAxis />
                            <Tooltip />
                            <Line 
                                type="monotone" 
                                dataKey="appointments" 
                                stroke="#0ea5e9" 
                                strokeWidth={2}
                                dot={{ fill: '#0ea5e9' }}
                                name="المواعيد"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </Card.Body>
            </Card>
        </AuthenticatedLayout>
    );
}