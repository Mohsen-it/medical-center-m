import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Button, Card, Badge, Alert, Modal } from '@/Components';

export default function ShowAppointment({ appointment }) {
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [cancelReason, setCancelReason] = useState('');
    
    const { post, processing } = useForm();

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

    const handleConfirm = () => {
        post(route('admin.appointments.confirm', appointment.id));
    };

    const handleComplete = () => {
        post(route('admin.appointments.complete', appointment.id));
    };

    const handleCancel = () => {
        if (!cancelReason.trim()) {
            return;
        }

        post(route('admin.appointments.cancel', appointment.id), {
            cancellation_reason: cancelReason,
            onSuccess: () => {
                setShowCancelModal(false);
                setCancelReason('');
            },
        });
    };

    const canConfirm = appointment.status === 'scheduled';
    const canComplete = appointment.status === 'confirmed';
    const canCancel = ['scheduled', 'confirmed'].includes(appointment.status);

    return (
        <AuthenticatedLayout header="تفاصيل الموعد">
            <Head title="تفاصيل الموعد" />

            <div className="max-w-6xl mx-auto space-y-6">
                {/* Appointment Header */}
                <Card>
                    <Card.Header>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4 space-x-reverse">
                                <h2 className="text-xl font-semibold text-gray-900">
                                    تفاصيل الموعد #{appointment.id}
                                </h2>
                                {getStatusBadge(appointment.status)}
                                {getTypeBadge(appointment.type)}
                            </div>
                            <div className="flex items-center space-x-2 space-x-reverse">
                                <Link href={route('admin.appointments.edit', appointment.id)}>
                                    <Button variant="outline" size="sm">
                                        تعديل
                                    </Button>
                                </Link>
                                <Link href={route('admin.appointments.index')}>
                                    <Button variant="outline" size="sm">
                                        العودة
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </Card.Header>

                    <Card.Body>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {/* Patient Info */}
                            <div className="bg-gray-50 rounded-lg p-4">
                                <h3 className="font-medium text-gray-900 mb-3">بيانات المريض</h3>
                                <div className="space-y-2 text-sm">
                                    <div>
                                        <span className="text-gray-500">الاسم:</span>
                                        <span className="mr-2 font-medium">{appointment.patient.name}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">الهاتف:</span>
                                        <span className="mr-2">{appointment.patient.phone}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">البريد:</span>
                                        <span className="mr-2">{appointment.patient.email}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">الرقم الوطني:</span>
                                        <span className="mr-2">{appointment.patient.national_id}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Doctor Info */}
                            <div className="bg-gray-50 rounded-lg p-4">
                                <h3 className="font-medium text-gray-900 mb-3">بيانات الطبيب</h3>
                                <div className="space-y-2 text-sm">
                                    <div>
                                        <span className="text-gray-500">الاسم:</span>
                                        <span className="mr-2 font-medium">د. {appointment.doctor.user.name}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">التخصص:</span>
                                        <span className="mr-2">{appointment.specialization.name}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">الخبرة:</span>
                                        <span className="mr-2">{appointment.doctor.experience_years} سنوات</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">التقييم:</span>
                                        <span className="mr-2">⭐ {appointment.doctor.rating}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Appointment Info */}
                            <div className="bg-gray-50 rounded-lg p-4">
                                <h3 className="font-medium text-gray-900 mb-3">بيانات الموعد</h3>
                                <div className="space-y-2 text-sm">
                                    <div>
                                        <span className="text-gray-500">التاريخ:</span>
                                        <span className="mr-2 font-medium">
                                            {new Date(appointment.appointment_date).toLocaleDateString('ar-SA')}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">الوقت:</span>
                                        <span className="mr-2">{appointment.appointment_time}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">الرسوم:</span>
                                        <span className="mr-2 font-medium">{appointment.fee} ريال</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">الدفع:</span>
                                        <span className="mr-2">
                                            {appointment.is_paid ? (
                                                <Badge className="bg-green-100 text-green-800">مدفوع</Badge>
                                            ) : (
                                                <Badge className="bg-yellow-100 text-yellow-800">غير مدفوع</Badge>
                                            )}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Notes */}
                        {appointment.notes && (
                            <div className="mt-6">
                                <h3 className="font-medium text-gray-900 mb-2">ملاحظات</h3>
                                <p className="text-gray-600 bg-gray-50 rounded-lg p-4">
                                    {appointment.notes}
                                </p>
                            </div>
                        )}

                        {/* Cancellation Reason */}
                        {appointment.cancellation_reason && (
                            <div className="mt-6">
                                <h3 className="font-medium text-gray-900 mb-2">سبب الإلغاء</h3>
                                <Alert variant="warning">
                                    {appointment.cancellation_reason}
                                </Alert>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="mt-6 flex items-center justify-end space-x-4 space-x-reverse">
                            {canConfirm && (
                                <Button onClick={handleConfirm} className="bg-green-600 hover:bg-green-700">
                                    تأكيد الموعد
                                </Button>
                            )}
                            {canComplete && (
                                <Button onClick={handleComplete} className="bg-blue-600 hover:bg-blue-700">
                                    إكمال الموعد
                                </Button>
                            )}
                            {canCancel && (
                                <Button 
                                    variant="danger" 
                                    onClick={() => setShowCancelModal(true)}
                                >
                                    إلغاء الموعد
                                </Button>
                            )}
                        </div>
                    </Card.Body>
                </Card>

                {/* Medical Record */}
                {appointment.medical_record && (
                    <Card>
                        <Card.Header>
                            <h3 className="text-lg font-semibold text-gray-900">
                                السجل الطبي
                            </h3>
                        </Card.Header>
                        <Card.Body>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h4 className="font-medium text-gray-900 mb-2">التشخيص</h4>
                                    <p className="text-gray-600">{appointment.medical_record.diagnosis}</p>
                                </div>
                                <div>
                                    <h4 className="font-medium text-gray-900 mb-2">خطة العلاج</h4>
                                    <p className="text-gray-600">{appointment.medical_record.treatment_plan}</p>
                                </div>
                            </div>
                            {appointment.medical_record.notes && (
                                <div className="mt-4">
                                    <h4 className="font-medium text-gray-900 mb-2">ملاحظات إضافية</h4>
                                    <p className="text-gray-600">{appointment.medical_record.notes}</p>
                                </div>
                            )}
                        </Card.Body>
                    </Card>
                )}

                {/* Invoice */}
                {appointment.invoice && (
                    <Card>
                        <Card.Header>
                            <h3 className="text-lg font-semibold text-gray-900">
                                الفاتورة
                            </h3>
                        </Card.Header>
                        <Card.Body>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <span className="text-gray-500">رقم الفاتورة:</span>
                                    <span className="mr-2 font-medium">#{appointment.invoice.id}</span>
                                </div>
                                <div>
                                    <span className="text-gray-500">المبلغ الإجمالي:</span>
                                    <span className="mr-2 font-medium">{appointment.invoice.total_amount} ريال</span>
                                </div>
                                <div>
                                    <span className="text-gray-500">الحالة:</span>
                                    <span className="mr-2">
                                        <Badge className={
                                            appointment.invoice.status === 'paid' 
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-yellow-100 text-yellow-800'
                                        }>
                                            {appointment.invoice.status === 'paid' ? 'مدفوعة' : 'معلقة'}
                                        </Badge>
                                    </span>
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                )}
            </div>

            {/* Cancel Modal */}
            <Modal 
                show={showCancelModal} 
                onClose={() => setShowCancelModal(false)}
            >
                <Modal.Header>
                    <h3 className="text-lg font-semibold text-gray-900">
                        إلغاء الموعد
                    </h3>
                </Modal.Header>
                <Modal.Body>
                    <div className="space-y-4">
                        <p className="text-gray-600">
                            هل أنت متأكد من إلغاء هذا الموعد؟ هذا الإجراء لا يمكن التراجع عنه.
                        </p>
                        <div>
                            <label className="form-label">سبب الإلغاء *</label>
                            <textarea
                                value={cancelReason}
                                onChange={(e) => setCancelReason(e.target.value)}
                                className="form-textarea"
                                rows={4}
                                placeholder="أدخل سبب الإلغاء..."
                                required
                            />
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <div className="flex items-center justify-end space-x-4 space-x-reverse">
                        <Button 
                            variant="outline" 
                            onClick={() => setShowCancelModal(false)}
                        >
                            إلغاء
                        </Button>
                        <Button 
                            variant="danger" 
                            onClick={handleCancel}
                            disabled={processing || !cancelReason.trim()}
                        >
                            {processing ? 'جاري الإلغاء...' : 'تأكيد الإلغاء'}
                        </Button>
                    </div>
                </Modal.Footer>
            </Modal>
        </AuthenticatedLayout>
    );
}