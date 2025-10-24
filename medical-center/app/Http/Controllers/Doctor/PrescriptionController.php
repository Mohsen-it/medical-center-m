<?php

namespace App\Http\Controllers\Doctor;

use App\Http\Controllers\Controller;
use App\Models\Prescription;
use App\Models\MedicalRecord;
use App\Models\Patient;
use App\Services\ActivityLogService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class PrescriptionController extends Controller
{
    protected ActivityLogService $activityLogService;

    public function __construct(ActivityLogService $activityLogService)
    {
        $this->activityLogService = $activityLogService;
    }

    public function index(Request $request)
    {
        $doctor = Auth::user()->doctor;
        
        $query = Prescription::with(['patient', 'medicalRecord'])
            ->where('doctor_id', $doctor->id);

        // Search by patient name
        if ($request->search) {
            $query->whereHas('patient', function($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('phone', 'like', '%' . $request->search . '%');
            });
        }

        // Filter by status
        if ($request->status) {
            $query->where('status', $request->status);
        }

        // Filter by date range
        if ($request->date_from) {
            $query->whereDate('prescription_date', '>=', $request->date_from);
        }
        if ($request->date_to) {
            $query->whereDate('prescription_date', '<=', $request->date_to);
        }

        $prescriptions = $query->orderBy('prescription_date', 'desc')->paginate(15);

        return Inertia::render('Doctor/Prescriptions/Index', [
            'prescriptions' => $prescriptions,
            'filters' => $request->only(['search', 'status', 'date_from', 'date_to']),
        ]);
    }

    public function create(Request $request)
    {
        $doctor = Auth::user()->doctor;
        
        // Get patients that the doctor has medical records with
        $patients = Patient::whereHas('medicalRecords', function($q) use ($doctor) {
            $q->where('doctor_id', $doctor->id);
        })->active()->get();

        // Get medical records for this doctor
        $medicalRecords = MedicalRecord::with('patient')
            ->where('doctor_id', $doctor->id)
            ->orderBy('created_at', 'desc')
            ->take(50)
            ->get();

        return Inertia::render('Doctor/Prescriptions/Create', [
            'patients' => $patients,
            'medicalRecords' => $medicalRecords,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'patient_id' => ['required', 'exists:patients,id'],
            'medical_record_id' => ['nullable', 'exists:medical_records,id'],
            'diagnosis' => ['required', 'string', 'max:1000'],
            'medications' => ['required', 'array', 'min:1'],
            'medications.*.medication_name' => ['required', 'string', 'max:200'],
            'medications.*.dosage' => ['required', 'string', 'max:100'],
            'medications.*.frequency' => ['required', 'string', 'max:100'],
            'medications.*.duration' => ['required', 'string', 'max:100'],
            'medications.*.instructions' => ['nullable', 'string', 'max:500'],
            'medications.*.quantity' => ['required', 'integer', 'min:1'],
            'medications.*.refills' => ['nullable', 'integer', 'min:0'],
            'instructions' => ['nullable', 'string', 'max:2000'],
            'notes' => ['nullable', 'string', 'max:1000'],
            'follow_up_date' => ['nullable', 'date', 'after:today'],
        ]);

        $doctor = Auth::user()->doctor;
        
        $prescription = Prescription::create([
            ...$validated,
            'doctor_id' => $doctor->id,
            'prescription_date' => now(),
            'status' => 'active',
        ]);

        $this->activityLogService->logCreated($prescription, Auth::user());

        return redirect()->route('doctor.prescriptions.index')
            ->with('success', 'تم إنشاء الوصفة الطبية بنجاح');
    }

    public function show(Prescription $prescription)
    {
        // Check if this doctor has access to this prescription
        $doctor = Auth::user()->doctor;
        
        if ($prescription->doctor_id !== $doctor->id) {
            abort(403, 'غير مصرح لك بالوصول إلى هذه الوصفة الطبية');
        }

        $prescription->load([
            'patient',
            'doctor.user',
            'medicalRecord'
        ]);

        return Inertia::render('Doctor/Prescriptions/Show', [
            'prescription' => $prescription,
        ]);
    }

    public function edit(Prescription $prescription)
    {
        // Check if this doctor has access to this prescription
        $doctor = Auth::user()->doctor;
        
        if ($prescription->doctor_id !== $doctor->id) {
            abort(403, 'غير مصرح لك بتعديل هذه الوصفة الطبية');
        }

        // Only allow editing prescriptions created in the last 24 hours
        if ($prescription->created_at->diffInHours(now()) > 24) {
            return back()->with('error', 'لا يمكن تعديل الوصفات الطبية التي مر عليها أكثر من 24 ساعة');
        }

        $prescription->load(['patient', 'medicalRecord']);

        return Inertia::render('Doctor/Prescriptions/Edit', [
            'prescription' => $prescription,
        ]);
    }

    public function update(Request $request, Prescription $prescription)
    {
        // Check if this doctor has access to this prescription
        $doctor = Auth::user()->doctor;
        
        if ($prescription->doctor_id !== $doctor->id) {
            abort(403, 'غير مصرح لك بتعديل هذه الوصفة الطبية');
        }

        // Only allow editing prescriptions created in the last 24 hours
        if ($prescription->created_at->diffInHours(now()) > 24) {
            return back()->with('error', 'لا يمكن تعديل الوصفات الطبية التي مر عليها أكثر من 24 ساعة');
        }

        $validated = $request->validate([
            'diagnosis' => ['required', 'string', 'max:1000'],
            'medications' => ['required', 'array', 'min:1'],
            'medications.*.medication_name' => ['required', 'string', 'max:200'],
            'medications.*.dosage' => ['required', 'string', 'max:100'],
            'medications.*.frequency' => ['required', 'string', 'max:100'],
            'medications.*.duration' => ['required', 'string', 'max:100'],
            'medications.*.instructions' => ['nullable', 'string', 'max:500'],
            'medications.*.quantity' => ['required', 'integer', 'min:1'],
            'medications.*.refills' => ['nullable', 'integer', 'min:0'],
            'instructions' => ['nullable', 'string', 'max:2000'],
            'notes' => ['nullable', 'string', 'max:1000'],
            'follow_up_date' => ['nullable', 'date', 'after:today'],
        ]);

        $prescription->update($validated);

        $this->activityLogService->logUpdated($prescription, Auth::user());

        return redirect()->route('doctor.prescriptions.show', $prescription)
            ->with('success', 'تم تحديث الوصفة الطبية بنجاح');
    }

    public function activate(Prescription $prescription)
    {
        // Check if this doctor has access to this prescription
        $doctor = Auth::user()->doctor;
        
        if ($prescription->doctor_id !== $doctor->id) {
            abort(403, 'غير مصرح لك بتعديل هذه الوصفة الطبية');
        }

        $prescription->update(['status' => 'active']);

        $this->activityLogService->logUpdated($prescription, Auth::user());

        return back()->with('success', 'تم تفعيل الوصفة الطبية بنجاح');
    }

    public function deactivate(Prescription $prescription)
    {
        // Check if this doctor has access to this prescription
        $doctor = Auth::user()->doctor;
        
        if ($prescription->doctor_id !== $doctor->id) {
            abort(403, 'غير مصرح لك بتعديل هذه الوصفة الطبية');
        }

        $prescription->update(['status' => 'inactive']);

        $this->activityLogService->logUpdated($prescription, Auth::user());

        return back()->with('success', 'تم إلغاء تفعيل الوصفة الطبية بنجاح');
    }

    public function print(Prescription $prescription)
    {
        // Check if this doctor has access to this prescription
        $doctor = Auth::user()->doctor;
        
        if ($prescription->doctor_id !== $doctor->id) {
            abort(403, 'غير مصرح لك بالوصول إلى هذه الوصفة الطبية');
        }

        $prescription->load([
            'patient',
            'doctor.user',
            'medicalRecord'
        ]);

        return Inertia::render('Doctor/Prescriptions/Print', [
            'prescription' => $prescription,
        ]);
    }
}