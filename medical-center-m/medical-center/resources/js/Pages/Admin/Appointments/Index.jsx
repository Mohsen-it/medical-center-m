import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { 
    Button, 
    Card, 
    Table, 
    Badge, 
    Modal, 
    Input, 
    Select,
    Alert,
    StatCard 
} from '@/Components';
import { 
    PlusIcon, 
    MagnifyingGlassIcon,
    EyeIcon,
    PencilIcon,
    TrashIcon,
    CalendarIcon,
    ClockIcon,
    UserCircleIcon,
    CheckCircleIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';

export default function AppointmentsIndex({ appointments, stats, doctors, patients, specializations }) {
    const [showModal, setShowModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [filterDate, setFilterDate] = useState('');
    const [showAlert, setShowAlert] = useState(false);

    const columns = [
        {
            key: 'appointment_date',
            title: 'التاريخ',
            render: (value) => (
                <div>
                    <div className="text-sm font-medium text-gray-900">
                        {new Date(value).toLocaleDateString('ar-SA')}
                    </div>
                    <div className="text-xs text-gray-500">
                        {new Date(value).toLocaleDateString('ar-SA', { weekday: 'long' })}
                    </div>
                </div>
            ),
        },
        {
            key: 'appointment_time',
            title: 'الوقت',
            render: (value) => (
                <div className="flex items-center">
                    <ClockIcon className="h-4 w-4 text-gray-400 ml-2" />
                    <span className="text-sm text-gray-900">
                        {new Date(`2000-01-01 ${value}`).toLocaleTimeString('ar-SA', {
                            hour: '2-digit',
                            minute: '2-digit'
                        })}
                    </span>
                </div>
            ),
        },
        {
            key: 'patient',
            title: 'المريض',
            render: (patient) => (
                <div className="flex items-center">
                    <div className="h-8 w-8 flex-shrink-0">
                        <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                            <span className="text-xs font-medium text-primary-600">
                                {patient.name.charAt(0)}
                            </span>
                        </div>
                    </div>
                    <div className="mr-2">
                        <div className="text-sm font-medium text-gray-900">{patient.name}</div>
                        <div className="text-xs text-gray-500">{patient.phone}</div>
                    </div>
                </div>
            ),
        },
        {
            key: 'doctor',
            title: 'الطبيب',
            render: (doctor) => (
                <div className="flex items-center">
                    <div className="h-8 w-8 flex-shrink-0">
                        <div className="h-8 w-8 rounded-full bg-success-100 flex items-center justify-center">
                            <span className="text-xs font-medium text-success-600">
                                {doctor.user.name.charAt(0)}
                            </span>
                        </div>
                    </div>
                    <div className="mr-2">
                        <div className="text-sm font-medium text-gray-900">د. {doctor.user.name}</div>
                        <div className="text-xs text-gray-500">{doctor.specialization.name}</div>
                    </div>
                </div>
            ),
        },
        {
            key: 'type',
            title: 'النوع',
            render: (value) => {
                const types = {
                    consultation: 'استشارة',
                    follow_up: 'متابعة',
                    emergency: 'طوارئ',
                    surgery: 'جراحة',
                };
                const variants = {
                    consultation: 'primary',
                    follow_up: 'info',
                    emergency: 'danger',
                    surgery: 'warning',
                };
                return (
                    <Badge variant={variants[value]}>
                        {types[value]}
                    </Badge>
                );
            },
        },
        {
            key: 'status',
            title: 'الحالة',
            render: (value) => {
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
                    <Badge variant={variants[value]}>
                        {texts[value]}
                    </Badge>
                );
            },
        },
        {
            key: 'fee',
            title: 'الرسوم',
            render: (value, appointment) => (
                <div className="text-sm">
                    <span className="font-medium text-gray-900">{value} ريال</span>
                    {appointment.is_paid && (
                        <Badge variant="success" size="sm" className="mr-2">
                            مدفوع
                        </Badge>
                    )}
                </div>
            ),
        },
        {
            key: 'actions',
            title: 'الإجراءات',
            render: (_, appointment) => (
                <div className="flex items-center space-x-2 space-x-reverse">
                    <Link href={`/admin/appointments/${appointment.id}`}>
                        <Button variant="outline" size="sm">
                            <EyeIcon className="h-4 w-4" />
                        </Button>
                    </Link>
                    <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEdit(appointment)}
                    >
                        <PencilIcon className="h-4 w-4" />
                    </Button>
                    {appointment.status === 'scheduled' && (
                        <Button 
                            variant="success" 
                            size="sm"
                            onClick={() => handleConfirm(appointment)}
                        >
                            <CheckCircleIcon className="h-4 w-4" />
                        </Button>
                    )}
                    <Button 
                        variant="danger" 
                        size="sm"
                        onClick={() => handleDelete(appointment)}
                    >
                        <TrashIcon className="h-4 w-4" />
                    </Button>
                </div>
            ),
        },
    ];

    const handleEdit = (appointment) => {
        setSelectedAppointment(appointment);
        setShowModal(true);
    };

    const handleDelete = (appointment) => {
        setSelectedAppointment(appointment);
        setShowDeleteModal(true);
    };

    const handleConfirm = (appointment) => {
        router.patch(`/admin/appointments/${appointment.id}/confirm`, {}, {
            onSuccess: () => {
                setShowAlert(true);
                setTimeout(() => setShowAlert(false), 3000);
            },
        });
    };

    const confirmDelete = () => {
        router.delete(`/admin/appointments/${selectedAppointment.id}`, {
            onSuccess: () => {
                setShowDeleteModal(false);
                setSelectedAppointment(null);
                setShowAlert(true);
                setTimeout(() => setShowAlert(false), 3000);
            },
        });
    };

    const filteredAppointments = appointments.filter(appointment => {
        const matchesSearch = 
            appointment.patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            appointment.doctor.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            appointment.patient.phone.includes(searchTerm);
        const matchesStatus = !filterStatus || appointment.status === filterStatus;
        const matchesDate = !filterDate || appointment.appointment_date === filterDate;
        return matchesSearch && matchesStatus && matchesDate;
    });

    return (
        <AuthenticatedLayout header="إدارة المواعيد">
            <Head title="إدارة المواعيد" />

            {/* Success Alert */}
            {showAlert && (
                <div className="mb-6">
                    <Alert variant="success" dismissible onDismiss={() => setShowAlert(false)}>
                        تم تحديث الموعد بنجاح
                    </Alert>
                </div>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                    title="مواعيد اليوم"
                    value={stats.appointments_today}
                    icon={CalendarIcon}
                    variant="primary"
                />
                <StatCard
                    title="مواعيد مؤكدة"
                    value={stats.confirmed_appointments}
                    icon={CheckCircleIcon}
                    variant="success"
                />
                <StatCard
                    title="مواعيد معلقة"
                    value={stats.pending_appointments}
                    icon={ClockIcon}
                    variant="warning"
                />
                <StatCard
                    title="مواعيد مكتملة"
                    value={stats.completed_appointments}
                    icon={UserCircleIcon}
                    variant="info"
                />
            </div>

            {/* Main Card */}
            <Card>
                <Card.Header>
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">قائمة المواعيد</h2>
                            <p className="text-sm text-gray-600 mt-1">
                                إدارة مواعيد المرضى والجداول الزمنية
                            </p>
                        </div>
                        <Button onClick={() => setShowModal(true)}>
                            <PlusIcon className="h-4 w-4 ml-2" />
                            حجز موعد جديد
                        </Button>
                    </div>
                </Card.Header>

                <Card.Body>
                    {/* Filters */}
                    <div className="flex flex-col lg:flex-row gap-4 mb-6">
                        <div className="flex-1">
                            <div className="relative">
                                <Input
                                    placeholder="بحث عن موعد..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pr-10"
                                />
                                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            </div>
                        </div>
                        <div className="w-full lg:w-48">
                            <Input
                                type="date"
                                value={filterDate}
                                onChange={(e) => setFilterDate(e.target.value)}
                            />
                        </div>
                        <div className="w-full lg:w-48">
                            <Select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                options={[
                                    { value: '', label: 'جميع الحالات' },
                                    { value: 'scheduled', label: 'مجدول' },
                                    { value: 'confirmed', label: 'مؤكد' },
                                    { value: 'completed', label: 'مكتمل' },
                                    { value: 'cancelled', label: 'ملغي' },
                                    { value: 'no-show', label: 'لم يحضر' },
                                ]}
                            />
                        </div>
                    </div>

                    {/* Table */}
                    <Table
                        columns={columns}
                        data={filteredAppointments}
                        emptyMessage="لا توجد مواعيد"
                    />
                </Card.Body>
            </Card>

            {/* Add/Edit Modal */}
            <Modal
                isOpen={showModal}
                onClose={() => {
                    setShowModal(false);
                    setSelectedAppointment(null);
                }}
                title={selectedAppointment ? 'تعديل الموعد' : 'حجز موعد جديد'}
                size="lg"
            >
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Select
                            label="المريض"
                            options={patients.map(p => ({ value: p.id, label: p.name }))}
                            required
                        />
                        <Select
                            label="التخصص"
                            options={specializations.map(s => ({ value: s.id, label: s.name }))}
                            required
                        />
                        <Select
                            label="الطبيب"
                            options={doctors.map(d => ({ value: d.id, label: `د. ${d.user.name}` }))}
                            required
                        />
                        <Input
                            label="تاريخ الموعد"
                            type="date"
                            required
                        />
                        <Input
                            label="وقت الموعد"
                            type="time"
                            required
                        />
                        <Select
                            label="نوع الموعد"
                            options={[
                                { value: 'consultation', label: 'استشارة' },
                                { value: 'follow_up', label: 'متابعة' },
                                { value: 'emergency', label: 'طوارئ' },
                                { value: 'surgery', label: 'جراحة' },
                            ]}
                            required
                        />
                        <Input
                            label="الرسوم"
                            type="number"
                            placeholder="0.00"
                        />
                        <Select
                            label="الحالة الدفع"
                            options={[
                                { value: 'unpaid', label: 'غير مدفوع' },
                                { value: 'paid', label: 'مدفوع' },
                            ]}
                        />
                    </div>
                    <div>
                        <label className="form-label">ملاحظات</label>
                        <textarea
                            className="form-textarea"
                            rows={3}
                            placeholder="أدخل أي ملاحظات إضافية"
                        />
                    </div>
                </div>

                <Modal.Footer>
                    <div className="flex justify-end space-x-3 space-x-reverse">
                        <Button
                            variant="outline"
                            onClick={() => setShowModal(false)}
                        >
                            إلغاء
                        </Button>
                        <Button>
                            {selectedAppointment ? 'تحديث' : 'حجز'}
                        </Button>
                    </div>
                </Modal.Footer>
            </Modal>

            {/* Delete Modal */}
            <Modal
                isOpen={showDeleteModal}
                onClose={() => {
                    setShowDeleteModal(false);
                    setSelectedAppointment(null);
                }}
                title="تأكيد الحذف"
                size="sm"
            >
                <div className="text-center">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                        <TrashIcon className="h-6 w-6 text-red-600" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        حذف الموعد
                    </h3>
                    <p className="text-sm text-gray-500">
                        هل أنت متأكد من حذف موعد "{selectedAppointment?.patient.name}"؟
                        لا يمكن التراجع عن هذا الإجراء.
                    </p>
                </div>

                <Modal.Footer>
                    <div className="flex justify-center space-x-3 space-x-reverse">
                        <Button
                            variant="outline"
                            onClick={() => setShowDeleteModal(false)}
                        >
                            إلغاء
                        </Button>
                        <Button variant="danger" onClick={confirmDelete}>
                            حذف
                        </Button>
                    </div>
                </Modal.Footer>
            </Modal>
        </AuthenticatedLayout>
    );
}