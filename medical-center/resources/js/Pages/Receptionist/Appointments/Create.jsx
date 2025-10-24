import React, { useState, useEffect } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Button, Card, Alert } from '@/Components';

export default function CreateAppointment({ patients, doctors, specializations }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        patient_id: '',
        doctor_id: '',
        specialization_id: '',
        appointment_date: '',
        appointment_time: '',
        type: 'consultation',
        notes: '',
        fee: '',
    });

    const [availableSlots, setAvailableSlots] = useState([]);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showNewPatientForm, setShowNewPatientForm] = useState(false);

    const appointmentTypes = [
        { value: 'consultation', label: 'استشارة', color: 'bg-blue-100 text-blue-800' },
        { value: 'follow_up', label: 'متابعة', color: 'bg-green-100 text-green-800' },
        { value: 'emergency', label: 'طوارئ', color: 'bg-red-100 text-red-800' },
        { value: 'surgery', label: 'جراحة', color: 'bg-purple-100 text-purple-800' },
    ];

    // Update fee when doctor changes
    useEffect(() => {
        if (data.doctor_id) {
            const doctor = doctors.find(d => d.id === parseInt(data.doctor_id));
            if (doctor) {
                setData('fee', doctor.consultation_fee);
            }
        }
    }, [data.doctor_id, doctors, setData]);

    // Update specialization when doctor changes
    useEffect(() => {
        if (data.doctor_id) {
            const doctor = doctors.find(d => d.id === parseInt(data.doctor_id));
            if (doctor) {
                setData('specialization_id', doctor.specialization_id);
            }
        }
    }, [data.doctor_id, doctors, setData]);

    // Fetch available slots
    const fetchAvailableSlots = async () => {
        if (!data.doctor_id || !data.appointment_date) {
            setAvailableSlots([]);
            return;
        }

        setLoadingSlots(true);
        try {
            const response = await fetch(
                route('receptionist.appointments.available-slots', {
                    doctor_id: data.doctor_id,
                    date: data.appointment_date,
                })
            );
            const slots = await response.json();
            setAvailableSlots(slots);
        } catch (error) {
            console.error('Error fetching available slots:', error);
            setAvailableSlots([]);
        } finally {
            setLoadingSlots(false);
        }
    };

    useEffect(() => {
        fetchAvailableSlots();
    }, [data.doctor_id, data.appointment_date]);

    const submit = (e) => {
        e.preventDefault();
        post(route('receptionist.appointments.store'), {
            onSuccess: () => {
                reset();
                setShowNewPatientForm(false);
            },
        });
    };

    const getTodayDate = () => {
        return new Date().toISOString().split('T')[0];
    };

    const filteredPatients = patients.filter(patient =>
        patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        patient.phone.includes(searchQuery) ||
        patient.national_id.includes(searchQuery)
    );

    return (
        <AuthenticatedLayout header="حجز موعد جديد">
            <Head title="حجز موعد جديد" />

            <div className="max-w-4xl mx-auto">
                <Card>
                    <Card.Header>
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-semibold text-gray-900">
                                بيانات الموعد
                            </h2>
                            <Link href={route('receptionist.appointments.index')}>
                                <Button variant="outline" size="sm">
                                    العودة
                                </Button>
                            </Link>
                        </div>
                    </Card.Header>

                    <Card.Body>
                        <form onSubmit={submit} className="space-y-6">
                            {/* Patient Selection */}
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-medium text-gray-900">اختيار المريض</h3>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setShowNewPatientForm(!showNewPatientForm)}
                                    >
                                        {showNewPatientForm ? 'اختيار مريد موجود' : '+ مريض جديد'}
                                    </Button>
                                </div>

                                {!showNewPatientForm ? (
                                    <div>
                                        {/* Search */}
                                        <div className="mb-4">
                                            <input
                                                type="text"
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                className="form-input"
                                                placeholder="ابحث بالاسم، الهاتف، أو الرقم الوطني..."
                                            />
                                        </div>

                                        {/* Patient List */}
                                        <div className="border border-gray-200 rounded-lg max-h-60 overflow-y-auto">
                                            {filteredPatients.length > 0 ? (
                                                <div className="divide-y divide-gray-200">
                                                    {filteredPatients.map((patient) => (
                                                        <label
                                                            key={patient.id}
                                                            className="flex items-center p-4 hover:bg-gray-50 cursor-pointer"
                                                        >
                                                            <input
                                                                type="radio"
                                                                name="patient_id"
                                                                value={patient.id}
                                                                checked={data.patient_id === patient.id.toString()}
                                                                onChange={(e) => setData('patient_id', e.target.value)}
                                                                className="ml-3"
                                                            />
                                                            <div className="flex-1">
                                                                <div className="font-medium text-gray-900">
                                                                    {patient.name}
                                                                </div>
                                                                <div className="text-sm text-gray-500">
                                                                    {patient.phone} • {patient.national_id}
                                                                </div>
                                                                <div className="text-xs text-gray-400">
                                                                    {patient.gender === 'male' ? 'ذكر' : 'أنثى'} • 
                                                                    {patient.age ? ` ${patient.age} سنة` : ''}
                                                                </div>
                                                            </div>
                                                        </label>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="p-8 text-center text-gray-500">
                                                    لا يوجد مرضى مطابقين للبحث
                                                </div>
                                            )}
                                        </div>
                                        {errors.patient_id && (
                                            <p className="mt-1 text-sm text-red-600">{errors.patient_id}</p>
                                        )}
                                    </div>
                                ) : (
                                    <Alert variant="info">
                                        <div className="text-sm">
                                            <p className="font-medium mb-1">مريض جديد</p>
                                            <p>سيتم توجيهك إلى صفحة تسجيل المريض الجديد بعد حجز الموعد.</p>
                                        </div>
                                    </Alert>
                                )}
                            </div>

                            {/* Doctor and Specialization */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="form-label">الطبيب *</label>
                                    <select
                                        value={data.doctor_id}
                                        onChange={(e) => setData('doctor_id', e.target.value)}
                                        className="form-select"
                                        required
                                    >
                                        <option value="">اختر الطبيب</option>
                                        {doctors.map((doctor) => (
                                            <option key={doctor.id} value={doctor.id}>
                                                د. {doctor.user.name} - {doctor.specialization?.name}
                                                {doctor.is_available ? '' : ' (غير متاح)'}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.doctor_id && (
                                        <p className="mt-1 text-sm text-red-600">{errors.doctor_id}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="form-label">التخصص</label>
                                    <select
                                        value={data.specialization_id}
                                        onChange={(e) => setData('specialization_id', e.target.value)}
                                        className="form-select"
                                        disabled={!!data.doctor_id}
                                    >
                                        <option value="">اختر التخصص</option>
                                        {specializations.map((spec) => (
                                            <option key={spec.id} value={spec.id}>
                                                {spec.name}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.specialization_id && (
                                        <p className="mt-1 text-sm text-red-600">{errors.specialization_id}</p>
                                    )}
                                    {data.doctor_id && (
                                        <p className="mt-1 text-xs text-gray-500">
                                            يتم تحديد التخصص تلقائياً عند اختيار الطبيب
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Date and Time */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="form-label">التاريخ *</label>
                                    <input
                                        type="date"
                                        value={data.appointment_date}
                                        onChange={(e) => setData('appointment_date', e.target.value)}
                                        className="form-input"
                                        min={getTodayDate()}
                                        required
                                    />
                                    {errors.appointment_date && (
                                        <p className="mt-1 text-sm text-red-600">{errors.appointment_date}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="form-label">الوقت *</label>
                                    <select
                                        value={data.appointment_time}
                                        onChange={(e) => setData('appointment_time', e.target.value)}
                                        className="form-select"
                                        required
                                        disabled={loadingSlots || !data.doctor_id || !data.appointment_date}
                                    >
                                        <option value="">اختر الوقت</option>
                                        {availableSlots.map((slot) => (
                                            <option key={slot} value={slot}>
                                                {slot}
                                            </option>
                                        ))}
                                    </select>
                                    {loadingSlots && (
                                        <p className="mt-1 text-sm text-gray-500">جاري تحميل الأوقات المتاحة...</p>
                                    )}
                                    {errors.appointment_time && (
                                        <p className="mt-1 text-sm text-red-600">{errors.appointment_time}</p>
                                    )}
                                </div>
                            </div>

                            {/* Appointment Type and Fee */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="form-label">نوع الموعد *</label>
                                    <select
                                        value={data.type}
                                        onChange={(e) => setData('type', e.target.value)}
                                        className="form-select"
                                        required
                                    >
                                        <option value="">اختر النوع</option>
                                        {appointmentTypes.map((type) => (
                                            <option key={type.value} value={type.value}>
                                                {type.label}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.type && (
                                        <p className="mt-1 text-sm text-red-600">{errors.type}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="form-label">الرسوم (ريال) *</label>
                                    <input
                                        type="number"
                                        value={data.fee}
                                        onChange={(e) => setData('fee', e.target.value)}
                                        className="form-input"
                                        placeholder="0.00"
                                        min="0"
                                        step="0.01"
                                        required
                                    />
                                    {errors.fee && (
                                        <p className="mt-1 text-sm text-red-600">{errors.fee}</p>
                                    )}
                                    {data.doctor_id && (
                                        <p className="mt-1 text-xs text-gray-500">
                                            رسوم الاستشارة الافتراضية: {doctors.find(d => d.id === parseInt(data.doctor_id))?.consultation_fee} ريال
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Notes */}
                            <div>
                                <label className="form-label">ملاحظات</label>
                                <textarea
                                    value={data.notes}
                                    onChange={(e) => setData('notes', e.target.value)}
                                    className="form-textarea"
                                    rows={4}
                                    placeholder="أي ملاحظات إضافية حول الموعد..."
                                />
                                {errors.notes && (
                                    <p className="mt-1 text-sm text-red-600">{errors.notes}</p>
                                )}
                            </div>

                            {/* Appointment Summary */}
                            {data.patient_id && data.doctor_id && data.appointment_date && data.appointment_time && (
                                <Alert variant="success">
                                    <div className="text-sm">
                                        <p className="font-medium mb-2">ملخص الموعد:</p>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-gray-600">
                                            <div>
                                                <span className="font-medium">المريض:</span>{' '}
                                                {patients.find(p => p.id === parseInt(data.patient_id))?.name}
                                            </div>
                                            <div>
                                                <span className="font-medium">الطبيب:</span>{' '}
                                                د. {doctors.find(d => d.id === parseInt(data.doctor_id))?.user?.name}
                                            </div>
                                            <div>
                                                <span className="font-medium">التاريخ:</span>{' '}
                                                {new Date(data.appointment_date).toLocaleDateString('ar-SA')}
                                            </div>
                                            <div>
                                                <span className="font-medium">الوقت:</span>{' '}
                                                {data.appointment_time}
                                            </div>
                                            <div>
                                                <span className="font-medium">النوع:</span>{' '}
                                                {appointmentTypes.find(t => t.value === data.type)?.label}
                                            </div>
                                            <div>
                                                <span className="font-medium">الرسوم:</span>{' '}
                                                {data.fee} ريال
                                            </div>
                                        </div>
                                    </div>
                                </Alert>
                            )}

                            {/* Form Actions */}
                            <div className="flex items-center justify-end space-x-4 space-x-reverse">
                                <Link href={route('receptionist.appointments.index')}>
                                    <Button variant="outline" type="button">
                                        إلغاء
                                    </Button>
                                </Link>
                                <Button 
                                    type="submit" 
                                    disabled={processing}
                                    className="min-w-[120px]"
                                >
                                    {processing ? 'جاري الحجز...' : 'حجز الموعد'}
                                </Button>
                            </div>
                        </form>
                    </Card.Body>
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}