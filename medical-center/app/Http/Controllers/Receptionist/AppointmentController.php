<?php

namespace App\Http\Controllers\Receptionist;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\Patient;
use App\Models\Doctor;
use App\Models\Specialization;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class AppointmentController extends Controller
{
    public function index(Request $request)
    {
        $query = Appointment::with(['patient', 'doctor.user', 'specialization']);

        // Default to today
        if (!$request->date) {
            $query->whereDate('appointment_date', today());
        } else {
            $query->whereDate('appointment_date', $request->date);
        }

        // Status filter
        if ($request->status) {
            $query->where('status', $request->status);
        }

        // Search
        if ($request->search) {
            $query->whereHas('patient', function($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('phone', 'like', '%' . $request->search . '%');
            });
        }

        $appointments = $query->orderBy('appointment_time', 'asc')->paginate(15);

        // Get data for filters
        $doctors = Doctor::with('user')->active()->get();
        $specializations = Specialization::all();

        return Inertia::render('Receptionist/Appointments/Index', [
            'appointments' => $appointments,
            'doctors' => $doctors,
            'specializations' => $specializations,
            'filters' => $request->only(['date', 'status', 'search']),
        ]);
    }

    public function create()
    {
        $patients = Patient::active()->get();
        $doctors = Doctor::with('user.specialization')->active()->get();
        $specializations = Specialization::all();

        return Inertia::render('Receptionist/Appointments/Create', [
            'patients' => $patients,
            'doctors' => $doctors,
            'specializations' => $specializations,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'patient_id' => ['required', 'exists:patients,id'],
            'doctor_id' => ['required', 'exists:doctors,id'],
            'specialization_id' => ['required', 'exists:specializations,id'],
            'appointment_date' => ['required', 'date', 'after_or_equal:today'],
            'appointment_time' => ['required', 'date_format:H:i'],
            'type' => ['required', 'in:consultation,follow_up,emergency,surgery'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);

        // Get doctor's consultation fee
        $doctor = Doctor::findOrFail($validated['doctor_id']);
        $fee = $doctor->consultation_fee;

        // Check if doctor is available at this time
        $existingAppointment = Appointment::where('doctor_id', $validated['doctor_id'])
            ->where('appointment_date', $validated['appointment_date'])
            ->where('appointment_time', $validated['appointment_time'])
            ->whereIn('status', ['scheduled', 'confirmed'])
            ->first();

        if ($existingAppointment) {
            return back()->withErrors(['appointment_time' => 'الطبيب ليس متاحًا في هذا الوقت']);
        }

        $appointment = Appointment::create([
            ...$validated,
            'status' => 'scheduled',
            'fee' => $fee,
            'is_paid' => false,
        ]);

        return redirect()->route('receptionist.appointments.index')
            ->with('success', 'تم حجز الموعد بنجاح');
    }

    public function show(Appointment $appointment)
    {
        $appointment->load(['patient', 'doctor.user', 'specialization', 'medicalRecord', 'invoice']);

        return Inertia::render('Receptionist/Appointments/Show', [
            'appointment' => $appointment,
        ]);
    }

    public function checkIn(Appointment $appointment)
    {
        if ($appointment->status !== 'scheduled') {
            return back()->with('error', 'لا يمكن تسجيل حضور هذا الموعد');
        }

        $appointment->checkIn();

        return back()->with('success', 'تم تسجيل حضور المريض بنجاح');
    }

    public function cancel(Request $request, Appointment $appointment)
    {
        $validated = $request->validate([
            'cancellation_reason' => ['required', 'string', 'max:500'],
        ]);

        if (!$appointment->canBeCancelled()) {
            return back()->with('error', 'لا يمكن إلغاء هذا الموعد');
        }

        $appointment->cancel($validated['cancellation_reason']);

        return back()->with('success', 'تم إلغاء الموعد بنجاح');
    }

    public function getAvailableSlots(Request $request)
    {
        $validated = $request->validate([
            'doctor_id' => ['required', 'exists:doctors,id'],
            'date' => ['required', 'date'],
        ]);

        $doctor = Doctor::findOrFail($validated['doctor_id']);
        
        // Get doctor's schedule for this day
        $dayOfWeek = Carbon::parse($validated['date'])->dayOfWeek;
        $schedule = $doctor->schedules()->where('day_of_week', $dayOfWeek)->first();

        if (!$schedule) {
            return response()->json([]);
        }

        // Get existing appointments for this day
        $existingAppointments = Appointment::where('doctor_id', $validated['doctor_id'])
            ->where('appointment_date', $validated['date'])
            ->whereIn('status', ['scheduled', 'confirmed'])
            ->pluck('appointment_time')
            ->map(function($time) {
                return Carbon::parse($time)->format('H:i');
            })
            ->toArray();

        // Generate available slots
        $slots = [];
        $startTime = Carbon::parse($schedule->start_time);
        $endTime = Carbon::parse($schedule->end_time);
        $interval = 30; // 30 minutes

        while ($startTime < $endTime) {
            $timeSlot = $startTime->format('H:i');
            if (!in_array($timeSlot, $existingAppointments)) {
                $slots[] = $timeSlot;
            }
            $startTime->addMinutes($interval);
        }

        return response()->json($slots);
    }

    public function waitingList()
    {
        $waitingList = Appointment::with(['patient', 'doctor.user', 'specialization'])
            ->where('status', 'confirmed')
            ->whereDate('appointment_date', today())
            ->whereNotNull('checked_in_at')
            ->orderBy('checked_in_at')
            ->get();

        return Inertia::render('Receptionist/WaitingList', [
            'waitingList' => $waitingList,
        ]);
    }
}