import React, { useState, useEffect } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Button, Card, Badge, Alert, Modal } from '@/Components';
import { 
    ClockIcon, 
    CheckCircleIcon, 
    UserIcon,
    PhoneIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';

export default function WaitingList() {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCallModal, setShowCallModal] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [callNotes, setCallNotes] = useState('');

    const { post, processing } = useForm();

    useEffect(() => {
        fetchWaitingList();
        const interval = setInterval(fetchWaitingList, 30000); // Update every 30 seconds
        return () => clearInterval(interval);
    }, []);

    const fetchWaitingList = async () => {
        try {
            const response = await fetch(route('receptionist.waiting-list.data'));
            const data = await response.json();
            setAppointments(data);
        } catch (error) {
            console.error('Error fetching waiting list:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCheckIn = (appointmentId) => {
        post(route('receptionist.appointments.check-in', appointmentId), {
            onSuccess: () => fetchWaitingList(),
        });
    };

    const handleCallPatient = (appointment) => {
        setSelectedAppointment(appointment);
        setShowCallModal(true);
    };

    const handleCallComplete = () => {
        post(route('receptionist.appointments.call-patient', selectedAppointment.id), {
            notes: callNotes,
            onSuccess: () => {
                setShowCallModal(false);
                setCallNotes('');
                setSelectedAppointment(null);
                fetchWaitingList();
            },
        });
    };

    const getStatusBadge = (status) => {
        const statusClasses = {
            waiting: 'bg-yellow-100 text-yellow-800',
            called: 'bg-blue-100 text-blue-800',
            in_progress: 'bg-purple-100 text-purple-800',
            completed: 'bg-green-100 text-green-800',
        };
        
        const statusText = {
            waiting: 'في الانتظار',
            called: 'تم استدعاؤه',
            in_progress: 'قيد الكشف',
            completed: 'مكتمل',
        };

        return (
            <Badge className={statusClasses[status]}>
                {statusText[status]}
            </Badge>
        );
    };

    const getWaitingTime = (appointment) => {
        const appointmentTime = new Date(`${appointment.appointment_date} ${appointment.appointment_time}`);
        const now = new Date();
        const diffMs = now - appointmentTime;
        const diffMins = Math.floor(diffMs / 60000);
        
        if (diffMins < 0) return 'قبل الموعد';
        if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
        const hours = Math.floor(diffMins / 60);
        const mins = diffMins % 60;
        return `منذ ${hours} ساعة و ${mins} دقيقة`;
    };

    const getPriorityColor = (appointment) => {
        const waitingTime = new Date(`${appointment.appointment_date} ${appointment.appointment_time}`);
        const now = new Date();
        const diffMins = (now - waitingTime) / 60000;
        
        if (diffMins > 30) return 'border-red-300 bg-red-50';
        if (diffMins > 15) return 'border-yellow-300 bg-yellow-50';
        return 'border-gray-200 bg-white';
    };

    if (loading) {
        return (
            <AuthenticatedLayout header="قائمة الانتظار">
                <Head title="قائمة الانتظار" />
                <div className="max-w-6xl mx-auto">
                    <Card>
                        <Card.Body className="text-center py-12">
                            <div className="loading-spinner mx-auto mb-4"></div>
                            <p className="text-gray-500">جاري تحميل قائمة الانتظار...</p>
                        </Card.Body>
                    </Card>
                </div>
            </AuthenticatedLayout>
        );
    }

    return (
        <AuthenticatedLayout header="قائمة الانتظار">
            <Head title="قائمة الانتظار" />

            <div className="max-w-6xl mx-auto space-y-6">
                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card className="text-center">
                        <Card.Body className="p-4">
                            <div className="text-2xl font-bold text-gray-900">
                                {appointments.length}
                            </div>
                            <div className="text-sm text-gray-500">إجمالي في الانتظار</div>
                        </Card.Body>
                    </Card>

                    <Card className="text-center">
                        <Card.Body className="p-4">
                            <div className="text-2xl font-bold text-yellow-600">
                                {appointments.filter(a => a.status === 'waiting').length}
                            </div>
                            <div className="text-sm text-gray-500">في الانتظار</div>
                        </Card.Body>
                    </Card>

                    <Card className="text-center">
                        <Card.Body className="p-4">
                            <div className="text-2xl font-bold text-blue-600">
                                {appointments.filter(a => a.status === 'called').length}
                            </div>
                            <div className="text-sm text-gray-500">تم استدعاؤهم</div>
                        </Card.Body>
                    </Card>

                    <Card className="text-center">
                        <Card.Body className="p-4">
                            <div className="text-2xl font-bold text-purple-600">
                                {appointments.filter(a => a.status === 'in_progress').length}
                            </div>
                            <div className="text-sm text-gray-500">قيد الكشف</div>
                        </Card.Body>
                    </Card>
                </div>

                {/* Waiting List */}
                <Card>
                    <Card.Header>
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-900">
                                قائمة الانتظار الحالية
                            </h3>
                            <div className="flex items-center space-x-2 space-x-reverse">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={fetchWaitingList}
                                >
                                    تحديث
                                </Button>
                                <Link href={route('receptionist.appointments.create')}>
                                    <Button size="sm">
                                        + موعد جديد
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </Card.Header>

                    <Card.Body>
                        {appointments.length > 0 ? (
                            <div className="space-y-4">
                                {appointments.map((appointment) => (
                                    <div
                                        key={appointment.id}
                                        className={`border rounded-lg p-4 ${getPriorityColor(appointment)}`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-4 space-x-reverse">
                                                <div className="text-center">
                                                    <div className="text-2xl font-bold text-gray-900">
                                                        {appointment.appointment_time}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {getWaitingTime(appointment)}
                                                    </div>
                                                </div>
                                                
                                                <div className="border-r border-gray-300 pr-4">
                                                    <div className="flex items-center">
                                                        <UserIcon className="h-8 w-8 text-gray-400 ml-3" />
                                                        <div>
                                                            <h4 className="font-medium text-gray-900">
                                                                {appointment.patient.name}
                                                            </h4>
                                                            <p className="text-sm text-gray-500">
                                                                {appointment.patient.phone}
                                                            </p>
                                                            <p className="text-xs text-gray-400">
                                                                {appointment.patient.age} سنة • {appointment.patient.gender === 'male' ? 'ذكر' : 'أنثى'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="border-r border-gray-300 pr-4">
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900">
                                                            د. {appointment.doctor.user.name}
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            {appointment.specialization.name}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div>
                                                    {getStatusBadge(appointment.status)}
                                                </div>
                                            </div>

                                            <div className="flex items-center space-x-2 space-x-reverse">
                                                {appointment.status === 'waiting' && (
                                                    <>
                                                        <Button
                                                            size="sm"
                                                            onClick={() => handleCallPatient(appointment)}
                                                        >
                                                            <PhoneIcon className="h-4 w-4 ml-1" />
                                                            استدعاء
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleCheckIn(appointment.id)}
                                                        >
                                                            <CheckCircleIcon className="h-4 w-4 ml-1" />
                                                            تسجيل الحضور
                                                        </Button>
                                                    </>
                                                )}
                                                
                                                {appointment.status === 'called' && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleCallPatient(appointment)}
                                                    >
                                                        إعادة استدعاء
                                                    </Button>
                                                )}

                                                <Link href={route('receptionist.appointments.show', appointment.id)}>
                                                    <Button variant="outline" size="sm">
                                                        تفاصيل
                                                    </Button>
                                                </Link>
                                            </div>
                                        </div>

                                        {appointment.notes && (
                                            <p className="mt-3 text-sm text-gray-600 bg-gray-50 rounded p-2">
                                                {appointment.notes}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <ClockIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                    لا يوجد مرضى في الانتظار
                                </h3>
                                <p className="text-gray-500 mb-4">
                                    جميع المواعيد تمت معالجتها
                                </p>
                                <Link href={route('receptionist.appointments.create')}>
                                    <Button>
                                        حجز موعد جديد
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </Card.Body>
                </Card>

                {/* Instructions */}
                <Alert variant="info">
                    <div className="text-sm">
                        <p className="font-medium mb-2">تعليمات قائمة الانتظار:</p>
                        <ul className="list-disc list-inside space-y-1 text-gray-600">
                            <li>المرضى الذين انتظروا أكثر من 30 دقيقة يظهرون باللون الأحمر</li>
                            <li>المرضى الذين انتظروا أكثر من 15 دقيقة يظهرون باللون الأصفر</li>
                            <li>يمكنك استدعاء المريض أو تسجيل حضوره</li>
                            <li>يتم تحديث القائمة تلقائياً كل 30 ثانية</li>
                        </ul>
                    </div>
                </Alert>
            </div>

            {/* Call Modal */}
            <Modal show={showCallModal} onClose={() => setShowCallModal(false)}>
                <Modal.Header>
                    <h3 className="text-lg font-semibold text-gray-900">
                        استدعاء المريض
                    </h3>
                </Modal.Header>
                <Modal.Body>
                    {selectedAppointment && (
                        <div className="space-y-4">
                            <div className="bg-gray-50 rounded-lg p-4">
                                <h4 className="font-medium text-gray-900 mb-2">
                                    {selectedAppointment.patient.name}
                                </h4>
                                <p className="text-sm text-gray-600">
                                    {selectedAppointment.patient.phone}
                                </p>
                                <p className="text-sm text-gray-600">
                                    الطبيب: د. {selectedAppointment.doctor.user.name}
                                </p>
                                <p className="text-sm text-gray-600">
                                    العيادة: {selectedAppointment.clinic?.name || 'غير محدد'}
                                </p>
                            </div>
                            
                            <div>
                                <label className="form-label">ملاحظات الاستدعاء</label>
                                <textarea
                                    value={callNotes}
                                    onChange={(e) => setCallNotes(e.target.value)}
                                    className="form-textarea"
                                    rows={3}
                                    placeholder="أي ملاحظات حول استدعاء المريض..."
                                />
                            </div>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <div className="flex items-center justify-end space-x-4 space-x-reverse">
                        <Button
                            variant="outline"
                            onClick={() => setShowCallModal(false)}
                        >
                            إلغاء
                        </Button>
                        <Button
                            onClick={handleCallComplete}
                            disabled={processing}
                        >
                            {processing ? 'جاري الاستدعاء...' : 'تأكيد الاستدعاء'}
                        </Button>
                    </div>
                </Modal.Footer>
            </Modal>
        </AuthenticatedLayout>
    );
}