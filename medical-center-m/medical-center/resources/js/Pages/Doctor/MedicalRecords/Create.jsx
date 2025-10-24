import React, { useState, useEffect } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Button, Card, Alert } from '@/Components';

export default function CreateMedicalRecord({ patients, todayAppointments }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        patient_id: '',
        appointment_id: '',
        chief_complaint: '',
        history_of_present_illness: '',
        past_medical_history: '',
        family_history: '',
        social_history: '',
        allergies: '',
        medications: '',
        vital_signs: {
            blood_pressure: '',
            heart_rate: '',
            respiratory_rate: '',
            temperature: '',
            weight: '',
            height: '',
        },
        physical_examination: '',
        diagnosis: '',
        treatment_plan: '',
        follow_up_instructions: '',
        notes: '',
    });

    const [selectedPatient, setSelectedPatient] = useState(null);

    // Update patient info when selection changes
    useEffect(() => {
        if (data.patient_id) {
            const patient = patients.find(p => p.id === parseInt(data.patient_id));
            setSelectedPatient(patient);
        } else {
            setSelectedPatient(null);
        }
    }, [data.patient_id, patients]);

    // Auto-fill appointment when patient is selected from today's appointments
    const handleAppointmentSelect = (appointment) => {
        setData('patient_id', appointment.patient_id);
        setData('appointment_id', appointment.id);
        setSelectedPatient(appointment.patient);
    };

    const handleVitalSignChange = (field, value) => {
        setData('vital_signs', {
            ...data.vital_signs,
            [field]: value,
        });
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('doctor.medical-records.store'), {
            onSuccess: () => reset(),
        });
    };

    return (
        <AuthenticatedLayout header="إنشاء سجل طبي جديد">
            <Head title="إنشاء سجل طبي جديد" />

            <div className="max-w-6xl mx-auto">
                {/* Today's Appointments Quick Access */}
                {todayAppointments.length > 0 && (
                    <Card className="mb-6">
                        <Card.Header>
                            <h3 className="text-lg font-semibold text-gray-900">
                                مواعيد اليوم - وصول سريع
                            </h3>
                        </Card.Header>
                        <Card.Body>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {todayAppointments.map((appointment) => (
                                    <div
                                        key={appointment.id}
                                        className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                                        onClick={() => handleAppointmentSelect(appointment)}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <h4 className="font-medium text-gray-900">
                                                {appointment.patient.name}
                                            </h4>
                                            <span className="text-sm text-gray-500">
                                                {appointment.appointment_time}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600">
                                            {appointment.patient.phone}
                                        </p>
                                        <div className="mt-2">
                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                {appointment.specialization.name}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card.Body>
                    </Card>
                )}

                <Card>
                    <Card.Header>
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-semibold text-gray-900">
                                بيانات السجل الطبي
                            </h2>
                            <Link href={route('doctor.medical-records.index')}>
                                <Button variant="outline" size="sm">
                                    العودة
                                </Button>
                            </Link>
                        </div>
                    </Card.Header>

                    <Card.Body>
                        <form onSubmit={submit} className="space-y-6">
                            {/* Patient Selection */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="form-label">المريض *</label>
                                    <select
                                        value={data.patient_id}
                                        onChange={(e) => setData('patient_id', e.target.value)}
                                        className="form-select"
                                        required
                                    >
                                        <option value="">اختر المريض</option>
                                        {patients.map((patient) => (
                                            <option key={patient.id} value={patient.id}>
                                                {patient.name} - {patient.phone}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.patient_id && (
                                        <p className="mt-1 text-sm text-red-600">{errors.patient_id}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="form-label">الموعد (اختياري)</label>
                                    <select
                                        value={data.appointment_id}
                                        onChange={(e) => setData('appointment_id', e.target.value)}
                                        className="form-select"
                                    >
                                        <option value="">اختر الموعد</option>
                                        {todayAppointments
                                            .filter(apt => !data.patient_id || apt.patient_id === parseInt(data.patient_id))
                                            .map((appointment) => (
                                            <option key={appointment.id} value={appointment.id}>
                                                {appointment.appointment_time} - {appointment.patient.name}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.appointment_id && (
                                        <p className="mt-1 text-sm text-red-600">{errors.appointment_id}</p>
                                    )}
                                </div>
                            </div>

                            {/* Patient Info Display */}
                            {selectedPatient && (
                                <Alert variant="info">
                                    <div className="text-sm">
                                        <p className="font-medium mb-2">بيانات المريض:</p>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-gray-600">
                                            <div>
                                                <span className="font-medium">الاسم:</span> {selectedPatient.name}
                                            </div>
                                            <div>
                                                <span className="font-medium">الهاتف:</span> {selectedPatient.phone}
                                            </div>
                                            <div>
                                                <span className="font-medium">العمر:</span> {selectedPatient.age} سنة
                                            </div>
                                            <div>
                                                <span className="font-medium">الجنس:</span> {selectedPatient.gender === 'male' ? 'ذكر' : 'أنثى'}
                                            </div>
                                            <div>
                                                <span className="font-medium">فصيلة الدم:</span> {selectedPatient.blood_type || 'غير محدد'}
                                            </div>
                                            <div>
                                                <span className="font-medium">الحساسية:</span> {selectedPatient.allergies || 'لا يوجد'}
                                            </div>
                                        </div>
                                    </div>
                                </Alert>
                            )}

                            {/* Chief Complaint */}
                            <div>
                                <label className="form-label">الشكوى الرئيسية *</label>
                                <textarea
                                    value={data.chief_complaint}
                                    onChange={(e) => setData('chief_complaint', e.target.value)}
                                    className="form-textarea"
                                    rows={3}
                                    placeholder="صف الشكوى الرئيسية للمريض..."
                                    required
                                />
                                {errors.chief_complaint && (
                                    <p className="mt-1 text-sm text-red-600">{errors.chief_complaint}</p>
                                )}
                            </div>

                            {/* History Sections */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="form-label">تاريخ المرض الحالي</label>
                                    <textarea
                                        value={data.history_of_present_illness}
                                        onChange={(e) => setData('history_of_present_illness', e.target.value)}
                                        className="form-textarea"
                                        rows={4}
                                        placeholder="تفاصيل تاريخ المرض الحالي..."
                                    />
                                    {errors.history_of_present_illness && (
                                        <p className="mt-1 text-sm text-red-600">{errors.history_of_present_illness}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="form-label">التاريخ المرضي السابق</label>
                                    <textarea
                                        value={data.past_medical_history}
                                        onChange={(e) => setData('past_medical_history', e.target.value)}
                                        className="form-textarea"
                                        rows={4}
                                        placeholder="الأمراض السابقة، العمليات الجراحية، الأدوية المزمنة..."
                                    />
                                    {errors.past_medical_history && (
                                        <p className="mt-1 text-sm text-red-600">{errors.past_medical_history}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="form-label">التاريخ العائلي</label>
                                    <textarea
                                        value={data.family_history}
                                        onChange={(e) => setData('family_history', e.target.value)}
                                        className="form-textarea"
                                        rows={4}
                                        placeholder="الأمراض الوراثية في العائلة..."
                                    />
                                    {errors.family_history && (
                                        <p className="mt-1 text-sm text-red-600">{errors.family_history}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="form-label">التاريخ الاجتماعي</label>
                                    <textarea
                                        value={data.social_history}
                                        onChange={(e) => setData('social_history', e.target.value)}
                                        className="form-textarea"
                                        rows={4}
                                        placeholder="عادات التدخين، الكحول، العمل، الحالة الاجتماعية..."
                                    />
                                    {errors.social_history && (
                                        <p className="mt-1 text-sm text-red-600">{errors.social_history}</p>
                                    )}
                                </div>
                            </div>

                            {/* Allergies and Medications */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="form-label">الحساسية</label>
                                    <textarea
                                        value={data.allergies}
                                        onChange={(e) => setData('allergies', e.target.value)}
                                        className="form-textarea"
                                        rows={3}
                                        placeholder="حساسية الأدوية، الأطعمة، أو غيرها..."
                                    />
                                    {errors.allergies && (
                                        <p className="mt-1 text-sm text-red-600">{errors.allergies}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="form-label">الأدوية الحالية</label>
                                    <textarea
                                        value={data.medications}
                                        onChange={(e) => setData('medications', e.target.value)}
                                        className="form-textarea"
                                        rows={3}
                                        placeholder="الأدوية التي يتناولها المريض حالياً..."
                                    />
                                    {errors.medications && (
                                        <p className="mt-1 text-sm text-red-600">{errors.medications}</p>
                                    )}
                                </div>
                            </div>

                            {/* Vital Signs */}
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-4">العلامات الحيوية</h3>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                                    <div>
                                        <label className="form-label">ضغط الدم</label>
                                        <input
                                            type="text"
                                            value={data.vital_signs.blood_pressure}
                                            onChange={(e) => handleVitalSignChange('blood_pressure', e.target.value)}
                                            className="form-input"
                                            placeholder="120/80"
                                        />
                                    </div>
                                    <div>
                                        <label className="form-label">نبض القلب</label>
                                        <input
                                            type="number"
                                            value={data.vital_signs.heart_rate}
                                            onChange={(e) => handleVitalSignChange('heart_rate', e.target.value)}
                                            className="form-input"
                                            placeholder="72"
                                            min="0"
                                            max="300"
                                        />
                                    </div>
                                    <div>
                                        <label className="form-label">معدل التنفس</label>
                                        <input
                                            type="number"
                                            value={data.vital_signs.respiratory_rate}
                                            onChange={(e) => handleVitalSignChange('respiratory_rate', e.target.value)}
                                            className="form-input"
                                            placeholder="16"
                                            min="0"
                                            max="100"
                                        />
                                    </div>
                                    <div>
                                        <label className="form-label">درجة الحرارة</label>
                                        <input
                                            type="number"
                                            value={data.vital_signs.temperature}
                                            onChange={(e) => handleVitalSignChange('temperature', e.target.value)}
                                            className="form-input"
                                            placeholder="37.0"
                                            step="0.1"
                                            min="30"
                                            max="45"
                                        />
                                    </div>
                                    <div>
                                        <label className="form-label">الوزن (كجم)</label>
                                        <input
                                            type="number"
                                            value={data.vital_signs.weight}
                                            onChange={(e) => handleVitalSignChange('weight', e.target.value)}
                                            className="form-input"
                                            placeholder="70"
                                            min="0"
                                        />
                                    </div>
                                    <div>
                                        <label className="form-label">الطول (سم)</label>
                                        <input
                                            type="number"
                                            value={data.vital_signs.height}
                                            onChange={(e) => handleVitalSignChange('height', e.target.value)}
                                            className="form-input"
                                            placeholder="170"
                                            min="0"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Physical Examination */}
                            <div>
                                <label className="form-label">الفحص السريري</label>
                                <textarea
                                    value={data.physical_examination}
                                    onChange={(e) => setData('physical_examination', e.target.value)}
                                    className="form-textarea"
                                    rows={6}
                                    placeholder="نتائج الفحص السريري التفصيلي..."
                                />
                                {errors.physical_examination && (
                                    <p className="mt-1 text-sm text-red-600">{errors.physical_examination}</p>
                                )}
                            </div>

                            {/* Diagnosis and Treatment */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="form-label">التشخيص *</label>
                                    <textarea
                                        value={data.diagnosis}
                                        onChange={(e) => setData('diagnosis', e.target.value)}
                                        className="form-textarea"
                                        rows={4}
                                        placeholder="التشخيص النهائي..."
                                        required
                                    />
                                    {errors.diagnosis && (
                                        <p className="mt-1 text-sm text-red-600">{errors.diagnosis}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="form-label">خطة العلاج *</label>
                                    <textarea
                                        value={data.treatment_plan}
                                        onChange={(e) => setData('treatment_plan', e.target.value)}
                                        className="form-textarea"
                                        rows={4}
                                        placeholder="خطة العلاج الموصى بها..."
                                        required
                                    />
                                    {errors.treatment_plan && (
                                        <p className="mt-1 text-sm text-red-600">{errors.treatment_plan}</p>
                                    )}
                                </div>
                            </div>

                            {/* Follow-up and Notes */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="form-label">تعليمات المتابعة</label>
                                    <textarea
                                        value={data.follow_up_instructions}
                                        onChange={(e) => setData('follow_up_instructions', e.target.value)}
                                        className="form-textarea"
                                        rows={4}
                                        placeholder="تعليمات للمريض للمتابعة..."
                                    />
                                    {errors.follow_up_instructions && (
                                        <p className="mt-1 text-sm text-red-600">{errors.follow_up_instructions}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="form-label">ملاحظات إضافية</label>
                                    <textarea
                                        value={data.notes}
                                        onChange={(e) => setData('notes', e.target.value)}
                                        className="form-textarea"
                                        rows={4}
                                        placeholder="أي ملاحظات إضافية..."
                                    />
                                    {errors.notes && (
                                        <p className="mt-1 text-sm text-red-600">{errors.notes}</p>
                                    )}
                                </div>
                            </div>

                            {/* Form Actions */}
                            <div className="flex items-center justify-end space-x-4 space-x-reverse">
                                <Link href={route('doctor.medical-records.index')}>
                                    <Button variant="outline" type="button">
                                        إلغاء
                                    </Button>
                                </Link>
                                <Button 
                                    type="submit" 
                                    disabled={processing}
                                    className="min-w-[120px]"
                                >
                                    {processing ? 'جاري الحفظ...' : 'حفظ السجل الطبي'}
                                </Button>
                            </div>
                        </form>
                    </Card.Body>
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}