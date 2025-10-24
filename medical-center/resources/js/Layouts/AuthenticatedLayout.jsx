import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import { 
    HomeIcon, 
    CalendarIcon, 
    UserGroupIcon, 
    Cog6ToothIcon,
    ArrowRightOnRectangleIcon,
    UserCircleIcon,
    ClipboardDocumentListIcon,
    BuildingOfficeIcon
} from '@heroicons/react/24/outline';

const AuthenticatedLayout = ({ children, header }) => {
    const { auth } = usePage().props;
    const user = auth.user;

    const getNavigationItems = () => {
        switch (user.role_type) {
            case 'admin':
                return [
                    { name: 'لوحة التحكم', href: '/admin/dashboard', icon: HomeIcon },
                    { name: 'المستخدمون', href: '/admin/users', icon: UserGroupIcon },
                    { name: 'الأطباء', href: '/admin/doctors', icon: UserCircleIcon },
                    { name: 'المرضى', href: '/admin/patients', icon: UserGroupIcon },
                    { name: 'المواعيد', href: '/admin/appointments', icon: CalendarIcon },
                    { name: 'الأقسام', href: '/admin/departments', icon: BuildingOfficeIcon },
                    { name: 'التقارير', href: '/admin/reports', icon: ClipboardDocumentListIcon },
                    { name: 'الإعدادات', href: '/admin/settings', icon: Cog6ToothIcon },
                ];
            case 'doctor':
                return [
                    { name: 'لوحة التحكم', href: '/doctor/dashboard', icon: HomeIcon },
                    { name: 'مواعيدي', href: '/doctor/appointments', icon: CalendarIcon },
                    { name: 'مرضاي', href: '/doctor/patients', icon: UserGroupIcon },
                    { name: 'السجلات الطبية', href: '/doctor/medical-records', icon: ClipboardDocumentListIcon },
                    { name: 'الوصفات الطبية', href: '/doctor/prescriptions', icon: Cog6ToothIcon },
                    { name: 'جدولي', href: '/doctor/schedule', icon: CalendarIcon },
                ];
            case 'receptionist':
                return [
                    { name: 'لوحة التحكم', href: '/receptionist/dashboard', icon: HomeIcon },
                    { name: 'حجز موعد', href: '/receptionist/appointments/create', icon: CalendarIcon },
                    { name: 'المواعيد', href: '/receptionist/appointments', icon: CalendarIcon },
                    { name: 'المرضى', href: '/receptionist/patients', icon: UserGroupIcon },
                    { name: 'قائمة الانتظار', href: '/receptionist/waiting-list', icon: ClipboardDocumentListIcon },
                    { name: 'الحضور', href: '/receptionist/attendance', icon: UserCircleIcon },
                ];
            default:
                return [];
        }
    };

    const navigation = getNavigationItems();

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Sidebar */}
            <div className="fixed inset-y-0 right-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0">
                <div className="flex items-center justify-center h-16 px-4 bg-primary-600">
                    <h1 className="text-xl font-bold text-white">المجمع الطبي</h1>
                </div>
                
                <nav className="mt-8">
                    <div className="px-4 space-y-2">
                        {navigation.map((item) => {
                            const isActive = window.location.pathname === item.href;
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                                        isActive
                                            ? 'bg-primary-100 text-primary-700 border-r-4 border-primary-600'
                                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                                >
                                    <item.icon
                                        className={`ml-3 h-5 w-5 ${
                                            isActive ? 'text-primary-600' : 'text-gray-400 group-hover:text-gray-500'
                                        }`}
                                        aria-hidden="true"
                                    />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </div>
                </nav>

                {/* User Profile */}
                <div className="absolute bottom-0 w-full p-4 border-t border-gray-200">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <UserCircleIcon className="h-8 w-8 text-gray-400" />
                        </div>
                        <div className="mr-3">
                            <p className="text-sm font-medium text-gray-700">{user.name}</p>
                            <p className="text-xs text-gray-500">
                                {user.role_type === 'admin' ? 'مدير' : 
                                 user.role_type === 'doctor' ? 'طبيب' : 'موظف استقبال'}
                            </p>
                        </div>
                    </div>
                    <Link
                        href="/logout"
                        method="post"
                        as="button"
                        className="mt-3 w-full flex items-center justify-center px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors duration-200"
                    >
                        <ArrowRightOnRectangleIcon className="ml-2 h-4 w-4" />
                        تسجيل الخروج
                    </Link>
                </div>
            </div>

            {/* Main Content */}
            <div className="lg:mr-64">
                {/* Top Header */}
                <header className="bg-white shadow-sm border-b border-gray-200">
                    <div className="px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between h-16">
                            <div className="flex items-center">
                                <h1 className="text-xl font-semibold text-gray-900">
                                    {header}
                                </h1>
                            </div>
                            
                            <div className="flex items-center space-x-4 space-x-reverse">
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

                {/* Page Content */}
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