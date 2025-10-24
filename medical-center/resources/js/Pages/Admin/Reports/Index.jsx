import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { 
    Button, 
    Card, 
    Select,
    Input,
    StatCard 
} from '@/Components';
import { 
    ChartBarIcon,
    CalendarIcon,
    CurrencyDollarIcon,
    UserGroupIcon,
    DocumentArrowDownIcon,
    FunnelIcon,
    ArrowDownTrayIcon
} from '@heroicons/react/24/outline';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

export default function ReportsIndex({ reportData }) {
    const [dateRange, setDateRange] = useState('month');
    const [reportType, setReportType] = useState('overview');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#6366f1', '#8b5cf6'];

    const monthlyData = [
        { month: 'يناير', patients: 120, appointments: 450, revenue: 15000 },
        { month: 'فبراير', patients: 135, appointments: 480, revenue: 16500 },
        { month: 'مارس', patients: 150, appointments: 520, revenue: 18000 },
        { month: 'أبريل', patients: 145, appointments: 490, revenue: 17200 },
        { month: 'مايو', patients: 160, appointments: 550, revenue: 19500 },
        { month: 'يونيو', patients: 175, appointments: 580, revenue: 21000 },
    ];

    const specializationData = [
        { name: 'طب عام', value: 35, color: '#0ea5e9' },
        { name: 'طب القلب', value: 20, color: '#10b981' },
        { name: 'طب الأطفال', value: 25, color: '#f59e0b' },
        { name: 'طب النساء', value: 15, color: '#ef4444' },
        { name: 'طب العيون', value: 5, color: '#6366f1' },
    ];

    const doctorPerformance = [
        { name: 'د. أحمد محمد', patients: 45, appointments: 180, rating: 4.8 },
        { name: 'د. نورة أحمد', patients: 38, appointments: 150, rating: 4.9 },
        { name: 'د. محمد الشمري', patients: 42, appointments: 165, rating: 4.7 },
        { name: 'د. فاطمة علي', patients: 35, appointments: 140, rating: 4.6 },
        { name: 'د. خالد العمر', patients: 30, appointments: 120, rating: 4.5 },
    ];

    const handleExport = (format) => {
        // Export logic here
        console.log(`Exporting as ${format}`);
    };

    return (
        <AuthenticatedLayout header="التقارير والإحصائيات">
            <Head title="التقارير والإحصائيات" />

            {/* Filters */}
            <Card className="mb-8">
                <Card.Body>
                    <div className="flex flex-col lg:flex-row gap-4 items-end">
                        <div className="flex-1">
                            <label className="form-label">نوع التقرير</label>
                            <Select
                                value={reportType}
                                onChange={(e) => setReportType(e.target.value)}
                                options={[
                                    { value: 'overview', label: 'نظرة عامة' },
                                    { value: 'patients', label: 'تقرير المرضى' },
                                    { value: 'appointments', label: 'تقرير المواعيد' },
                                    { value: 'financial', label: 'تقرير مالي' },
                                    { value: 'doctors', label: 'تقرير الأطباء' },
                                ]}
                            />
                        </div>
                        <div className="flex-1">
                            <label className="form-label">الفترة الزمنية</label>
                            <Select
                                value={dateRange}
                                onChange={(e) => setDateRange(e.target.value)}
                                options={[
                                    { value: 'today', label: 'اليوم' },
                                    { value: 'week', label: 'هذا الأسبوع' },
                                    { value: 'month', label: 'هذا الشهر' },
                                    { value: 'quarter', label: 'هذا الربع' },
                                    { value: 'year', label: 'هذه السنة' },
                                    { value: 'custom', label: 'مخصص' },
                                ]}
                            />
                        </div>
                        {dateRange === 'custom' && (
                            <>
                                <div className="flex-1">
                                    <label className="form-label">من تاريخ</label>
                                    <Input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="form-label">إلى تاريخ</label>
                                    <Input
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                    />
                                </div>
                            </>
                        )}
                        <div className="flex gap-2">
                            <Button variant="outline">
                                <FunnelIcon className="h-4 w-4 ml-2" />
                                تطبيق
                            </Button>
                            <Button>
                                <ArrowDownTrayIcon className="h-4 w-4 ml-2" />
                                تصدير
                            </Button>
                        </div>
                    </div>
                </Card.Body>
            </Card>

            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                    title="إجمالي المرضى"
                    value={reportData.totalPatients || 825}
                    icon={UserGroupIcon}
                    variant="primary"
                    trend={12}
                />
                <StatCard
                    title="إجمالي المواعيد"
                    value={reportData.totalAppointments || 2670}
                    icon={CalendarIcon}
                    variant="success"
                    trend={8}
                />
                <StatCard
                    title="الإيرادات"
                    value={`${reportData.totalRevenue || 107200} ريال`}
                    icon={CurrencyDollarIcon}
                    variant="warning"
                    trend={15}
                />
                <StatCard
                    title="معدل النمو"
                    value={`${reportData.growthRate || 18.5}%`}
                    icon={ChartBarIcon}
                    variant="info"
                />
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Monthly Trend */}
                <Card>
                    <Card.Header>
                        <h3 className="text-lg font-semibold text-gray-900">الاتجاه الشهري</h3>
                        <p className="text-sm text-gray-600 mt-1">
                            نمو المرضى والمواعيد والإيرادات
                        </p>
                    </Card.Header>
                    <Card.Body>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={monthlyData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip />
                                <Line 
                                    type="monotone" 
                                    dataKey="patients" 
                                    stroke="#0ea5e9" 
                                    strokeWidth={2}
                                    name="المرضى"
                                />
                                <Line 
                                    type="monotone" 
                                    dataKey="appointments" 
                                    stroke="#10b981" 
                                    strokeWidth={2}
                                    name="المواعيد"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </Card.Body>
                </Card>

                {/* Specializations Distribution */}
                <Card>
                    <Card.Header>
                        <h3 className="text-lg font-semibold text-gray-900">توزيع التخصصات</h3>
                        <p className="text-sm text-gray-600 mt-1">
                            نسبة المرضى حسب التخصص
                        </p>
                    </Card.Header>
                    <Card.Body>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={specializationData}
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                    label={({ name, value }) => `${name}: ${value}%`}
                                >
                                    {specializationData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </Card.Body>
                </Card>
            </div>

            {/* Revenue Chart */}
            <Card className="mb-8">
                <Card.Header>
                    <h3 className="text-lg font-semibold text-gray-900">الإيرادات الشهرية</h3>
                    <p className="text-sm text-gray-600 mt-1">
                        تطور الإيرادات خلال الأشهر الستة الماضية
                    </p>
                </Card.Header>
                <Card.Body>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={monthlyData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="revenue" fill="#10b981" name="الإيرادات (ريال)" />
                        </BarChart>
                    </ResponsiveContainer>
                </Card.Body>
            </Card>

            {/* Doctor Performance Table */}
            <Card className="mb-8">
                <Card.Header>
                    <h3 className="text-lg font-semibold text-gray-900">أداء الأطباء</h3>
                    <p className="text-sm text-gray-600 mt-1">
                        إحصائيات أداء الأطباء خلال الفترة المحددة
                    </p>
                </Card.Header>
                <Card.Body>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        الطبيب
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        عدد المرضى
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        عدد المواعيد
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        التقييم
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        الإيرادات
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {doctorPerformance.map((doctor, index) => (
                                    <tr key={index} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {doctor.name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {doctor.patients}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {doctor.appointments}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            <div className="flex items-center">
                                                <span className="ml-2">{doctor.rating}</span>
                                                <div className="flex">
                                                    {[...Array(5)].map((_, i) => (
                                                        <svg
                                                            key={i}
                                                            className={`h-4 w-4 ${
                                                                i < Math.floor(doctor.rating)
                                                                    ? 'text-yellow-400'
                                                                    : 'text-gray-300'
                                                            }`}
                                                            fill="currentColor"
                                                            viewBox="0 0 20 20"
                                                        >
                                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                        </svg>
                                                    ))}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {doctor.appointments * 150} ريال
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card.Body>
            </Card>

            {/* Export Options */}
            <Card>
                <Card.Header>
                    <h3 className="text-lg font-semibold text-gray-900">تصدير التقارير</h3>
                    <p className="text-sm text-gray-600 mt-1">
                        قم بتصدير التقارير بصيغ مختلفة
                    </p>
                </Card.Header>
                <Card.Body>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Button 
                            variant="outline" 
                            className="w-full"
                            onClick={() => handleExport('pdf')}
                        >
                            <DocumentArrowDownIcon className="h-4 w-4 ml-2" />
                            تصدير كـ PDF
                        </Button>
                        <Button 
                            variant="outline" 
                            className="w-full"
                            onClick={() => handleExport('excel')}
                        >
                            <DocumentArrowDownIcon className="h-4 w-4 ml-2" />
                            تصدير كـ Excel
                        </Button>
                        <Button 
                            variant="outline" 
                            className="w-full"
                            onClick={() => handleExport('csv')}
                        >
                            <DocumentArrowDownIcon className="h-4 w-4 ml-2" />
                            تصدير كـ CSV
                        </Button>
                    </div>
                </Card.Body>
            </Card>
        </AuthenticatedLayout>
    );
}