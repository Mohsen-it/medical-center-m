import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Button, Card, Alert } from '@/Components';

export default function CreatePatient() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        phone: '',
        national_id: '',
        date_of_birth: '',
        gender: 'male',
        blood_type: '',
        address: '',
        emergency_contact_name: '',
        emergency_contact_phone: '',
        emergency_contact_relation: '',
        allergies: '',
        chronic_diseases: '',
        current_medications: '',
        notes: '',
    });

    const [showDateOfBirth, setShowDateOfBirth] = useState(false);

    const submit = (e) => {
        e.preventDefault();
        post(route('receptionist.patients.store'), {
            onSuccess: () => reset(),
        });
    };

    const calculateAge = (dateOfBirth) => {
        if (!dateOfBirth) return '';
        const today = new Date();
        const birthDate = new Date(dateOfBirth);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    const genders = [
        { value: 'male', label: 'ذكر' },
        { value: 'female', label: 'أنثى' },
    ];

    const relations = [
        'زوج/زوجة',
        'أب/أم',
        'ابن/ابنة',
        'أخ/أخت',
        'جد/جدة',
        'صديق',
        'آخر'
    ];

    return (
        <AuthenticatedLayout header="تسجيل مريض جديد">
            <Head title="تسجيل مريض جديد" />

            <div className="max-w-4xl mx-auto">
                <Card>
                    <Card.Header>
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-semibold text-gray-900">
                                بيانات المريض الجديد
                            </h2>
                            <Link href={route('receptionist.patients.index')}>
                                <Button variant="outline" size="sm">
                                    العودة
                                </Button>
                            </Link>
                        </div>
                    </Card.Header>

                    <Card.Body>
                        <form onSubmit={submit} className="space-y-6">
                            {/* Basic Information */}
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-4">المعلومات الأساسية</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="form-label">الاسم الكامل *</label>
                                        <input
                                            type="text"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            className="form-input"
                                            placeholder="أدخل الاسم الكامل"
                                            required
                                        />
                                        {errors.name && (
                                            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="form-label">البريد الإلكتروني</label>
                                        <input
                                            type="email"
                                            value={data.email}
                                            onChange={(e) => setData('email', e.target.value)}
                                            className="form-input"
                                            placeholder="example@email.com"
                                        />
                                        {errors.email && (
                                            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="form-label">رقم الهاتف *</label>
                                        <input
                                            type="tel"
                                            value={data.phone}
                                            onChange={(e) => setData('phone', e.target.value)}
                                            className="form-input"
                                            placeholder="+966 50 123 4567"
                                            required
                                        />
                                        {errors.phone && (
                                            <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="form-label">الرقم الوطني *</label>
                                        <input
                                            type="text"
                                            value={data.national_id}
                                            onChange={(e) => setData('national_id', e.target.value)}
                                            className="form-input"
                                            placeholder="أدخل الرقم الوطني"
                                            required
                                        />
                                        {errors.national_id && (
                                            <p className="mt-1 text-sm text-red-600">{errors.national_id}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="form-label">تاريخ الميلاد *</label>
                                        <div className="relative">
                                            <input
                                                type={showDateOfBirth ? 'date' : 'text'}
                                                value={data.date_of_birth}
                                                onChange={(e) => setData('date_of_birth', e.target.value)}
                                                className="form-input"
                                                placeholder="أدخل تاريخ الميلاد"
                                                onFocus={() => setShowDateOfBirth(true)}
                                                onBlur={() => setShowDateOfBirth(false)}
                                                required
                                            />
                                        </div>
                                        {errors.date_of_birth && (
                                            <p className="mt-1 text-sm text-red-600">{errors.date_of_birth}</p>
                                        )}
                                        {data.date_of_birth && (
                                            <p className="mt-1 text-sm text-gray-500">
                                                العمر: {calculateAge(data.date_of_birth)} سنة
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="form-label">الجنس *</label>
                                        <select
                                            value={data.gender}
                                            onChange={(e) => setData('gender', e.target.value)}
                                            className="form-select"
                                            required
                                        >
                                            {genders.map((gender) => (
                                                <option key={gender.value} value={gender.value}>
                                                    {gender.label}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.gender && (
                                            <p className="mt-1 text-sm text-red-600">{errors.gender}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="form-label">فصيلة الدم</label>
                                        <select
                                            value={data.blood_type}
                                            onChange={(e) => setData('blood_type', e.target.value)}
                                            className="form-select"
                                        >
                                            <option value="">اختر فصيلة الدم</option>
                                            {bloodTypes.map((type) => (
                                                <option key={type} value={type}>
                                                    {type}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.blood_type && (
                                            <p className="mt-1 text-sm text-red-600">{errors.blood_type}</p>
                                        )}
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="form-label">العنوان</label>
                                        <textarea
                                            value={data.address}
                                            onChange={(e) => setData('address', e.target.value)}
                                            className="form-textarea"
                                            rows={2}
                                            placeholder="أدخل العنوان الكامل..."
                                        />
                                        {errors.address && (
                                            <p className="mt-1 text-sm text-red-600">{errors.address}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Emergency Contact */}
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-4">بيانات الاتصال في الطوارئ</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div>
                                        <label className="form-label">اسم الشخص *</label>
                                        <input
                                            type="text"
                                            value={data.emergency_contact_name}
                                            onChange={(e) => setData('emergency_contact_name', e.target.value)}
                                            className="form-input"
                                            placeholder="اسم الشخص للاتصال"
                                            required
                                        />
                                        {errors.emergency_contact_name && (
                                            <p className="mt-1 text-sm text-red-600">{errors.emergency_contact_name}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="form-label">رقم الهاتف *</label>
                                        <input
                                            type="tel"
                                            value={data.emergency_contact_phone}
                                            onChange={(e) => setData('emergency_contact_phone', e.target.value)}
                                            className="form-input"
                                            placeholder="+966 50 123 4567"
                                            required
                                        />
                                        {errors.emergency_contact_phone && (
                                            <p className="mt-1 text-sm text-red-600">{errors.emergency_contact_phone}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="form-label">صلة القرابة *</label>
                                        <select
                                            value={data.emergency_contact_relation}
                                            onChange={(e) => setData('emergency_contact_relation', e.target.value)}
                                            className="form-select"
                                            required
                                        >
                                            <option value="">اختر صلة القرابة</option>
                                            {relations.map((relation) => (
                                                <option key={relation} value={relation}>
                                                    {relation}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.emergency_contact_relation && (
                                            <p className="mt-1 text-sm text-red-600">{errors.emergency_contact_relation}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Medical Information */}
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-4">المعلومات الطبية</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="form-label">الحساسية</label>
                                        <textarea
                                            value={data.allergies}
                                            onChange={(e) => setData('allergies', e.target.value)}
                                            className="form-textarea"
                                            rows={3}
                                            placeholder="أي حساسية معروفة (أدوية، أطعمة، إلخ)..."
                                        />
                                        {errors.allergies && (
                                            <p className="mt-1 text-sm text-red-600">{errors.allergies}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="form-label">الأمراض المزمنة</label>
                                        <textarea
                                            value={data.chronic_diseases}
                                            onChange={(e) => setData('chronic_diseases', e.target.value)}
                                            className="form-textarea"
                                            rows={3}
                                            placeholder="أي أمراض مزمنة (سكري، ضغط، إلخ)..."
                                        />
                                        {errors.chronic_diseases && (
                                            <p className="mt-1 text-sm text-red-600">{errors.chronic_diseases}</p>
                                        )}
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="form-label">الأدوية الحالية</label>
                                        <textarea
                                            value={data.current_medications}
                                            onChange={(e) => setData('current_medications', e.target.value)}
                                            className="form-textarea"
                                            rows={3}
                                            placeholder="الأدوية التي يتناولها المريض حالياً..."
                                        />
                                        {errors.current_medications && (
                                            <p className="mt-1 text-sm text-red-600">{errors.current_medications}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Additional Notes */}
                            <div>
                                <label className="form-label">ملاحظات إضافية</label>
                                <textarea
                                    value={data.notes}
                                    onChange={(e) => setData('notes', e.target.value)}
                                    className="form-textarea"
                                    rows={4}
                                    placeholder="أي ملاحظات إضافية عن المريض..."
                                />
                                {errors.notes && (
                                    <p className="mt-1 text-sm text-red-600">{errors.notes}</p>
                                )}
                            </div>

                            {/* Patient Summary */}
                            {data.name && data.phone && data.national_id && data.date_of_birth && (
                                <Alert variant="info">
                                    <div className="text-sm">
                                        <p className="font-medium mb-2">ملخص بيانات المريض:</p>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 text-gray-600">
                                            <div>
                                                <span className="font-medium">الاسم:</span> {data.name}
                                            </div>
                                            <div>
                                                <span className="font-medium">الهاتف:</span> {data.phone}
                                            </div>
                                            <div>
                                                <span className="font-medium">الرقم الوطني:</span> {data.national_id}
                                            </div>
                                            <div>
                                                <span className="font-medium">العمر:</span> {calculateAge(data.date_of_birth)} سنة
                                            </div>
                                            <div>
                                                <span className="font-medium">الجنس:</span> {genders.find(g => g.value === data.gender)?.label}
                                            </div>
                                            <div>
                                                <span className="font-medium">فصيلة الدم:</span> {data.blood_type || 'غير محدد'}
                                            </div>
                                            <div className="md:col-span-2">
                                                <span className="font-medium">العنوان:</span> {data.address || 'غير محدد'}
                                            </div>
                                        </div>
                                    </div>
                                </Alert>
                            )}

                            {/* Form Actions */}
                            <div className="flex items-center justify-end space-x-4 space-x-reverse">
                                <Link href={route('receptionist.patients.index')}>
                                    <Button variant="outline" type="button">
                                        إلغاء
                                    </Button>
                                </Link>
                                <Button 
                                    type="submit" 
                                    disabled={processing}
                                    className="min-w-[120px]"
                                >
                                    {processing ? 'جاري التسجيل...' : 'تسجيل المريض'}
                                </Button>
                            </div>
                        </form>
                    </Card.Body>
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}