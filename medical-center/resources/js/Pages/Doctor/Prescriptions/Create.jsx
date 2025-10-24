import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Button, Card, Alert } from '@/Components';

export default function CreatePrescription({ patients, medicalRecords }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        patient_id: '',
        medical_record_id: '',
        diagnosis: '',
        medications: [
            {
                medication_name: '',
                dosage: '',
                frequency: '',
                duration: '',
                instructions: '',
                quantity: 1,
                refills: 0,
            }
        ],
        instructions: '',
        notes: '',
        follow_up_date: '',
    });

    const [selectedPatient, setSelectedPatient] = useState(null);

    // Update patient info when selection changes
    const handlePatientChange = (patientId) => {
        setData('patient_id', patientId);
        const patient = patients.find(p => p.id === parseInt(patientId));
        setSelectedPatient(patient);
        
        // Reset medical record when patient changes
        setData('medical_record_id', '');
    };

    // Add new medication
    const addMedication = () => {
        setData('medications', [
            ...data.medications,
            {
                medication_name: '',
                dosage: '',
                frequency: '',
                duration: '',
                instructions: '',
                quantity: 1,
                refills: 0,
            }
        ]);
    };

    // Remove medication
    const removeMedication = (index) => {
        if (data.medications.length > 1) {
            const newMedications = data.medications.filter((_, i) => i !== index);
            setData('medications', newMedications);
        }
    };

    // Update medication field
    const updateMedication = (index, field, value) => {
        const newMedications = [...data.medications];
        newMedications[index][field] = value;
        setData('medications', newMedications);
    };

    // Auto-fill diagnosis from medical record
    const handleMedicalRecordChange = (recordId) => {
        setData('medical_record_id', recordId);
        const record = medicalRecords.find(r => r.id === parseInt(recordId));
        if (record) {
            setData('diagnosis', record.diagnosis);
            handlePatientChange(record.patient_id);
        }
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('doctor.prescriptions.store'), {
            onSuccess: () => reset(),
        });
    };

    const getTodayDate = () => {
        return new Date().toISOString().split('T')[0];
    };

    return (
        <AuthenticatedLayout header="إنشاء وصفة طبية جديدة">
            <Head title="إنشاء وصفة طبية جديدة" />

            <div className="max-w-6xl mx-auto">
                <Card>
                    <Card.Header>
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-semibold text-gray-900">
                                بيانات الوصفة الطبية
                            </h2>
                            <Link href={route('doctor.prescriptions.index')}>
                                <Button variant="outline" size="sm">
                                    العودة
                                </Button>
                            </Link>
                        </div>
                    </Card.Header>

                    <Card.Body>
                        <form onSubmit={submit} className="space-y-6">
                            {/* Patient and Medical Record Selection */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="form-label">المريض *</label>
                                    <select
                                        value={data.patient_id}
                                        onChange={(e) => handlePatientChange(e.target.value)}
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
                                    <label className="form-label">السجل الطبي (اختياري)</label>
                                    <select
                                        value={data.medical_record_id}
                                        onChange={(e) => handleMedicalRecordChange(e.target.value)}
                                        className="form-select"
                                    >
                                        <option value="">اختر السجل الطبي</option>
                                        {medicalRecords
                                            .filter(record => !data.patient_id || record.patient_id === parseInt(data.patient_id))
                                            .map((record) => (
                                            <option key={record.id} value={record.id}>
                                                {new Date(record.created_at).toLocaleDateString('ar-SA')} - {record.patient.name}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.medical_record_id && (
                                        <p className="mt-1 text-sm text-red-600">{errors.medical_record_id}</p>
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

                            {/* Diagnosis */}
                            <div>
                                <label className="form-label">التشخيص *</label>
                                <textarea
                                    value={data.diagnosis}
                                    onChange={(e) => setData('diagnosis', e.target.value)}
                                    className="form-textarea"
                                    rows={3}
                                    placeholder="التشخيص الطبي..."
                                    required
                                />
                                {errors.diagnosis && (
                                    <p className="mt-1 text-sm text-red-600">{errors.diagnosis}</p>
                                )}
                            </div>

                            {/* Medications */}
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-medium text-gray-900">الأدوية</h3>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={addMedication}
                                    >
                                        + إضافة دواء
                                    </Button>
                                </div>

                                <div className="space-y-6">
                                    {data.medications.map((medication, index) => (
                                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                                            <div className="flex items-center justify-between mb-4">
                                                <h4 className="font-medium text-gray-900">
                                                    الدواء #{index + 1}
                                                </h4>
                                                {data.medications.length > 1 && (
                                                    <Button
                                                        type="button"
                                                        variant="danger"
                                                        size="sm"
                                                        onClick={() => removeMedication(index)}
                                                    >
                                                        حذف
                                                    </Button>
                                                )}
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                <div>
                                                    <label className="form-label">اسم الدواء *</label>
                                                    <input
                                                        type="text"
                                                        value={medication.medication_name}
                                                        onChange={(e) => updateMedication(index, 'medication_name', e.target.value)}
                                                        className="form-input"
                                                        placeholder="اسم الدواء"
                                                        required
                                                    />
                                                </div>

                                                <div>
                                                    <label className="form-label">الجرعة *</label>
                                                    <input
                                                        type="text"
                                                        value={medication.dosage}
                                                        onChange={(e) => updateMedication(index, 'dosage', e.target.value)}
                                                        className="form-input"
                                                        placeholder="مثال: 500 مجم"
                                                        required
                                                    />
                                                </div>

                                                <div>
                                                    <label className="form-label">التكرار *</label>
                                                    <input
                                                        type="text"
                                                        value={medication.frequency}
                                                        onChange={(e) => updateMedication(index, 'frequency', e.target.value)}
                                                        className="form-input"
                                                        placeholder="مثال: مرتين يومياً"
                                                        required
                                                    />
                                                </div>

                                                <div>
                                                    <label className="form-label">المدة *</label>
                                                    <input
                                                        type="text"
                                                        value={medication.duration}
                                                        onChange={(e) => updateMedication(index, 'duration', e.target.value)}
                                                        className="form-input"
                                                        placeholder="مثال: 7 أيام"
                                                        required
                                                    />
                                                </div>

                                                <div>
                                                    <label className="form-label">الكمية *</label>
                                                    <input
                                                        type="number"
                                                        value={medication.quantity}
                                                        onChange={(e) => updateMedication(index, 'quantity', parseInt(e.target.value))}
                                                        className="form-input"
                                                        min="1"
                                                        required
                                                    />
                                                </div>

                                                <div>
                                                    <label className="form-label">إعادة التعبئة</label>
                                                    <input
                                                        type="number"
                                                        value={medication.refills}
                                                        onChange={(e) => updateMedication(index, 'refills', parseInt(e.target.value))}
                                                        className="form-input"
                                                        min="0"
                                                    />
                                                </div>
                                            </div>

                                            <div className="mt-4">
                                                <label className="form-label">تعليمات إضافية</label>
                                                <textarea
                                                    value={medication.instructions}
                                                    onChange={(e) => updateMedication(index, 'instructions', e.target.value)}
                                                    className="form-textarea"
                                                    rows={2}
                                                    placeholder="تعليمات خاصة بالدواء..."
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {errors.medications && (
                                    <p className="mt-1 text-sm text-red-600">{errors.medications}</p>
                                )}
                            </div>

                            {/* Instructions */}
                            <div>
                                <label className="form-label">تعليمات عامة</label>
                                <textarea
                                    value={data.instructions}
                                    onChange={(e) => setData('instructions', e.target.value)}
                                    className="form-textarea"
                                    rows={4}
                                    placeholder="تعليمات عامة للمريض..."
                                />
                                {errors.instructions && (
                                    <p className="mt-1 text-sm text-red-600">{errors.instructions}</p>
                                )}
                            </div>

                            {/* Follow-up Date */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="form-label">تاريخ المتابعة</label>
                                    <input
                                        type="date"
                                        value={data.follow_up_date}
                                        onChange={(e) => setData('follow_up_date', e.target.value)}
                                        className="form-input"
                                        min={getTodayDate()}
                                    />
                                    {errors.follow_up_date && (
                                        <p className="mt-1 text-sm text-red-600">{errors.follow_up_date}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="form-label">ملاحظات إضافية</label>
                                    <textarea
                                        value={data.notes}
                                        onChange={(e) => setData('notes', e.target.value)}
                                        className="form-textarea"
                                        rows={3}
                                        placeholder="ملاحظات إضافية..."
                                    />
                                    {errors.notes && (
                                        <p className="mt-1 text-sm text-red-600">{errors.notes}</p>
                                    )}
                                </div>
                            </div>

                            {/* Prescription Summary */}
                            {data.patient_id && data.diagnosis && data.medications.some(m => m.medication_name) && (
                                <Alert variant="success">
                                    <div className="text-sm">
                                        <p className="font-medium mb-2">ملخص الوصفة:</p>
                                        <div className="space-y-1 text-gray-600">
                                            <div><span className="font-medium">المريض:</span> {selectedPatient?.name}</div>
                                            <div><span className="font-medium">التشخيص:</span> {data.diagnosis}</div>
                                            <div><span className="font-medium">عدد الأدوية:</span> {data.medications.filter(m => m.medication_name).length}</div>
                                            <div><span className="font-medium">تاريخ المتابعة:</span> {data.follow_up_date || 'غير محدد'}</div>
                                        </div>
                                    </div>
                                </Alert>
                            )}

                            {/* Form Actions */}
                            <div className="flex items-center justify-end space-x-4 space-x-reverse">
                                <Link href={route('doctor.prescriptions.index')}>
                                    <Button variant="outline" type="button">
                                        إلغاء
                                    </Button>
                                </Link>
                                <Button 
                                    type="submit" 
                                    disabled={processing}
                                    className="min-w-[120px]"
                                >
                                    {processing ? 'جاري الحفظ...' : 'حفظ الوصفة'}
                                </Button>
                            </div>
                        </form>
                    </Card.Body>
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}