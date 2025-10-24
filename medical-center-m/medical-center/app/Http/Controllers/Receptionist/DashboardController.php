<?php

namespace App\Http\Controllers\Receptionist;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\Patient;
use Carbon\Carbon;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $today = Carbon::today();

        $stats = [
            'appointments_today' => Appointment::whereDate('appointment_date', $today)->count(),
            'checked_in_today' => Appointment::whereDate('appointment_date', $today)
                ->whereNotNull('checked_in_at')
                ->count(),
            'pending_checkins' => Appointment::whereDate('appointment_date', $today)
                ->where('status', 'scheduled')
                ->count(),
            'total_patients' => Patient::count(),
            'new_patients_this_month' => Patient::whereMonth('created_at', $today->month)
                ->whereYear('created_at', $today->year)
                ->count(),
            'cancelled_today' => Appointment::whereDate('appointment_date', $today)
                ->where('status', 'cancelled')
                ->count(),
        ];

        $todayAppointments = Appointment::with(['patient', 'doctor.user', 'specialization'])
            ->whereDate('appointment_date', $today)
            ->orderBy('appointment_time', 'asc')
            ->get();

        $waitingList = Appointment::with(['patient', 'doctor.user'])
            ->whereDate('appointment_date', $today)
            ->where('status', 'confirmed')
            ->whereNull('completed_at')
            ->orderBy('checked_in_at', 'asc')
            ->get();

        return Inertia::render('Receptionist/Dashboard', [
            'stats' => $stats,
            'todayAppointments' => $todayAppointments,
            'waitingList' => $waitingList,
        ]);
    }
}