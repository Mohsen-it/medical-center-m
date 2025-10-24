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
    UserCircleIcon,
    StarIcon,
    CalendarIcon,
    CurrencyDollarIcon,
    AcademicCapIcon
} from '@heroicons/react/24/outline';

export default function DoctorsIndex({ doctors, stats, specializations }) {
    const [showModal, setShowModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterSpecialization, setFilterSpecialization] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [showAlert, setShowAlert] = useState(false);

    const columns = [
        {
            key: 'user',
            title: 'الطبيب',
            render: (user) => (
                <div className="flex items-center">
                    <div className="h-10 w-10 flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                            <span className="text-primary-600 font-medium">
                                {user.name.charAt(0)}
                            </span>
                        </div>
                    </div>
                    <div className="mr-3">
                        <div className="text-sm font-medium text-gray-900">د. {user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                </div>
            ),
        },
        {
            key: 'specialization',
            title: 'التخصص',
            render: (specialization) => (
                <Badge variant="primary">{specialization.name}</Badge>
            ),
        },
        {
            key: 'experience_years',
            title: 'الخبرة',
            render: (value) => (
                <div className="flex items-center">
                    <AcademicCapIcon className="h-4 w-4 text-gray-400 ml-2" />
                    <span className="text-sm text-gray-900">{value} سنوات</span>
                </div>
            ),
        },
        {
            key: 'consultation_fee',
            title: 'رسوم الاستشارة',
            render: (value) => (
                <div className="flex items-center">
                    <CurrencyDollarIcon className="h-4 w-4 text-gray-400 ml-2" />
                    <span className="text-sm font-medium text-gray-900">{value} ريال</span>
                </div>
            ),
        },
        {
            key: 'rating',
            title: 'التقييم',
            render: (value, doctor) => (
                <div className="flex items-center">
                    <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                            <StarIcon
                                key={i}
                                className={`h-4 w-4 ${
                                    i < Math.floor(value)
                                        ? 'text-yellow-400'
                                        : 'text-gray-300'
                                }`}
                            />
                        ))}
                    </div>
                    <span className="text-sm text-gray-600 mr-2">
                        {value.toFixed(1)} ({doctor.rating_count})
                    </span>
                </div>
            ),
        },
        {
            key: 'is_available',
            title: 'الحالة',
            render: (value) => (
                <Badge variant={value ? 'success' : 'gray'}>
                    {value ? 'متاح' : 'غير متاح'}
                </Badge>
            ),
        },
        {
            key: 'appointments_count',
            title: 'المواعيد',
            render: (value) => (
                <div className="flex items-center">
                    <CalendarIcon className="h-4 w-4 text-gray-400 ml-2" />
                    <span className="text-sm text-gray-900">{value} موعد</span>
                </div>
            ),
        },
        {
            key: 'actions',
            title: 'الإجراءات',
            render: (_, doctor) => (
                <div className="flex items-center space-x-2 space-x-reverse">
                    <Link href={`/admin/doctors/${doctor.id}`}>
                        <Button variant="outline" size="sm">
                            <EyeIcon className="h-4 w-4" />
                        </Button>
                    </Link>
                    <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEdit(doctor)}
                    >
                        <PencilIcon className="h-4 w-4" />
                    </Button>
                    <Button 
                        variant="danger" 
                        size="sm"
                        onClick={() => handleDelete(doctor)}
                    >
                        <TrashIcon className="h-4 w-4" />
                    </Button>
                </div>
            ),
        },
    ];

    const handleEdit = (doctor) => {
        setSelectedDoctor(doctor);
        setShowModal(true);
    };

    const handleDelete = (doctor) => {
        setSelectedDoctor(doctor);
        setShowDeleteModal(true);
    };

    const confirmDelete = () => {
        router.delete(`/admin/doctors/${selectedDoctor.id}`, {
            onSuccess: () => {
                setShowDeleteModal(false);
                setSelectedDoctor(null);
                setShowAlert(true);
                setTimeout(() => setShowAlert(false), 3000);
            },
        });
    };

    const filteredDoctors = doctors.filter(doctor => {
        const matchesSearch = 
            doctor.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            doctor.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            doctor.specialization.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesSpecialization = !filterSpecialization || doctor.specialization_id === filterSpecialization;
        const matchesStatus = !filterStatus || 
            (filterStatus === 'available' && doctor.is_available) ||
            (filterStatus === 'unavailable' && !doctor.is_available);
        return matchesSearch && matchesSpecialization && matchesStatus;
    });

    return (
        <AuthenticatedLayout header="إدارة الأطباء">
            <Head title="إدارة الأطباء" />

            {/* Success Alert */}
            {showAlert && (
                <div className="mb-6">
                    <Alert variant="success" dismissible onDismiss={() => setShowAlert(false)}>
                        تم تحديث بيانات الطبيب بنجاح
                    </Alert>
                </div>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                    title="إجمالي الأطباء"
                    value={stats.total_doctors}
                    icon={UserCircleIcon}
                    variant="primary"
                />
                <StatCard
                    title="الأطباء النشطون"
                    value={stats.active_doctors}
                    icon={UserCircleIcon}
                    variant="success"
                />
                <StatCard
                    title="متوسط التقييم"
                    value={stats.average_rating}
                    icon={StarIcon}
                    variant="warning"
                />
                <StatCard
                    title="مواعيد اليوم"
                    value={stats.appointments_today}
                    icon={CalendarIcon}
                    variant="info"
                />
            </div>

            {/* Main Card */}
            <Card>
                <Card.Header>
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">قائمة الأطباء</h2>
                            <p className="text-sm text-gray-600 mt-1">
                                إدارة بيانات الأطباء وجداول عملهم
                            </p>
                        </div>
                        <Button onClick={() => setShowModal(true)}>
                            <PlusIcon className="h-4 w-4 ml-2" />
                            إضافة طبيب جديد
                        </Button>
                    </div>
                </Card.Header>

                <Card.Body>
                    {/* Filters */}
                    <div className="flex flex-col lg:flex-row gap-4 mb-6">
                        <div className="flex-1">
                            <div className="relative">
                                <Input
                                    placeholder="بحث عن طبيب..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pr-10"
                                />
                                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            </div>
                        </div>
                        <div className="w-full lg:w-48">
                            <Select
                                value={filterSpecialization}
                                onChange={(e) => setFilterSpecialization(e.target.value)}
                                options={[
                                    { value: '', label: 'جميع التخصصات' },
                                    ...specializations.map(s => ({ value: s.id, label: s.name }))
                                ]}
                            />
                        </div>
                        <div className="w-full lg:w-48">
                            <Select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                options={[
                                    { value: '', label: 'جميع الحالات' },
                                    { value: 'available', label: 'متاح' },
                                    { value: 'unavailable', label: 'غير متاح' },
                                ]}
                            />
                        </div>
                    </div>

                    {/* Table */}
                    <Table
                        columns={columns}
                        data={filteredDoctors}
                        emptyMessage="لا يوجد أطباء"
                    />
                </Card.Body>
            </Card>

            {/* Add/Edit Modal */}
            <Modal
                isOpen={showModal}
                onClose={() => {
                    setShowModal(false);
                    setSelectedDoctor(null);
                }}
                title={selectedDoctor ? 'تعديل بيانات الطبيب' : 'إضافة طبيب جديد'}
                size="lg"
            >
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input
                            label="الاسم الكامل"
                            placeholder="أدخل اسم الطبيب"
                            required
                        />
                        <Input
                            label="البريد الإلكتروني"
                            type="email"
                            placeholder="أدخل البريد الإلكتروني"
                            required
                        />
                        <Input
                            label="رقم الهاتف"
                            placeholder="أدخل رقم الهاتف"
                            required
                        />
                        <Input
                            label="كلمة المرور"
                            type="password"
                            placeholder="أدخل كلمة المرور"
                            required={!selectedDoctor}
                        />
                        <Select
                            label="التخصص"
                            options={specializations.map(s => ({ value: s.id, label: s.name }))}
                            required
                        />
                        <Input
                            label="رقم الترخيص"
                            placeholder="أدخل رقم الترخيص الطبي"
                            required
                        />
                        <Input
                            label="سنوات الخبرة"
                            type="number"
                            placeholder="عدد سنوات الخبرة"
                            required
                        />
                        <Input
                            label="رسوم الاستشارة"
                            type="number"
                            placeholder="رسوم الاستشارة بالريال"
                            required
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="form-label">أيام العمل المتاحة</label>
                            <div className="space-y-2 mt-2">
                                {['السبت', 'الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'].map((day, index) => (
                                    <label key={day} className="flex items-center">
                                        <input
                                            type="checkbox"
                                            className="form-checkbox ml-2"
                                            defaultChecked={index < 5}
                                        />
                                        <span className="text-sm text-gray-700">{day}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="form-label">ساعات العمل</label>
                            <div className="grid grid-cols-2 gap-2 mt-2">
                                <Input
                                    type="time"
                                    placeholder="من"
                                    defaultValue="09:00"
                                />
                                <Input
                                    type="time"
                                    placeholder="إلى"
                                    defaultValue="17:00"
                                />
                            </div>
                        </div>
                    </div>
                    <div>
                        <label className="form-label">السيرة الذاتية</label>
                        <textarea
                            className="form-textarea"
                            rows={3}
                            placeholder="أدخل نبذة عن الطبيب وخبراته"
                        />
                    </div>
                    <div>
                        <label className="form-label">التعليم</label>
                        <textarea
                            className="form-textarea"
                            rows={2}
                            placeholder="المؤهلات العلمية والشهادات"
                        />
                    </div>
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            className="form-checkbox ml-2"
                            defaultChecked
                        />
                        <label className="text-sm text-gray-700">الطبيب متاح للمواعيد</label>
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
                            {selectedDoctor ? 'تحديث' : 'إضافة'}
                        </Button>
                    </div>
                </Modal.Footer>
            </Modal>

            {/* Delete Modal */}
            <Modal
                isOpen={showDeleteModal}
                onClose={() => {
                    setShowDeleteModal(false);
                    setSelectedDoctor(null);
                }}
                title="تأكيد الحذف"
                size="sm"
            >
                <div className="text-center">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                        <TrashIcon className="h-6 w-6 text-red-600" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        حذف الطبيب
                    </h3>
                    <p className="text-sm text-gray-500">
                        هل أنت متأكد من حذف الطبيب "د. {selectedDoctor?.user.name}"؟
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