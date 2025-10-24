<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\Patient;
use App\Models\Doctor;
use App\Models\Specialization;
use App\Services\AppointmentService;
use App\Services\ActivityLogService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class AppointmentController extends Controller
{
    protected AppointmentService $appointmentService;
    protected ActivityLogService $activityLogService;

    public function __construct(AppointmentService $appointmentService, ActivityLogService $activityLogService)
    {
        $this->appointmentService = $appointmentService;
        $this->activityLogService = $activityLogService;
    }
    public function index(Request $request)
    {
        $query = Appointment::with(['patient', 'doctor.user', 'specialization']);

        // Date filter
        if ($request->date) {
            $query->whereDate('appointment_date', $request->date);
        } else {
            $query->whereDate('appointment_date', today());
        }

        // Status filter
        if ($request->status) {
            $query->where('status', $request->status);
        }

        // Doctor filter
        if ($request->doctor_id) {
            $query->where('doctor_id', $request->doctor_id);
        }

        // Search
        if ($request->search) {
            $query->whereHas('patient', function($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('phone', 'like', '%' . $request->search . '%');
            });
        }

        $appointments = $query->orderBy('appointment_time', 'asc')->paginate(15);

        // Get filters data
        $doctors = Doctor::with('user')->active()->get();
        $specializations = Specialization::all();

        return Inertia::render('Admin/Appointments/Index', [
            'appointments' => $appointments,
            'doctors' => $doctors,
            'specializations' => $specializations,
            'filters' => $request->only(['date', 'status', 'doctor_id', 'search']),
        ]);
    }

    public function create()
    {
        $patients = Patient::active()->get();
        $doctors = Doctor::with('user.specialization')->active()->get();
        $specializations = Specialization::all();

        return Inertia::render('Admin/Appointments/Create', [
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
            'fee' => ['required', 'numeric', 'min:0'],
        ]);

        try {
            $appointment = $this->appointmentService->createAppointment($validated);
            
            $this->activityLogService->logCreated($appointment, auth()->user());

            return redirect()->route('admin.appointments.index')
                ->with('success', 'تم حجز الموعد بنجاح');
        } catch (\Exception $e) {
            return back()->withErrors(['appointment_time' => $e->getMessage()]);
        }
    }

    public function show(Appointment $appointment)
    {
        $appointment->load(['patient', 'doctor.user', 'specialization', 'medicalRecord', 'invoice']);

        return Inertia::render('Admin/Appointments/Show', [
            'appointment' => $appointment,
        ]);
    }

    public function edit(Appointment $appointment)
    {
        $appointment->load(['patient', 'doctor', 'specialization']);
        
        $patients = Patient::active()->get();
        $doctors = Doctor::with('user.specialization')->active()->get();
        $specializations = Specialization::all();

        return Inertia::render('Admin/Appointments/Edit', [
            'appointment' => $appointment,
            'patients' => $patients,
            'doctors' => $doctors,
            'specializations' => $specializations,
        ]);
    }

    public function update(Request $request, Appointment $appointment)
    {
        $validated = $request->validate([
            'patient_id' => ['required', 'exists:patients,id'],
            'doctor_id' => ['required', 'exists:doctors,id'],
            'specialization_id' => ['required', 'exists:specializations,id'],
            'appointment_date' => ['required', 'date', 'after_or_equal:today'],
            'appointment_time' => ['required', 'date_format:H:i'],
            'type' => ['required', 'in:consultation,follow_up,emergency,surgery'],
            'notes' => ['nullable', 'string', 'max:1000'],
            'fee' => ['required', 'numeric', 'min:0'],
        ]);

        // Check if doctor is available at this time (excluding current appointment)
        $existingAppointment = Appointment::where('doctor_id', $validated['doctor_id'])
            ->where('appointment_date', $validated['appointment_date'])
            ->where('appointment_time', $validated['appointment_time'])
            ->where('id', '!=', $appointment->id)
            ->whereIn('status', ['scheduled', 'confirmed'])
            ->first();

        if ($existingAppointment) {
            return back()->withErrors(['appointment_time' => 'الطبيب ليس متاحًا في هذا الوقت']);
        }

        $appointment->update($validated);

        return redirect()->route('admin.appointments.index')
            ->with('success', 'تم تحديث الموعد بنجاح');
    }

    public function destroy(Appointment $appointment)
    {
        $appointment->delete();

        return redirect()->route('admin.appointments.index')
            ->with('success', 'تم حذف الموعد بنجاح');
    }

    public function confirm(Appointment $appointment)
    {
        try {
            $this->appointmentService->confirmAppointment($appointment);
            $this->activityLogService->logAppointmentStatusChange($appointment, 'scheduled', 'confirmed', auth()->user());

            return back()->with('success', 'تم تأكيد الموعد بنجاح');
        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    public function complete(Appointment $appointment)
    {
        try {
            $this->appointmentService->completeAppointment($appointment);
            $this->activityLogService->logAppointmentStatusChange($appointment, 'confirmed', 'completed', auth()->user());

            return back()->with('success', 'تم إكمال الموعد بنجاح');
        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    public function cancel(Request $request, Appointment $appointment)
    {
        $validated = $request->validate([
            'cancellation_reason' => ['required', 'string', 'max:500'],
        ]);

        try {
            $this->appointmentService->cancelAppointment($appointment, $validated['cancellation_reason']);
            $this->activityLogService->logAppointmentStatusChange($appointment, $appointment->status, 'cancelled', auth()->user());

            return back()->with('success', 'تم إلغاء الموعد بنجاح');
        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    public function calendar(Request $request)
    {
        $date = $request->date ?? today()->toDateString();
        
        $appointments = Appointment::with(['patient', 'doctor.user', 'specialization'])
            ->whereDate('appointment_date', $date)
            ->orderBy('appointment_time')
            ->get();

        return Inertia::render('Admin/Appointments/Calendar', [
            'appointments' => $appointments,
            'date' => $date,
        ]);
    }
}