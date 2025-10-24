<?php

namespace App\Http\Controllers\Doctor;

use App\Http\Controllers\Controller;
use App\Models\MedicalRecord;
use App\Models\Patient;
use App\Models\Appointment;
use App\Services\ActivityLogService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class MedicalRecordController extends Controller
{
    protected ActivityLogService $activityLogService;

    public function __construct(ActivityLogService $activityLogService)
    {
        $this->activityLogService = $activityLogService;
    }

    public function index(Request $request)
    {
        $doctor = Auth::user()->doctor;
        
        $query = MedicalRecord::with(['patient', 'appointments'])
            ->whereHas('appointments', function($q) use ($doctor) {
                $q->where('doctor_id', $doctor->id);
            });

        // Search by patient name
        if ($request->search) {
            $query->whereHas('patient', function($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('phone', 'like', '%' . $request->search . '%')
                  ->orWhere('national_id', 'like', '%' . $request->search . '%');
            });
        }

        // Filter by date range
        if ($request->date_from) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }
        if ($request->date_to) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        $medicalRecords = $query->orderBy('created_at', 'desc')->paginate(15);

        return Inertia::render('Doctor/MedicalRecords/Index', [
            'medicalRecords' => $medicalRecords,
            'filters' => $request->only(['search', 'date_from', 'date_to']),
        ]);
    }

    public function create(Request $request)
    {
        $doctor = Auth::user()->doctor;
        
        // Get patients that the doctor has appointments with
        $patients = Patient::whereHas('appointments', function($q) use ($doctor) {
            $q->where('doctor_id', $doctor->id);
        })->active()->get();

        // Get today's appointments for this doctor
        $todayAppointments = Appointment::with('patient')
            ->where('doctor_id', $doctor->id)
            ->whereDate('appointment_date', today())
            ->whereIn('status', ['confirmed', 'completed'])
            ->get();

        return Inertia::render('Doctor/MedicalRecords/Create', [
            'patients' => $patients,
            'todayAppointments' => $todayAppointments,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'patient_id' => ['required', 'exists:patients,id'],
            'appointment_id' => ['nullable', 'exists:appointments,id'],
            'chief_complaint' => ['required', 'string', 'max:1000'],
            'history_of_present_illness' => ['nullable', 'string', 'max:2000'],
            'past_medical_history' => ['nullable', 'string', 'max:2000'],
            'family_history' => ['nullable', 'string', 'max:2000'],
            'social_history' => ['nullable', 'string', 'max:2000'],
            'allergies' => ['nullable', 'string', 'max:1000'],
            'medications' => ['nullable', 'string', 'max:2000'],
            'vital_signs' => ['nullable', 'array'],
            'vital_signs.blood_pressure' => ['nullable', 'string', 'max:20'],
            'vital_signs.heart_rate' => ['nullable', 'integer', 'min:0', 'max:300'],
            'vital_signs.respiratory_rate' => ['nullable', 'integer', 'min:0', 'max:100'],
            'vital_signs.temperature' => ['nullable', 'numeric', 'min:30', 'max:45'],
            'vital_signs.weight' => ['nullable', 'numeric', 'min:0'],
            'vital_signs.height' => ['nullable', 'numeric', 'min:0'],
            'physical_examination' => ['nullable', 'string', 'max:3000'],
            'diagnosis' => ['required', 'string', 'max:1000'],
            'treatment_plan' => ['required', 'string', 'max:2000'],
            'follow_up_instructions' => ['nullable', 'string', 'max:2000'],
            'notes' => ['nullable', 'string', 'max:2000'],
        ]);

        $doctor = Auth::user()->doctor;
        
        $medicalRecord = MedicalRecord::create([
            ...$validated,
            'doctor_id' => $doctor->id,
            'record_date' => now(),
        ]);

        // Link to appointment if provided
        if ($request->appointment_id) {
            $appointment = Appointment::find($request->appointment_id);
            $appointment->update(['medical_record_id' => $medicalRecord->id]);
        }

        $this->activityLogService->logCreated($medicalRecord, Auth::user());

        return redirect()->route('doctor.medical-records.index')
            ->with('success', 'تم إنشاء السجل الطبي بنجاح');
    }

    public function show(MedicalRecord $medicalRecord)
    {
        // Check if this doctor has access to this medical record
        $doctor = Auth::user()->doctor;
        
        if ($medicalRecord->doctor_id !== $doctor->id) {
            abort(403, 'غير مصرح لك بالوصول إلى هذا السجل الطبي');
        }

        $medicalRecord->load([
            'patient',
            'doctor.user',
            'appointments',
            'prescriptions'
        ]);

        return Inertia::render('Doctor/MedicalRecords/Show', [
            'medicalRecord' => $medicalRecord,
        ]);
    }

    public function edit(MedicalRecord $medicalRecord)
    {
        // Check if this doctor has access to this medical record
        $doctor = Auth::user()->doctor;
        
        if ($medicalRecord->doctor_id !== $doctor->id) {
            abort(403, 'غير مصرح لك بتعديل هذا السجل الطبي');
        }

        // Only allow editing records created in the last 24 hours
        if ($medicalRecord->created_at->diffInHours(now()) > 24) {
            return back()->with('error', 'لا يمكن تعديل السجلات الطبية التي مر عليها أكثر من 24 ساعة');
        }

        $medicalRecord->load(['patient', 'appointments']);

        return Inertia::render('Doctor/MedicalRecords/Edit', [
            'medicalRecord' => $medicalRecord,
        ]);
    }

    public function update(Request $request, MedicalRecord $medicalRecord)
    {
        // Check if this doctor has access to this medical record
        $doctor = Auth::user()->doctor;
        
        if ($medicalRecord->doctor_id !== $doctor->id) {
            abort(403, 'غير مصرح لك بتعديل هذا السجل الطبي');
        }

        // Only allow editing records created in the last 24 hours
        if ($medicalRecord->created_at->diffInHours(now()) > 24) {
            return back()->with('error', 'لا يمكن تعديل السجلات الطبية التي مر عليها أكثر من 24 ساعة');
        }

        $validated = $request->validate([
            'chief_complaint' => ['required', 'string', 'max:1000'],
            'history_of_present_illness' => ['nullable', 'string', 'max:2000'],
            'past_medical_history' => ['nullable', 'string', 'max:2000'],
            'family_history' => ['nullable', 'string', 'max:2000'],
            'social_history' => ['nullable', 'string', 'max:2000'],
            'allergies' => ['nullable', 'string', 'max:1000'],
            'medications' => ['nullable', 'string', 'max:2000'],
            'vital_signs' => ['nullable', 'array'],
            'vital_signs.blood_pressure' => ['nullable', 'string', 'max:20'],
            'vital_signs.heart_rate' => ['nullable', 'integer', 'min:0', 'max:300'],
            'vital_signs.respiratory_rate' => ['nullable', 'integer', 'min:0', 'max:100'],
            'vital_signs.temperature' => ['nullable', 'numeric', 'min:30', 'max:45'],
            'vital_signs.weight' => ['nullable', 'numeric', 'min:0'],
            'vital_signs.height' => ['nullable', 'numeric', 'min:0'],
            'physical_examination' => ['nullable', 'string', 'max:3000'],
            'diagnosis' => ['required', 'string', 'max:1000'],
            'treatment_plan' => ['required', 'string', 'max:2000'],
            'follow_up_instructions' => ['nullable', 'string', 'max:2000'],
            'notes' => ['nullable', 'string', 'max:2000'],
        ]);

        $medicalRecord->update($validated);

        $this->activityLogService->logUpdated($medicalRecord, Auth::user());

        return redirect()->route('doctor.medical-records.show', $medicalRecord)
            ->with('success', 'تم تحديث السجل الطبي بنجاح');
    }

    public function print(MedicalRecord $medicalRecord)
    {
        // Check if this doctor has access to this medical record
        $doctor = Auth::user()->doctor;
        
        if ($medicalRecord->doctor_id !== $doctor->id) {
            abort(403, 'غير مصرح لك بالوصول إلى هذا السجل الطبي');
        }

        $medicalRecord->load([
            'patient',
            'doctor.user',
            'appointments',
            'prescriptions'
        ]);

        return Inertia::render('Doctor/MedicalRecords/Print', [
            'medicalRecord' => $medicalRecord,
        ]);
    }
}