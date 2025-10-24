import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Button, Card, Alert } from '@/Components';

export default function CreateUser() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        phone: '',
        role_type: 'receptionist',
        status: 'active',
    });

    const [showPassword, setShowPassword] = useState(false);

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.users.store'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    const roles = [
        { value: 'admin', label: 'مدير نظام', description: 'صلاحيات كاملة على النظام' },
        { value: 'doctor', label: 'طبيب', description: 'إدارة المرضى والسجلات الطبية' },
        { value: 'receptionist', label: 'موظف استقبال', description: 'حجز المواعيد وتسجيل المرضى' },
    ];

    const statuses = [
        { value: 'active', label: 'نشط', color: 'text-green-600' },
        { value: 'inactive', label: 'غير نشط', color: 'text-gray-600' },
        { value: 'suspended', label: 'معلق', color: 'text-red-600' },
    ];

    return (
        <AuthenticatedLayout header="إضافة مستخدم جديد">
            <Head title="إضافة مستخدم جديد" />

            <div className="max-w-2xl mx-auto">
                <Card>
                    <Card.Header>
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-semibold text-gray-900">
                                بيانات المستخدم الجديد
                            </h2>
                            <Link href={route('admin.users.index')}>
                                <Button variant="outline" size="sm">
                                    العودة
                                </Button>
                            </Link>
                        </div>
                    </Card.Header>

                    <Card.Body>
                        <form onSubmit={submit} className="space-y-6">
                            {/* Basic Information */}
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
                                    <label className="form-label">البريد الإلكتروني *</label>
                                    <input
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        className="form-input"
                                        placeholder="example@email.com"
                                        required
                                    />
                                    {errors.email && (
                                        <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="form-label">رقم الهاتف</label>
                                    <input
                                        type="tel"
                                        value={data.phone}
                                        onChange={(e) => setData('phone', e.target.value)}
                                        className="form-input"
                                        placeholder="+966 50 123 4567"
                                    />
                                    {errors.phone && (
                                        <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="form-label">الدور *</label>
                                    <select
                                        value={data.role_type}
                                        onChange={(e) => setData('role_type', e.target.value)}
                                        className="form-select"
                                        required
                                    >
                                        <option value="">اختر الدور</option>
                                        {roles.map((role) => (
                                            <option key={role.value} value={role.value}>
                                                {role.label}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.role_type && (
                                        <p className="mt-1 text-sm text-red-600">{errors.role_type}</p>
                                    )}
                                    {data.role_type && (
                                        <p className="mt-1 text-xs text-gray-500">
                                            {roles.find(r => r.value === data.role_type)?.description}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="form-label">الحالة *</label>
                                    <select
                                        value={data.status}
                                        onChange={(e) => setData('status', e.target.value)}
                                        className="form-select"
                                        required
                                    >
                                        <option value="">اختر الحالة</option>
                                        {statuses.map((status) => (
                                            <option key={status.value} value={status.value}>
                                                {status.label}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.status && (
                                        <p className="mt-1 text-sm text-red-600">{errors.status}</p>
                                    )}
                                </div>
                            </div>

                            {/* Password */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="form-label">كلمة المرور *</label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={data.password}
                                            onChange={(e) => setData('password', e.target.value)}
                                            className="form-input pr-10"
                                            placeholder="أدخل كلمة المرور"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            {showPassword ? 'إخفاء' : 'عرض'}
                                        </button>
                                    </div>
                                    {errors.password && (
                                        <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="form-label">تأكيد كلمة المرور *</label>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={data.password_confirmation}
                                        onChange={(e) => setData('password_confirmation', e.target.value)}
                                        className="form-input"
                                        placeholder="أعد إدخال كلمة المرور"
                                        required
                                    />
                                    {errors.password_confirmation && (
                                        <p className="mt-1 text-sm text-red-600">{errors.password_confirmation}</p>
                                    )}
                                </div>
                            </div>

                            {/* Password Requirements */}
                            <Alert variant="info">
                                <div className="text-sm">
                                    <p className="font-medium mb-2">متطلبات كلمة المرور:</p>
                                    <ul className="list-disc list-inside space-y-1 text-gray-600">
                                        <li>8 أحرف على الأقل</li>
                                        <li>تحتوي على حرف كبير وصغير</li>
                                        <li>تحتوي على رقم</li>
                                        <li>تحتوي على رمز خاص (!@#$%^&*)</li>
                                    </ul>
                                </div>
                            </Alert>

                            {/* Form Actions */}
                            <div className="flex items-center justify-end space-x-4 space-x-reverse">
                                <Link href={route('admin.users.index')}>
                                    <Button variant="outline" type="button">
                                        إلغاء
                                    </Button>
                                </Link>
                                <Button 
                                    type="submit" 
                                    disabled={processing}
                                    className="min-w-[120px]"
                                >
                                    {processing ? 'جاري الحفظ...' : 'حفظ المستخدم'}
                                </Button>
                            </div>
                        </form>
                    </Card.Body>
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}