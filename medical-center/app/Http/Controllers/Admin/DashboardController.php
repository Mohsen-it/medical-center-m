<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\Doctor;
use App\Models\Patient;
use App\Models\User;
use Carbon\Carbon;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $today = Carbon::today();
        
        $stats = [
            'total_patients' => Patient::count(),
            'total_doctors' => Doctor::count(),
            'total_appointments_today' => Appointment::whereDate('appointment_date', $today)->count(),
            'pending_appointments' => Appointment::where('status', 'scheduled')->count(),
            'completed_appointments_today' => Appointment::whereDate('appointment_date', $today)
                ->where('status', 'completed')->count(),
            'total_users' => User::count(),
            'active_doctors' => Doctor::where('is_available', true)->count(),
        ];

        $recentAppointments = Appointment::with(['patient', 'doctor.user'])
            ->whereDate('appointment_date', $today)
            ->orderBy('appointment_time', 'asc')
            ->take(10)
            ->get();

        $weeklyAppointments = Appointment::selectRaw('DATE(appointment_date) as date, COUNT(*) as count')
            ->whereBetween('appointment_date', [Carbon::now()->startOfWeek(), Carbon::now()->endOfWeek()])
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return Inertia::render('Admin/Dashboard', [
            'stats' => $stats,
            'recentAppointments' => $recentAppointments,
            'weeklyAppointments' => $weeklyAppointments,
        ]);
    }
}