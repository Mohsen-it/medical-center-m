import React, { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { 
    HomeIcon, 
    CalendarIcon, 
    UserGroupIcon, 
    Cog6ToothIcon,
    ArrowRightOnRectangleIcon,
    UserCircleIcon,
    ClipboardDocumentListIcon,
    BuildingOfficeIcon,
    ChartBarIcon,
    DocumentTextIcon,
    ClockIcon,
    XMarkIcon,
    Bars3Icon,
    BellIcon,
    MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { Button, Badge } from '@/Components';

const AuthenticatedLayout = ({ children, header }) => {
    const { auth } = usePage().props;
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const user = auth.user;

    const getNavigationItems = () => {
        switch (user.role_type) {
            case 'admin':
                return [
                    { 
                        name: 'لوحة التحكم', 
                        href: '/admin/dashboard', 
                        icon: HomeIcon,
                        badge: null
                    },
                    { 
                        name: 'المستخدمون', 
                        href: '/admin/users', 
                        icon: UserGroupIcon,
                        badge: null
                    },
                    { 
                        name: 'الأطباء', 
                        href: '/admin/doctors', 
                        icon: UserCircleIcon,
                        badge: null
                    },
                    { 
                        name: 'المرضى', 
                        href: '/admin/patients', 
                        icon: UserGroupIcon,
                        badge: null
                    },
                    { 
                        name: 'المواعيد', 
                        href: '/admin/appointments', 
                        icon: CalendarIcon,
                        badge: '5'
                    },
                    { 
                        name: 'الأقسام', 
                        href: '/admin/departments', 
                        icon: BuildingOfficeIcon,
                        badge: null
                    },
                    { 
                        name: 'التقارير', 
                        href: '/admin/reports', 
                        icon: ChartBarIcon,
                        badge: null
                    },
                    { 
                        name: 'الإعدادات', 
                        href: '/admin/settings', 
                        icon: Cog6ToothIcon,
                        badge: null
                    },
                ];
            case 'doctor':
                return [
                    { 
                        name: 'لوحة التحكم', 
                        href: '/doctor/dashboard', 
                        icon: HomeIcon,
                        badge: null
                    },
                    { 
                        name: 'مواعيدي', 
                        href: '/doctor/appointments', 
                        icon: CalendarIcon,
                        badge: '3'
                    },
                    { 
                        name: 'مرضاي', 
                        href: '/doctor/patients', 
                        icon: UserGroupIcon,
                        badge: null
                    },
                    { 
                        name: 'السجلات الطبية', 
                        href: '/doctor/medical-records', 
                        icon: ClipboardDocumentListIcon,
                        badge: null
                    },
                    { 
                        name: 'الوصفات الطبية', 
                        href: '/doctor/prescriptions', 
                        icon: DocumentTextIcon,
                        badge: null
                    },
                    { 
                        name: 'جدولي', 
                        href: '/doctor/schedule', 
                        icon: ClockIcon,
                        badge: null
                    },
                ];
            case 'receptionist':
                return [
                    { 
                        name: 'لوحة التحكم', 
                        href: '/receptionist/dashboard', 
                        icon: HomeIcon,
                        badge: null
                    },
                    { 
                        name: 'حجز موعد', 
                        href: '/receptionist/appointments/create', 
                        icon: CalendarIcon,
                        badge: null
                    },
                    { 
                        name: 'المواعيد', 
                        href: '/receptionist/appointments', 
                        icon: CalendarIcon,
                        badge: '8'
                    },
                    { 
                        name: 'المرضى', 
                        href: '/receptionist/patients', 
                        icon: UserGroupIcon,
                        badge: null
                    },
                    { 
                        name: 'قائمة الانتظار', 
                        href: '/receptionist/waiting-list', 
                        icon: ClipboardDocumentListIcon,
                        badge: '2'
                    },
                    { 
                        name: 'الحضور', 
                        href: '/receptionist/attendance', 
                        icon: UserCircleIcon,
                        badge: null
                    },
                ];
            default:
                return [];
        }
    };

    const navigation = getNavigationItems();
    const isActive = (href) => window.location.pathname === href;

    const notifications = [
        { id: 1, title: 'موعد جديد', message: 'موعد جديد مع أحمد محمد', time: 'منذ دقيقتين', read: false },
        { id: 2, title: 'تذكير موعد', message: 'موعد مع سارة أحمد بعد 30 دقيقة', time: 'منذ 5 دقائق', read: false },
        { id: 3, title: 'إشعار نظام', message: 'تم تحديث النظام بنجاح', time: 'منذ ساعة', read: true },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Mobile sidebar backdrop */}
            {sidebarOpen && (
                <div 
                    className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div className={`sidebar ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'} lg:translate-x-0`}>
                {/* Sidebar header */}
                <div className="sidebar-header">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className="h-10 w-10 bg-white rounded-lg flex items-center justify-center">
                                <BuildingOfficeIcon className="h-6 w-6 text-primary-600" />
                            </div>
                        </div>
                        <div className="mr-3">
                            <h1 className="text-xl font-bold text-white">المجمع الطبي</h1>
                            <p className="text-xs text-primary-100">نظام الإدارة</p>
                        </div>
                    </div>
                    {/* Mobile close button */}
                    <button
                        type="button"
                        className="lg:hidden text-white hover:text-primary-200 transition-colors duration-200"
                        onClick={() => setSidebarOpen(false)}
                    >
                        <XMarkIcon className="h-6 w-6" />
                    </button>
                </div>

                {/* User profile */}
                <div className="px-4 py-6 border-b border-primary-700">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className="h-10 w-10 bg-primary-500 rounded-full flex items-center justify-center">
                                <span className="text-white font-bold">
                                    {user.name.charAt(0)}
                                </span>
                            </div>
                        </div>
                        <div className="mr-3 flex-1">
                            <p className="text-sm font-medium text-white">{user.name}</p>
                            <p className="text-xs text-primary-200">
                                {user.role_type === 'admin' ? 'مدير' : 
                                 user.role_type === 'doctor' ? 'طبيب' : 'موظف استقبال'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="sidebar-nav flex-1">
                    <div className="space-y-1">
                        {navigation.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`sidebar-item ${isActive(item.href) ? 'active' : ''}`}
                            >
                                <item.icon className="sidebar-icon" />
                                <span className="flex-1">{item.name}</span>
                                {item.badge && (
                                    <Badge variant="danger" size="sm">
                                        {item.badge}
                                    </Badge>
                                )}
                            </Link>
                        ))}
                    </div>
                </nav>

                {/* Sidebar footer */}
                <div className="border-t border-gray-200 p-4">
                    <Link
                        href="/logout"
                        method="post"
                        as="button"
                        className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors duration-200"
                    >
                        <ArrowRightOnRectangleIcon className="ml-2 h-4 w-4" />
                        تسجيل الخروج
                    </Link>
                </div>
            </div>

            {/* Main content */}
            <div className="lg:mr-72">
                {/* Top header */}
                <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
                    <div className="px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between h-16">
                            {/* Left side */}
                            <div className="flex items-center">
                                {/* Mobile menu button */}
                                <button
                                    type="button"
                                    className="lg:hidden text-gray-500 hover:text-gray-600 transition-colors duration-200"
                                    onClick={() => setSidebarOpen(true)}
                                >
                                    <Bars3Icon className="h-6 w-6" />
                                </button>
                                
                                <h1 className="text-xl font-semibold text-gray-900 mr-4">
                                    {header}
                                </h1>
                            </div>

                            {/* Right side */}
                            <div className="flex items-center space-x-4 space-x-reverse">
                                {/* Search */}
                                <div className="hidden md:block">
                                    <div className="relative">
                                        <input
                                            type="text"
                                            placeholder="بحث..."
                                            className="w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                        />
                                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    </div>
                                </div>

                                {/* Notifications */}
                                <div className="relative">
                                    <button
                                        type="button"
                                        className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                                        onClick={() => setNotificationsOpen(!notificationsOpen)}
                                    >
                                        <BellIcon className="h-5 w-5" />
                                        <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
                                    </button>

                                    {/* Notifications dropdown */}
                                    {notificationsOpen && (
                                        <div className="absolute left-0 mt-2 w-80 rounded-xl shadow-2xl bg-white ring-1 ring-black ring-opacity-5 z-50">
                                            <div className="p-4 border-b border-gray-100">
                                                <h3 className="text-sm font-semibold text-gray-900">الإشعارات</h3>
                                            </div>
                                            <div className="max-h-96 overflow-y-auto">
                                                {notifications.map((notification) => (
                                                    <div
                                                        key={notification.id}
                                                        className={`p-4 hover:bg-gray-50 border-b border-gray-100 ${
                                                            !notification.read ? 'bg-primary-50' : ''
                                                        }`}
                                                    >
                                                        <div className="flex items-start">
                                                            <div className="flex-1">
                                                                <p className="text-sm font-medium text-gray-900">
                                                                    {notification.title}
                                                                </p>
                                                                <p className="text-sm text-gray-600 mt-1">
                                                                    {notification.message}
                                                                </p>
                                                                <p className="text-xs text-gray-400 mt-1">
                                                                    {notification.time}
                                                                </p>
                                                            </div>
                                                            {!notification.read && (
                                                                <div className="ml-2">
                                                                    <div className="h-2 w-2 bg-primary-600 rounded-full"></div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="p-4 border-t border-gray-100">
                                                <button className="text-sm text-primary-600 hover:text-primary-800 font-medium">
                                                    عرض جميع الإشعارات
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Date */}
                                <div className="text-sm text-gray-500">
                                    {new Date().toLocaleDateString('ar-SA', {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page content */}
                <main className="py-6">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AuthenticatedLayout;