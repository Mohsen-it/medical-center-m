import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Button, Card, Badge } from '@/Components';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function FinancialReport({ invoices, payments, stats, dailyRevenue, paymentMethods, topServices, filters }) {
    const [showFilters, setShowFilters] = useState(false);

    const getStatusBadge = (status) => {
        const statusClasses = {
            paid: 'bg-green-100 text-green-800',
            pending: 'bg-yellow-100 text-yellow-800',
            overdue: 'bg-red-100 text-red-800',
            cancelled: 'bg-gray-100 text-gray-800',
        };
        
        const statusText = {
            paid: 'مدفوعة',
            pending: 'معلقة',
            overdue: 'متأخرة',
            cancelled: 'ملغاة',
        };

        return (
            <Badge className={statusClasses[status]}>
                {statusText[status]}
            </Badge>
        );
    };

    const getPaymentMethodBadge = (method) => {
        const methodClasses = {
            cash: 'bg-green-100 text-green-800',
            card: 'bg-blue-100 text-blue-800',
            transfer: 'bg-purple-100 text-purple-800',
        };
        
        const methodText = {
            cash: 'نقدي',
            card: 'بطاقة',
            transfer: 'تحويل بنكي',
        };

        return (
            <Badge className={methodClasses[method]}>
                {methodText[method]}
            </Badge>
        );
    };

    const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444'];

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('ar-SA', {
            style: 'currency',
            currency: 'SAR',
        }).format(value);
    };

    // Prepare data for charts
    const paymentMethodData = paymentMethods.map(method => ({
        name: method.payment_method === 'cash' ? 'نقدي' : 
              method.payment_method === 'card' ? 'بطاقة' : 'تحويل بنكي',
        value: method.total,
        count: method.count,
    }));

    const statusData = [
        { name: 'مدفوعة', value: stats.paid_amount, color: '#10b981' },
        { name: 'معلقة', value: stats.pending_amount, color: '#f59e0b' },
        { name: 'متأخرة', value: stats.overdue_amount, color: '#ef4444' },
    ];

    return (
        <AuthenticatedLayout header="التقارير المالية">
            <Head title="التقارير المالية" />

            <div className="max-w-7xl mx-auto space-y-6">
                {/* Filters */}
                <Card>
                    <Card.Header>
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-900">
                                فلاتر التقرير
                            </h3>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowFilters(!showFilters)}
                            >
                                {showFilters ? 'إخفاء الفلاتر' : 'عرض الفلاتر'}
                            </Button>
                        </div>
                    </Card.Header>
                    {showFilters && (
                        <Card.Body>
                            <form method="GET" className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="form-label">من تاريخ</label>
                                    <input
                                        type="date"
                                        name="start_date"
                                        defaultValue={filters.start_date}
                                        className="form-input"
                                    />
                                </div>
                                <div>
                                    <label className="form-label">إلى تاريخ</label>
                                    <input
                                        type="date"
                                        name="end_date"
                                        defaultValue={filters.end_date}
                                        className="form-input"
                                    />
                                </div>
                                <div>
                                    <label className="form-label">طريقة الدفع</label>
                                    <select name="payment_method" className="form-select">
                                        <option value="">جميع الطرق</option>
                                        <option value="cash">نقدي</option>
                                        <option value="card">بطاقة</option>
                                        <option value="transfer">تحويل بنكي</option>
                                    </select>
                                </div>
                                <div className="md:col-span-3">
                                    <Button type="submit">
                                        تطبيق الفلاتر
                                    </Button>
                                </div>
                            </form>
                        </Card.Body>
                    )}
                </Card>

                {/* Summary Stats */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <Card className="text-center">
                        <Card.Body className="p-4">
                            <div className="text-2xl font-bold text-gray-900">{stats.total_invoices}</div>
                            <div className="text-sm text-gray-500">إجمالي الفواتير</div>
                        </Card.Body>
                    </Card>
                    <Card className="text-center">
                        <Card.Body className="p-4">
                            <div className="text-2xl font-bold text-blue-600">{formatCurrency(stats.total_amount)}</div>
                            <div className="text-sm text-gray-500">إجمالي المبلغ</div>
                        </Card.Body>
                    </Card>
                    <Card className="text-center">
                        <Card.Body className="p-4">
                            <div className="text-2xl font-bold text-green-600">{formatCurrency(stats.paid_amount)}</div>
                            <div className="text-sm text-gray-500">المبلغ المدفوع</div>
                        </Card.Body>
                    </Card>
                    <Card className="text-center">
                        <Card.Body className="p-4">
                            <div className="text-2xl font-bold text-yellow-600">{formatCurrency(stats.pending_amount)}</div>
                            <div className="text-sm text-gray-500">المبلغ المعلق</div>
                        </Card.Body>
                    </Card>
                    <Card className="text-center">
                        <Card.Body className="p-4">
                            <div className="text-2xl font-bold text-red-600">{formatCurrency(stats.overdue_amount)}</div>
                            <div className="text-sm text-gray-500">المبلغ المتأخر</div>
                        </Card.Body>
                    </Card>
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Daily Revenue Chart */}
                    <Card>
                        <Card.Header>
                            <h3 className="text-lg font-semibold text-gray-900">
                                الإيرادات اليومية
                            </h3>
                        </Card.Header>
                        <Card.Body>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={dailyRevenue}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis />
                                    <Tooltip formatter={(value) => formatCurrency(value)} />
                                    <Legend />
                                    <Line 
                                        type="monotone" 
                                        dataKey="total" 
                                        stroke="#10b981" 
                                        strokeWidth={2}
                                        name="الإيرادات"
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </Card.Body>
                    </Card>

                    {/* Payment Methods Distribution */}
                    <Card>
                        <Card.Header>
                            <h3 className="text-lg font-semibold text-gray-900">
                                طرق الدفع
                            </h3>
                        </Card.Header>
                        <Card.Body>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={paymentMethodData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {paymentMethodData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value) => formatCurrency(value)} />
                                </PieChart>
                            </ResponsiveContainer>
                        </Card.Body>
                    </Card>
                </div>

                {/* Invoice Status Distribution */}
                <Card>
                    <Card.Header>
                        <h3 className="text-lg font-semibold text-gray-900">
                            توزيع حالات الفواتير
                        </h3>
                    </Card.Header>
                    <Card.Body>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={statusData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip formatter={(value) => formatCurrency(value)} />
                                <Bar dataKey="value" fill="#3b82f6" />
                            </BarChart>
                        </ResponsiveContainer>
                    </Card.Body>
                </Card>

                {/* Payment Methods Table */}
                <Card>
                    <Card.Header>
                        <h3 className="text-lg font-semibold text-gray-900">
                            تفاصيل طرق الدفع
                        </h3>
                    </Card.Header>
                    <Card.Body>
                        <div className="overflow-x-auto">
                            <table className="table">
                                <thead className="table-header">
                                    <tr>
                                        <th>طريقة الدفع</th>
                                        <th>عدد العمليات</th>
                                        <th>إجمالي المبلغ</th>
                                        <th>متوسط العملية</th>
                                    </tr>
                                </thead>
                                <tbody className="table-body">
                                    {paymentMethods.map((method) => (
                                        <tr key={method.payment_method} className="table-row">
                                            <td>{getPaymentMethodBadge(method.payment_method)}</td>
                                            <td>{method.count}</td>
                                            <td className="font-medium">{formatCurrency(method.total)}</td>
                                            <td>{formatCurrency(method.total / method.count)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card.Body>
                </Card>

                {/* Top Services */}
                <Card>
                    <Card.Header>
                        <h3 className="text-lg font-semibold text-gray-900">
                            الخدمات الأعلى إيرادات
                        </h3>
                    </Card.Header>
                    <Card.Body>
                        <div className="overflow-x-auto">
                            <table className="table">
                                <thead className="table-header">
                                    <tr>
                                        <th>الخدمة</th>
                                        <th>عدد المرات</th>
                                        <th>إجمالي الإيرادات</th>
                                        <th>متوسط السعر</th>
                                    </tr>
                                </thead>
                                <tbody className="table-body">
                                    {topServices.map((service, index) => (
                                        <tr key={index} className="table-row">
                                            <td className="font-medium">{service.description}</td>
                                            <td>{service.count}</td>
                                            <td className="font-medium">{formatCurrency(service.revenue)}</td>
                                            <td>{formatCurrency(service.revenue / service.count)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card.Body>
                </Card>

                {/* Recent Invoices */}
                <Card>
                    <Card.Header>
                        <h3 className="text-lg font-semibold text-gray-900">
                            أحدث الفواتير
                        </h3>
                    </Card.Header>
                    <Card.Body>
                        <div className="overflow-x-auto">
                            <table className="table">
                                <thead className="table-header">
                                    <tr>
                                        <th>رقم الفاتورة</th>
                                        <th>المريض</th>
                                        <th>الطبيب</th>
                                        <th>التاريخ</th>
                                        <th>المبلغ</th>
                                        <th>الحالة</th>
                                    </tr>
                                </thead>
                                <tbody className="table-body">
                                    {invoices.slice(0, 10).map((invoice) => (
                                        <tr key={invoice.id} className="table-row">
                                            <td className="font-medium">#{invoice.id}</td>
                                            <td>{invoice.patient.name}</td>
                                            <td>د. {invoice.doctor.user.name}</td>
                                            <td>{new Date(invoice.created_at).toLocaleDateString('ar-SA')}</td>
                                            <td className="font-medium">{formatCurrency(invoice.total_amount)}</td>
                                            <td>{getStatusBadge(invoice.status)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {invoices.length > 10 && (
                            <div className="mt-4 text-center">
                                <p className="text-sm text-gray-500">
                                    عرض أول 10 فواتير من {invoices.length} فاتورة
                                </p>
                            </div>
                        )}
                    </Card.Body>
                </Card>

                {/* Recent Payments */}
                <Card>
                    <Card.Header>
                        <h3 className="text-lg font-semibold text-gray-900">
                            أحدث المدفوعات
                        </h3>
                    </Card.Header>
                    <Card.Body>
                        <div className="overflow-x-auto">
                            <table className="table">
                                <thead className="table-header">
                                    <tr>
                                        <th>الرقم</th>
                                        <th>المريض</th>
                                        <th>التاريخ</th>
                                        <th>طريقة الدفع</th>
                                        <th>المبلغ</th>
                                        <th>الحالة</th>
                                    </tr>
                                </thead>
                                <tbody className="table-body">
                                    {payments.slice(0, 10).map((payment) => (
                                        <tr key={payment.id} className="table-row">
                                            <td className="font-medium">#{payment.id}</td>
                                            <td>{payment.invoice.patient.name}</td>
                                            <td>{new Date(payment.payment_date).toLocaleDateString('ar-SA')}</td>
                                            <td>{getPaymentMethodBadge(payment.payment_method)}</td>
                                            <td className="font-medium">{formatCurrency(payment.amount)}</td>
                                            <td>
                                                <Badge className="bg-green-100 text-green-800">
                                                    مدفوع
                                                </Badge>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {payments.length > 10 && (
                            <div className="mt-4 text-center">
                                <p className="text-sm text-gray-500">
                                    عرض أول 10 مدفوعات من {payments.length} دفعة
                                </p>
                            </div>
                        )}
                    </Card.Body>
                </Card>

                {/* Export Options */}
                <Card>
                    <Card.Header>
                        <h3 className="text-lg font-semibold text-gray-900">
                            تصدير التقرير المالي
                        </h3>
                    </Card.Header>
                    <Card.Body>
                        <div className="flex items-center space-x-4 space-x-reverse">
                            <Button variant="outline">
                                تصدير PDF
                            </Button>
                            <Button variant="outline">
                                تصدير Excel
                            </Button>
                            <Button variant="outline">
                                طباعة التقرير
                            </Button>
                            <Button>
                                إرسال عبر البريد
                            </Button>
                        </div>
                    </Card.Body>
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}