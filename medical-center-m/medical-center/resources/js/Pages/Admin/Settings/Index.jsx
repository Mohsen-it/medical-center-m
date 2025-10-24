import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Button, Card, Alert, Badge } from '@/Components';
import { 
    Cog6ToothIcon,
    BellIcon,
    CreditCardIcon,
    CalendarIcon,
    ShieldCheckIcon,
    CloudArrowUpIcon,
    InformationCircleIcon
} from '@heroicons/react/24/outline';

export default function SettingsIndex({ settings }) {
    const { data, setData, post, processing } = useForm(settings);
    const [activeTab, setActiveTab] = useState('general');
    const [showSaveConfirm, setShowSaveConfirm] = useState(false);

    const tabs = [
        { id: 'general', name: 'الإعدادات العامة', icon: Cog6ToothIcon },
        { id: 'notifications', name: 'الإشعارات', icon: BellIcon },
        { id: 'payments', name: 'المدفوعات', icon: CreditCardIcon },
        { id: 'appointments', name: 'المواعيد', icon: CalendarIcon },
        { id: 'security', name: 'الأمان', icon: ShieldCheckIcon },
        { id: 'backup', name: 'النسخ الاحتياطي', icon: CloudArrowUpIcon },
    ];

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.settings.update'), {
            onSuccess: () => {
                setShowSaveConfirm(true);
                setTimeout(() => setShowSaveConfirm(false), 3000);
            },
        });
    };

    const handleClearCache = () => {
        if (confirm('هل أنت متأكد من مسح ذاكرة التخزين المؤقت؟')) {
            window.location.href = route('admin.settings.clear-cache');
        }
    };

    return (
        <AuthenticatedLayout header="إعدادات النظام">
            <Head title="إعدادات النظام" />

            <div className="max-w-6xl mx-auto">
                {/* Success Message */}
                {showSaveConfirm && (
                    <Alert variant="success" className="mb-6">
                        تم حفظ الإعدادات بنجاح
                    </Alert>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <Card>
                            <Card.Body className="p-0">
                                <nav className="space-y-1">
                                    {tabs.map((tab) => {
                                        const Icon = tab.icon;
                                        return (
                                            <button
                                                key={tab.id}
                                                onClick={() => setActiveTab(tab.id)}
                                                className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                                                    activeTab === tab.id
                                                        ? 'bg-primary-100 text-primary-700 border-r-4 border-primary-600'
                                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                                }`}
                                            >
                                                <Icon className="h-5 w-5 ml-3" />
                                                {tab.name}
                                            </button>
                                        );
                                    })}
                                </nav>
                            </Card.Body>
                        </Card>
                    </div>

                    {/* Content */}
                    <div className="lg:col-span-3">
                        <form onSubmit={submit}>
                            {/* General Settings */}
                            {activeTab === 'general' && (
                                <Card>
                                    <Card.Header>
                                        <h3 className="text-lg font-semibold text-gray-900">
                                            الإعدادات العامة
                                        </h3>
                                    </Card.Header>
                                    <Card.Body className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="form-label">اسم العيادة</label>
                                                <input
                                                    type="text"
                                                    value={data.general.clinic_name}
                                                    onChange={(e) => setData('general.clinic_name', e.target.value)}
                                                    className="form-input"
                                                />
                                            </div>
                                            <div>
                                                <label className="form-label">الهاتف</label>
                                                <input
                                                    type="tel"
                                                    value={data.general.clinic_phone}
                                                    onChange={(e) => setData('general.clinic_phone', e.target.value)}
                                                    className="form-input"
                                                />
                                            </div>
                                            <div>
                                                <label className="form-label">البريد الإلكتروني</label>
                                                <input
                                                    type="email"
                                                    value={data.general.clinic_email}
                                                    onChange={(e) => setData('general.clinic_email', e.target.value)}
                                                    className="form-input"
                                                />
                                            </div>
                                            <div>
                                                <label className="form-label">مدة الموعد (دقائق)</label>
                                                <input
                                                    type="number"
                                                    value={data.general.appointment_duration}
                                                    onChange={(e) => setData('general.appointment_duration', e.target.value)}
                                                    className="form-input"
                                                    min="15"
                                                    max="120"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="form-label">العنوان</label>
                                            <textarea
                                                value={data.general.clinic_address}
                                                onChange={(e) => setData('general.clinic_address', e.target.value)}
                                                className="form-textarea"
                                                rows={3}
                                            />
                                        </div>
                                        <div>
                                            <label className="form-label">ساعات العمل</label>
                                            <input
                                                type="text"
                                                value={data.general.working_hours}
                                                onChange={(e) => setData('general.working_hours', e.target.value)}
                                                className="form-input"
                                            />
                                        </div>
                                        <div>
                                            <label className="form-label">أيام الحجز المسبق</label>
                                            <input
                                                type="number"
                                                value={data.general.advance_booking_days}
                                                onChange={(e) => setData('general.advance_booking_days', e.target.value)}
                                                className="form-input"
                                                min="1"
                                                max="365"
                                            />
                                        </div>
                                    </Card.Body>
                                </Card>
                            )}

                            {/* Notifications Settings */}
                            {activeTab === 'notifications' && (
                                <Card>
                                    <Card.Header>
                                        <h3 className="text-lg font-semibold text-gray-900">
                                            إعدادات الإشعارات
                                        </h3>
                                    </Card.Header>
                                    <Card.Body className="space-y-6">
                                        <div className="space-y-4">
                                            <label className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    checked={data.notifications.email_notifications}
                                                    onChange={(e) => setData('notifications.email_notifications', e.target.checked)}
                                                    className="form-checkbox ml-3"
                                                />
                                                <span className="text-sm font-medium text-gray-700">
                                                    تفعيل الإشعارات عبر البريد الإلكتروني
                                                </span>
                                            </label>
                                            <label className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    checked={data.notifications.sms_notifications}
                                                    onChange={(e) => setData('notifications.sms_notifications', e.target.checked)}
                                                    className="form-checkbox ml-3"
                                                />
                                                <span className="text-sm font-medium text-gray-700">
                                                    تفعيل الإشعارات عبر الرسائل النصية
                                                </span>
                                            </label>
                                            <label className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    checked={data.notifications.appointment_reminders}
                                                    onChange={(e) => setData('notifications.appointment_reminders', e.target.checked)}
                                                    className="form-checkbox ml-3"
                                                />
                                                <span className="text-sm font-medium text-gray-700">
                                                    تذكير المواعيد
                                                </span>
                                            </label>
                                            <label className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    checked={data.notifications.automatic_invoices}
                                                    onChange={(e) => setData('notifications.automatic_invoices', e.target.checked)}
                                                    className="form-checkbox ml-3"
                                                />
                                                <span className="text-sm font-medium text-gray-700">
                                                    إنشاء الفواتير تلقائياً
                                                </span>
                                            </label>
                                        </div>
                                        <div>
                                            <label className="form-label">ساعات التذكير قبل الموعد</label>
                                            <input
                                                type="number"
                                                value={data.notifications.reminder_hours_before}
                                                onChange={(e) => setData('notifications.reminder_hours_before', e.target.value)}
                                                className="form-input"
                                                min="1"
                                                max="168"
                                            />
                                        </div>
                                    </Card.Body>
                                </Card>
                            )}

                            {/* Payments Settings */}
                            {activeTab === 'payments' && (
                                <Card>
                                    <Card.Header>
                                        <h3 className="text-lg font-semibold text-gray-900">
                                            إعدادات المدفوعات
                                        </h3>
                                    </Card.Header>
                                    <Card.Body className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="form-label">طريقة الدفع الافتراضية</label>
                                                <select
                                                    value={data.payments.default_payment_method}
                                                    onChange={(e) => setData('payments.default_payment_method', e.target.value)}
                                                    className="form-select"
                                                >
                                                    <option value="cash">نقدي</option>
                                                    <option value="card">بطاقة ائتمان</option>
                                                    <option value="transfer">تحويل بنكي</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="form-label">العملة</label>
                                                <select
                                                    value={data.payments.currency}
                                                    onChange={(e) => setData('payments.currency', e.target.value)}
                                                    className="form-select"
                                                >
                                                    <option value="SAR">ريال سعودي</option>
                                                    <option value="USD">دولار أمريكي</option>
                                                    <option value="EUR">يورو</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="form-label">أيام استحقاق الدفع</label>
                                                <input
                                                    type="number"
                                                    value={data.payments.payment_due_days}
                                                    onChange={(e) => setData('payments.payment_due_days', e.target.value)}
                                                    className="form-input"
                                                    min="1"
                                                    max="90"
                                                />
                                            </div>
                                            <div>
                                                <label className="form-label">نسبة رسوم التأخير (%)</label>
                                                <input
                                                    type="number"
                                                    value={data.payments.late_fee_percentage}
                                                    onChange={(e) => setData('payments.late_fee_percentage', e.target.value)}
                                                    className="form-input"
                                                    min="0"
                                                    max="50"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <label className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    checked={data.payments.allow_partial_payments}
                                                    onChange={(e) => setData('payments.allow_partial_payments', e.target.checked)}
                                                    className="form-checkbox ml-3"
                                                />
                                                <span className="text-sm font-medium text-gray-700">
                                                    السماح بالدفع الجزئي
                                                </span>
                                            </label>
                                        </div>
                                    </Card.Body>
                                </Card>
                            )}

                            {/* Appointments Settings */}
                            {activeTab === 'appointments' && (
                                <Card>
                                    <Card.Header>
                                        <h3 className="text-lg font-semibold text-gray-900">
                                            إعدادات المواعيد
                                        </h3>
                                    </Card.Header>
                                    <Card.Body className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="form-label">أقصى عدد مواعيد في اليوم</label>
                                                <input
                                                    type="number"
                                                    value={data.appointments.max_appointments_per_day}
                                                    onChange={(e) => setData('appointments.max_appointments_per_day', e.target.value)}
                                                    className="form-input"
                                                    min="1"
                                                    max="200"
                                                />
                                            </div>
                                            <div>
                                                <label className="form-label">ساعات الإلغاء المسموحة</label>
                                                <input
                                                    type="number"
                                                    value={data.appointments.cancellation_hours_before}
                                                    onChange={(e) => setData('appointments.cancellation_hours_before', e.target.value)}
                                                    className="form-input"
                                                    min="0"
                                                    max="168"
                                                />
                                            </div>
                                            <div>
                                                <label className="form-label">وقت بدء الاستراحة</label>
                                                <input
                                                    type="time"
                                                    value={data.appointments.break_time_start}
                                                    onChange={(e) => setData('appointments.break_time_start', e.target.value)}
                                                    className="form-input"
                                                />
                                            </div>
                                            <div>
                                                <label className="form-label">وقت انتهاء الاستراحة</label>
                                                <input
                                                    type="time"
                                                    value={data.appointments.break_time_end}
                                                    onChange={(e) => setData('appointments.break_time_end', e.target.value)}
                                                    className="form-input"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <label className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    checked={data.appointments.allow_online_booking}
                                                    onChange={(e) => setData('appointments.allow_online_booking', e.target.checked)}
                                                    className="form-checkbox ml-3"
                                                />
                                                <span className="text-sm font-medium text-gray-700">
                                                    السماح بالحجز الإلكتروني
                                                </span>
                                            </label>
                                            <label className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    checked={data.appointments.require_payment_for_booking}
                                                    onChange={(e) => setData('appointments.require_payment_for_booking', e.target.checked)}
                                                    className="form-checkbox ml-3"
                                                />
                                                <span className="text-sm font-medium text-gray-700">
                                                    اشتراط الدفع للحجز
                                                </span>
                                            </label>
                                        </div>
                                    </Card.Body>
                                </Card>
                            )}

                            {/* Security Settings */}
                            {activeTab === 'security' && (
                                <Card>
                                    <Card.Header>
                                        <h3 className="text-lg font-semibold text-gray-900">
                                            إعدادات الأمان
                                        </h3>
                                    </Card.Header>
                                    <Card.Body className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="form-label">الحد الأدنى لطول كلمة المرور</label>
                                                <input
                                                    type="number"
                                                    value={data.security.password_min_length}
                                                    onChange={(e) => setData('security.password_min_length', e.target.value)}
                                                    className="form-input"
                                                    min="6"
                                                    max="20"
                                                />
                                            </div>
                                            <div>
                                                <label className="form-label">أيام تغيير كلمة المرور</label>
                                                <input
                                                    type="number"
                                                    value={data.security.require_password_change_days}
                                                    onChange={(e) => setData('security.require_password_change_days', e.target.value)}
                                                    className="form-input"
                                                    min="0"
                                                    max="365"
                                                />
                                            </div>
                                            <div>
                                                <label className="form-label">أقصى محاولات تسجيل دخول</label>
                                                <input
                                                    type="number"
                                                    value={data.security.max_login_attempts}
                                                    onChange={(e) => setData('security.max_login_attempts', e.target.value)}
                                                    className="form-input"
                                                    min="3"
                                                    max="10"
                                                />
                                            </div>
                                            <div>
                                                <label className="form-label">مدة الجلسة (دقائق)</label>
                                                <input
                                                    type="number"
                                                    value={data.security.session_timeout_minutes}
                                                    onChange={(e) => setData('security.session_timeout_minutes', e.target.value)}
                                                    className="form-input"
                                                    min="15"
                                                    max="480"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <label className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    checked={data.security.enable_two_factor}
                                                    onChange={(e) => setData('security.enable_two_factor', e.target.checked)}
                                                    className="form-checkbox ml-3"
                                                />
                                                <span className="text-sm font-medium text-gray-700">
                                                    تفعيل المصادقة الثنائية
                                                </span>
                                            </label>
                                        </div>
                                    </Card.Body>
                                </Card>
                            )}

                            {/* Backup Settings */}
                            {activeTab === 'backup' && (
                                <Card>
                                    <Card.Header>
                                        <h3 className="text-lg font-semibold text-gray-900">
                                            إعدادات النسخ الاحتياطي
                                        </h3>
                                    </Card.Header>
                                    <Card.Body className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="form-label">تكرار النسخ الاحتياطي</label>
                                                <select
                                                    value={data.backup.backup_frequency}
                                                    onChange={(e) => setData('backup.backup_frequency', e.target.value)}
                                                    className="form-select"
                                                >
                                                    <option value="daily">يومي</option>
                                                    <option value="weekly">أسبوعي</option>
                                                    <option value="monthly">شهري</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="form-label">موقع التخزين</label>
                                                <select
                                                    value={data.backup.backup_location}
                                                    onChange={(e) => setData('backup.backup_location', e.target.value)}
                                                    className="form-select"
                                                >
                                                    <option value="local">محلي</option>
                                                    <option value="cloud">سحابي</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="form-label">أيام الاحتفاظ بالنسخ</label>
                                                <input
                                                    type="number"
                                                    value={data.backup.backup_retention_days}
                                                    onChange={(e) => setData('backup.backup_retention_days', e.target.value)}
                                                    className="form-input"
                                                    min="7"
                                                    max="365"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <label className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    checked={data.backup.auto_backup_enabled}
                                                    onChange={(e) => setData('backup.auto_backup_enabled', e.target.checked)}
                                                    className="form-checkbox ml-3"
                                                />
                                                <span className="text-sm font-medium text-gray-700">
                                                    تفعيل النسخ الاحتياطي التلقائي
                                                </span>
                                            </label>
                                        </div>
                                        <div className="flex items-center space-x-4 space-x-reverse">
                                            <Button variant="outline">
                                                إنشاء نسخة احتياطية الآن
                                            </Button>
                                            <Button variant="outline">
                                                استعادة من نسخة احتياطية
                                            </Button>
                                        </div>
                                    </Card.Body>
                                </Card>
                            )}

                            {/* Save Button */}
                            <div className="flex items-center justify-end">
                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className="min-w-[120px]"
                                >
                                    {processing ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
                                </Button>
                            </div>
                        </form>

                        {/* System Actions */}
                        <Card className="mt-6">
                            <Card.Header>
                                <h3 className="text-lg font-semibold text-gray-900">
                                    إجراءات النظام
                                </h3>
                            </Card.Header>
                            <Card.Body>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="font-medium text-gray-900">مسح ذاكرة التخزين المؤقت</h4>
                                            <p className="text-sm text-gray-500">
                                                مسح جميع البيانات المؤقتة والتحسينات
                                            </p>
                                        </div>
                                        <Button
                                            variant="outline"
                                            onClick={handleClearCache}
                                        >
                                            مسح الكاش
                                        </Button>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="font-medium text-gray-900">معلومات النظام</h4>
                                            <p className="text-sm text-gray-500">
                                                عرض معلومات النظام والإصدارات
                                            </p>
                                        </div>
                                        <Link href={route('admin.settings.system-info')}>
                                            <Button variant="outline">
                                                <InformationCircleIcon className="h-4 w-4 ml-1" />
                                                عرض المعلومات
                                            </Button>
                                        </Link>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="font-medium text-gray-900">سجلات النظام</h4>
                                            <p className="text-sm text-gray-500">
                                                عرض سجلات الأخطاء والنشاط
                                            </p>
                                        </div>
                                        <Link href={route('admin.settings.logs')}>
                                            <Button variant="outline">
                                                عرض السجلات
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </Card.Body>
                        </Card>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}