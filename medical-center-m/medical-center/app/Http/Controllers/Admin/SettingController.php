<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SettingController extends Controller
{
    public function index()
    {
        // Get system settings (would typically come from database or config)
        $settings = [
            'general' => [
                'clinic_name' => 'المجمع الطبي الحديث',
                'clinic_address' => 'شارع الملك فهد، الرياض، المملكة العربية السعودية',
                'clinic_phone' => '+966 50 123 4567',
                'clinic_email' => 'info@medical-center.com',
                'working_hours' => 'الأحد - الخميس: 8:00 ص - 10:00 م',
                'appointment_duration' => 30, // minutes
                'advance_booking_days' => 30,
            ],
            'notifications' => [
                'email_notifications' => true,
                'sms_notifications' => false,
                'appointment_reminders' => true,
                'reminder_hours_before' => 24,
                'automatic_invoices' => true,
            ],
            'payments' => [
                'default_payment_method' => 'cash',
                'allow_partial_payments' => true,
                'payment_due_days' => 7,
                'late_fee_percentage' => 5,
                'currency' => 'SAR',
            ],
            'appointments' => [
                'allow_online_booking' => true,
                'require_payment_for_booking' => false,
                'cancellation_hours_before' => 24,
                'max_appointments_per_day' => 50,
                'break_time_start' => '13:00',
                'break_time_end' => '14:00',
            ],
            'security' => [
                'password_min_length' => 8,
                'require_password_change_days' => 90,
                'max_login_attempts' => 5,
                'session_timeout_minutes' => 60,
                'enable_two_factor' => false,
            ],
            'backup' => [
                'auto_backup_enabled' => true,
                'backup_frequency' => 'daily',
                'backup_retention_days' => 30,
                'backup_location' => 'local',
            ],
        ];

        return Inertia::render('Admin/Settings/Index', [
            'settings' => $settings,
        ]);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'general.clinic_name' => ['required', 'string', 'max:200'],
            'general.clinic_address' => ['required', 'string', 'max:500'],
            'general.clinic_phone' => ['required', 'string', 'max:20'],
            'general.clinic_email' => ['required', 'email', 'max:100'],
            'general.working_hours' => ['required', 'string', 'max:200'],
            'general.appointment_duration' => ['required', 'integer', 'min:15', 'max:120'],
            'general.advance_booking_days' => ['required', 'integer', 'min:1', 'max:365'],
            
            'notifications.email_notifications' => ['boolean'],
            'notifications.sms_notifications' => ['boolean'],
            'notifications.appointment_reminders' => ['boolean'],
            'notifications.reminder_hours_before' => ['required', 'integer', 'min:1', 'max:168'],
            'notifications.automatic_invoices' => ['boolean'],
            
            'payments.default_payment_method' => ['required', 'in:cash,card,transfer'],
            'payments.allow_partial_payments' => ['boolean'],
            'payments.payment_due_days' => ['required', 'integer', 'min:1', 'max:90'],
            'payments.late_fee_percentage' => ['required', 'integer', 'min:0', 'max:50'],
            'payments.currency' => ['required', 'string', 'size:3'],
            
            'appointments.allow_online_booking' => ['boolean'],
            'appointments.require_payment_for_booking' => ['boolean'],
            'appointments.cancellation_hours_before' => ['required', 'integer', 'min:0', 'max:168'],
            'appointments.max_appointments_per_day' => ['required', 'integer', 'min:1', 'max:200'],
            'appointments.break_time_start' => ['required', 'date_format:H:i'],
            'appointments.break_time_end' => ['required', 'date_format:H:i'],
            
            'security.password_min_length' => ['required', 'integer', 'min:6', 'max:20'],
            'security.require_password_change_days' => ['required', 'integer', 'min:0', 'max:365'],
            'security.max_login_attempts' => ['required', 'integer', 'min:3', 'max:10'],
            'security.session_timeout_minutes' => ['required', 'integer', 'min:15', 'max:480'],
            'security.enable_two_factor' => ['boolean'],
            
            'backup.auto_backup_enabled' => ['boolean'],
            'backup.backup_frequency' => ['required', 'in:daily,weekly,monthly'],
            'backup.backup_retention_days' => ['required', 'integer', 'min:7', 'max:365'],
            'backup.backup_location' => ['required', 'in:local,cloud'],
        ]);

        // Here you would typically save the settings to database or config files
        // For now, we'll just return success
        
        return back()->with('success', 'تم تحديث الإعدادات بنجاح');
    }

    public function backup()
    {
        // Implementation for creating backup
        return response()->json(['message' => 'Backup functionality would be implemented here']);
    }

    public function restore(Request $request)
    {
        // Implementation for restoring from backup
        return response()->json(['message' => 'Restore functionality would be implemented here']);
    }

    public function clearCache()
    {
        // Clear application cache
        \Artisan::call('cache:clear');
        \Artisan::call('config:clear');
        \Artisan::call('route:clear');
        \Artisan::call('view:clear');

        return back()->with('success', 'تم مسح ذاكرة التخزين المؤقت بنجاح');
    }

    public function systemInfo()
    {
        $info = [
            'php_version' => PHP_VERSION,
            'laravel_version' => app()->version(),
            'database_version' => \DB::connection()->getPdo()->getAttribute(\PDO::ATTR_SERVER_VERSION),
            'server_software' => $_SERVER['SERVER_SOFTWARE'] ?? 'Unknown',
            'memory_limit' => ini_get('memory_limit'),
            'max_execution_time' => ini_get('max_execution_time'),
            'upload_max_filesize' => ini_get('upload_max_filesize'),
            'disk_space' => [
                'total' => disk_total_space('/'),
                'free' => disk_free_space('/'),
                'used' => disk_total_space('/') - disk_free_space('/'),
            ],
        ];

        return Inertia::render('Admin/Settings/SystemInfo', [
            'systemInfo' => $info,
        ]);
    }

    public function logs()
    {
        // Implementation for viewing system logs
        $logs = [
            // This would typically read from log files
            'error_log' => [],
            'access_log' => [],
            'system_log' => [],
        ];

        return Inertia::render('Admin/Settings/Logs', [
            'logs' => $logs,
        ]);
    }
}