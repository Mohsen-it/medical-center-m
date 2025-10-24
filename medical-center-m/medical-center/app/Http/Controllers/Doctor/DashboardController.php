<?php

namespace App\Http\Controllers\Doctor;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\MedicalRecord;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $doctor = auth()->user()->doctor;
        $today = Carbon::today();

        $stats = [
            'appointments_today' => Appointment::where('doctor_id', $doctor->id)
                ->whereDate('appointment_date', $today)
                ->count(),
            'pending_appointments' => Appointment::where('doctor_id', $doctor->id)
                ->where('status', 'scheduled')
                ->count(),
            'completed_appointments_today' => Appointment::where('doctor_id', $doctor->id)
                ->whereDate('appointment_date', $today)
                ->where('status', 'completed')
                ->count(),
            'total_patients' => MedicalRecord::where('doctor_id', $doctor->id)
                ->distinct('patient_id')
                ->count(),
            'upcoming_appointments' => Appointment::where('doctor_id', $doctor->id)
                ->where('appointment_date', '>=', $today)
                ->where('status', 'scheduled')
                ->count(),
        ];

        $todayAppointments = Appointment::with(['patient'])
            ->where('doctor_id', $doctor->id)
            ->whereDate('appointment_date', $today)
            ->orderBy('appointment_time', 'asc')
            ->get();

        $upcomingAppointments = Appointment::with(['patient'])
            ->where('doctor_id', $doctor->id)
            ->where('appointment_date', '>', $today)
            ->where('status', 'scheduled')
            ->orderBy('appointment_date', 'asc')
            ->orderBy('appointment_time', 'asc')
            ->take(5)
            ->get();

        return Inertia::render('Doctor/Dashboard', [
            'stats' => $stats,
            'todayAppointments' => $todayAppointments,
            'upcomingAppointments' => $upcomingAppointments,
            'doctor' => $doctor->load('specialization', 'user'),
        ]);
    }
}