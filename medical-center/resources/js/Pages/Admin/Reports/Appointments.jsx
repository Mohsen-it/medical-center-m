import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Button, Card, Badge } from '@/Components';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function AppointmentsReport({ appointments, stats, dailyStats, doctorStats, filters, doctors }) {
    const [showFilters, setShowFilters] = useState(false);

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

    const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

    // Prepare data for charts
    const statusData = [
        { name: 'مكتمل', value: stats.completed, color: '#10b981' },
        { name: 'ملغي', value: stats.cancelled, color: '#ef4444' },
        { name: 'معلق', value: stats.pending, color: '#f59e0b' },
    ];

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('ar-SA', {
            style: 'currency',
            currency: 'SAR',
        }).format(value);
    };

    return (
        <AuthenticatedLayout header="تقارير المواعيد">
            <Head title="تقارير المواعيد" />

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
                            <form method="GET" className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                                    <label className="form-label">الطبيب</label>
                                    <select name="doctor_id" className="form-select">
                                        <option value="">جميع الأطباء</option>
                                        {doctors.map((doctor) => (
                                            <option key={doctor.id} value={doctor.id}>
                                                د. {doctor.user.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="form-label">الحالة</label>
                                    <select name="status" className="form-select">
                                        <option value="">جميع الحالات</option>
                                        <option value="scheduled">مجدول</option>
                                        <option value="confirmed">مؤكد</option>
                                        <option value="completed">مكتمل</option>
                                        <option value="cancelled">ملغي</option>
                                    </select>
                                </div>
                                <div className="md:col-span-4">
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
                            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
                            <div className="text-sm text-gray-500">إجمالي المواعيد</div>
                        </Card.Body>
                    </Card>
                    <Card className="text-center">
                        <Card.Body className="p-4">
                            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
                            <div className="text-sm text-gray-500">مكتمل</div>
                        </Card.Body>
                    </Card>
                    <Card className="text-center">
                        <Card.Body className="p-4">
                            <div className="text-2xl font-bold text-red-600">{stats.cancelled}</div>
                            <div className="text-sm text-gray-500">ملغي</div>
                        </Card.Body>
                    </Card>
                    <Card className="text-center">
                        <Card.Body className="p-4">
                            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
                            <div className="text-sm text-gray-500">معلق</div>
                        </Card.Body>
                    </Card>
                    <Card className="text-center">
                        <Card.Body className="p-4">
                            <div className="text-2xl font-bold text-blue-600">{formatCurrency(stats.total_revenue)}</div>
                            <div className="text-sm text-gray-500">إجمالي الإيرادات</div>
                        </Card.Body>
                    </Card>
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Daily Appointments Chart */}
                    <Card>
                        <Card.Header>
                            <h3 className="text-lg font-semibold text-gray-900">
                                المواعيد اليومية
                            </h3>
                        </Card.Header>
                        <Card.Body>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={dailyStats}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Line 
                                        type="monotone" 
                                        dataKey="count" 
                                        stroke="#0ea5e9" 
                                        strokeWidth={2}
                                        name="عدد المواعيد"
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </Card.Body>
                    </Card>

                    {/* Status Distribution */}
                    <Card>
                        <Card.Header>
                            <h3 className="text-lg font-semibold text-gray-900">
                                توزيع الحالات
                            </h3>
                        </Card.Header>
                        <Card.Body>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={statusData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {statusData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </Card.Body>
                    </Card>
                </div>

                {/* Doctor Performance */}
                <Card>
                    <Card.Header>
                        <h3 className="text-lg font-semibold text-gray-900">
                            أداء الأطباء
                        </h3>
                    </Card.Header>
                    <Card.Body>
                        <ResponsiveContainer width="100%" height={400}>
                            <BarChart data={doctorStats}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="doctor_name" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="total_appointments" fill="#0ea5e9" name="إجمالي المواعيد" />
                                <Bar dataKey="total_revenue" fill="#10b981" name="الإيرادات" />
                            </BarChart>
                        </ResponsiveContainer>
                    </Card.Body>
                </Card>

                {/* Doctor Stats Table */}
                <Card>
                    <Card.Header>
                        <h3 className="text-lg font-semibold text-gray-900">
                            تفاصيل أداء الأطباء
                        </h3>
                    </Card.Header>
                    <Card.Body>
                        <div className="overflow-x-auto">
                            <table className="table">
                                <thead className="table-header">
                                    <tr>
                                        <th>الطبيب</th>
                                        <th>إجمالي المواعيد</th>
                                        <th>متوسط الرسوم</th>
                                        <th>إجمالي الإيرادات</th>
                                        <th>متوسط التقييم</th>
                                    </tr>
                                </thead>
                                <tbody className="table-body">
                                    {doctorStats.map((doctor) => (
                                        <tr key={doctor.id} className="table-row">
                                            <td className="font-medium">{doctor.doctor_name}</td>
                                            <td>{doctor.total_appointments}</td>
                                            <td>{formatCurrency(doctor.avg_fee)}</td>
                                            <td className="font-medium">{formatCurrency(doctor.total_revenue)}</td>
                                            <td>
                                                <div className="flex items-center">
                                                    <span className="ml-1">⭐</span>
                                                    {doctor.rating}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card.Body>
                </Card>

                {/* Recent Appointments */}
                <Card>
                    <Card.Header>
                        <h3 className="text-lg font-semibold text-gray-900">
                            أحدث المواعيد
                        </h3>
                    </Card.Header>
                    <Card.Body>
                        <div className="overflow-x-auto">
                            <table className="table">
                                <thead className="table-header">
                                    <tr>
                                        <th>المريض</th>
                                        <th>الطبيب</th>
                                        <th>التاريخ</th>
                                        <th>الوقت</th>
                                        <th>الحالة</th>
                                        <th>الرسوم</th>
                                    </tr>
                                </thead>
                                <tbody className="table-body">
                                    {appointments.slice(0, 10).map((appointment) => (
                                        <tr key={appointment.id} className="table-row">
                                            <td className="font-medium">{appointment.patient.name}</td>
                                            <td>د. {appointment.doctor.user.name}</td>
                                            <td>{new Date(appointment.appointment_date).toLocaleDateString('ar-SA')}</td>
                                            <td>{appointment.appointment_time}</td>
                                            <td>{getStatusBadge(appointment.status)}</td>
                                            <td>{formatCurrency(appointment.fee)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {appointments.length > 10 && (
                            <div className="mt-4 text-center">
                                <p className="text-sm text-gray-500">
                                    عرض أول 10 مواعيد من {appointments.length} موعد
                                </p>
                            </div>
                        )}
                    </Card.Body>
                </Card>

                {/* Export Options */}
                <Card>
                    <Card.Header>
                        <h3 className="text-lg font-semibold text-gray-900">
                            تصدير التقرير
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
                        </div>
                    </Card.Body>
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}