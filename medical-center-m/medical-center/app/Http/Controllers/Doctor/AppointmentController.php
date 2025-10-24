<?php

namespace App\Http\Controllers\Doctor;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\Patient;
use App\Models\MedicalRecord;
use App\Models\Prescription;
use App\Services\AppointmentService;
use App\Services\ActivityLogService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
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
        $doctor = Auth::user()->doctor;
        
        $query = Appointment::with(['patient', 'specialization'])
            ->where('doctor_id', $doctor->id);

        // Date filter
        if ($request->date) {
            $query->whereDate('appointment_date', $request->date);
        } else {
            $query->whereDate('appointment_date', '>=', today());
        }

        // Status filter
        if ($request->status) {
            $query->where('status', $request->status);
        }

        // Search by patient name
        if ($request->search) {
            $query->whereHas('patient', function($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('phone', 'like', '%' . $request->search . '%');
            });
        }

        $appointments = $query->orderBy('appointment_date', 'asc')
            ->orderBy('appointment_time', 'asc')
            ->paginate(15);

        // Get today's appointments count
        $todayCount = Appointment::where('doctor_id', $doctor->id)
            ->whereDate('appointment_date', today())
            ->count();

        return Inertia::render('Doctor/Appointments/Index', [
            'appointments' => $appointments,
            'todayCount' => $todayCount,
            'filters' => $request->only(['date', 'status', 'search']),
        ]);
    }

    public function today()
    {
        $doctor = Auth::user()->doctor;
        
        $appointments = Appointment::with(['patient', 'specialization'])
            ->where('doctor_id', $doctor->id)
            ->whereDate('appointment_date', today())
            ->orderBy('appointment_time', 'asc')
            ->get();

        // Group by status
        $groupedAppointments = [
            'scheduled' => $appointments->where('status', 'scheduled'),
            'confirmed' => $appointments->where('status', 'confirmed'),
            'completed' => $appointments->where('status', 'completed'),
            'cancelled' => $appointments->where('status', 'cancelled'),
        ];

        return Inertia::render('Doctor/Appointments/Today', [
            'appointments' => $groupedAppointments,
            'totalAppointments' => $appointments->count(),
        ]);
    }

    public function show(Appointment $appointment)
    {
        // Check if this doctor has access to this appointment
        $doctor = Auth::user()->doctor;
        
        if ($appointment->doctor_id !== $doctor->id) {
            abort(403, 'غير مصرح لك بالوصول إلى هذا الموعد');
        }

        $appointment->load([
            'patient',
            'doctor.user',
            'specialization',
            'medicalRecord',
            'prescriptions'
        ]);

        return Inertia::render('Doctor/Appointments/Show', [
            'appointment' => $appointment,
        ]);
    }

    public function start(Appointment $appointment)
    {
        // Check if this doctor has access to this appointment
        $doctor = Auth::user()->doctor;
        
        if ($appointment->doctor_id !== $doctor->id) {
            abort(403, 'غير مصرح لك بالوصول إلى هذا الموعد');
        }

        if ($appointment->status !== 'confirmed') {
            return back()->with('error', 'لا يمكن بدء هذا الموعد');
        }

        return Inertia::render('Doctor/Appointments/Start', [
            'appointment' => $appointment->load(['patient', 'specialization']),
        ]);
    }

    public function complete(Request $request, Appointment $appointment)
    {
        // Check if this doctor has access to this appointment
        $doctor = Auth::user()->doctor;
        
        if ($appointment->doctor_id !== $doctor->id) {
            abort(403, 'غير مصرح لك بالوصول إلى هذا الموعد');
        }

        try {
            $this->appointmentService->completeAppointment($appointment);
            $this->activityLogService->logAppointmentStatusChange($appointment, 'confirmed', 'completed', Auth::user());

            // Check if medical record was created
            if ($request->has('medical_record_created') && $request->medical_record_created) {
                return redirect()->route('doctor.appointments.show', $appointment)
                    ->with('success', 'تم إكمال الموعد بنجاح وإنشاء السجل الطبي');
            }

            return redirect()->route('doctor.appointments.today')
                ->with('success', 'تم إكمال الموعد بنجاح');
        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    public function cancel(Request $request, Appointment $appointment)
    {
        // Check if this doctor has access to this appointment
        $doctor = Auth::user()->doctor;
        
        if ($appointment->doctor_id !== $doctor->id) {
            abort(403, 'غير مصرح لك بإلغاء هذا الموعد');
        }

        $validated = $request->validate([
            'cancellation_reason' => ['required', 'string', 'max:500'],
        ]);

        try {
            $this->appointmentService->cancelAppointment($appointment, $validated['cancellation_reason']);
            $this->activityLogService->logAppointmentStatusChange($appointment, $appointment->status, 'cancelled', Auth::user());

            return back()->with('success', 'تم إلغاء الموعد بنجاح');
        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    public function reschedule(Request $request, Appointment $appointment)
    {
        // Check if this doctor has access to this appointment
        $doctor = Auth::user()->doctor;
        
        if ($appointment->doctor_id !== $doctor->id) {
            abort(403, 'غير مصرح لك بتعديل هذا الموعد');
        }

        $validated = $request->validate([
            'appointment_date' => ['required', 'date', 'after_or_equal:today'],
            'appointment_time' => ['required', 'date_format:H:i'],
            'reason' => ['required', 'string', 'max:500'],
        ]);

        try {
            // Check availability
            $this->appointmentService->checkDoctorAvailability(
                $appointment->doctor_id, 
                $validated['appointment_date'], 
                $validated['appointment_time']
            );

            $oldDate = $appointment->appointment_date->format('Y-m-d H:i');
            
            $appointment->update([
                'appointment_date' => $validated['appointment_date'],
                'appointment_time' => $validated['appointment_time'],
                'status' => 'scheduled', // Reset to scheduled when rescheduled
            ]);

            // Add note about rescheduling
            $notes = $appointment->notes ? $appointment->notes . "\n\n" : '';
            $notes .= "تم إعادة جدولة الموعد من {$oldDate} إلى {$validated['appointment_date']} {$validated['appointment_time']}. السبب: {$validated['reason']}";
            $appointment->update(['notes' => $notes]);

            $this->activityLogService->logUpdated($appointment, Auth::user());

            return back()->with('success', 'تم إعادة جدولة الموعد بنجاح');
        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    public function calendar(Request $request)
    {
        $doctor = Auth::user()->doctor;
        
        $date = $request->date ?? today()->toDateString();
        $month = $request->month ?? today()->format('Y-m');
        
        if ($request->view === 'month') {
            // Get month view
            $appointments = Appointment::where('doctor_id', $doctor->id)
                ->whereMonth('appointment_date', substr($month, 5, 2))
                ->whereYear('appointment_date', substr($month, 0, 4))
                ->with(['patient', 'specialization'])
                ->orderBy('appointment_date')
                ->orderBy('appointment_time')
                ->get();
        } else {
            // Get day view
            $appointments = Appointment::where('doctor_id', $doctor->id)
                ->whereDate('appointment_date', $date)
                ->with(['patient', 'specialization'])
                ->orderBy('appointment_time')
                ->get();
        }

        return Inertia::render('Doctor/Appointments/Calendar', [
            'appointments' => $appointments,
            'date' => $date,
            'month' => $month,
            'view' => $request->view ?? 'day',
        ]);
    }
}