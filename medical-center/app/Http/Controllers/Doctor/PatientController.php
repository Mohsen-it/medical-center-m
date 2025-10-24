<?php

namespace App\Http\Controllers\Doctor;

use App\Http\Controllers\Controller;
use App\Models\Patient;
use App\Models\MedicalRecord;
use App\Models\Appointment;
use App\Models\Prescription;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class PatientController extends Controller
{
    public function index(Request $request)
    {
        $doctor = Auth::user()->doctor;
        
        // Get patients that this doctor has appointments with
        $query = Patient::whereHas('appointments', function($q) use ($doctor) {
            $q->where('doctor_id', $doctor->id);
        })->with(['appointments' => function($q) use ($doctor) {
            $q->where('doctor_id', $doctor->id)
              ->orderBy('appointment_date', 'desc')
              ->take(3);
        }]);

        // Search
        if ($request->search) {
            $query->where(function($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('phone', 'like', '%' . $request->search . '%')
                  ->orWhere('email', 'like', '%' . $request->search . '%')
                  ->orWhere('national_id', 'like', '%' . $request->search . '%');
            });
        }

        // Filter by status
        if ($request->status) {
            $query->where('status', $request->status);
        }

        $patients = $query->orderBy('name')->paginate(15);

        return Inertia::render('Doctor/Patients/Index', [
            'patients' => $patients,
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    public function show(Patient $patient)
    {
        $doctor = Auth::user()->doctor;
        
        // Check if this doctor has access to this patient
        $hasAccess = Appointment::where('doctor_id', $doctor->id)
            ->where('patient_id', $patient->id)
            ->exists();

        if (!$hasAccess) {
            abort(403, 'غير مصرح لك بالوصول إلى بيانات هذا المريض');
        }

        // Load patient's data related to this doctor
        $patient->load([
            'appointments' => function($q) use ($doctor) {
                $q->where('doctor_id', $doctor->id)
                  ->with(['specialization'])
                  ->orderBy('appointment_date', 'desc')
                  ->take(10);
            },
            'medicalRecords' => function($q) use ($doctor) {
                $q->where('doctor_id', $doctor->id)
                  ->orderBy('created_at', 'desc')
                  ->take(5);
            },
            'prescriptions' => function($q) use ($doctor) {
                $q->where('doctor_id', $doctor->id)
                  ->orderBy('prescription_date', 'desc')
                  ->take(5);
            }
        ]);

        // Get statistics
        $stats = [
            'total_appointments' => Appointment::where('doctor_id', $doctor->id)
                ->where('patient_id', $patient->id)
                ->count(),
            'completed_appointments' => Appointment::where('doctor_id', $doctor->id)
                ->where('patient_id', $patient->id)
                ->where('status', 'completed')
                ->count(),
            'medical_records_count' => MedicalRecord::where('doctor_id', $doctor->id)
                ->where('patient_id', $patient->id)
                ->count(),
            'prescriptions_count' => Prescription::where('doctor_id', $doctor->id)
                ->where('patient_id', $patient->id)
                ->count(),
            'last_visit' => Appointment::where('doctor_id', $doctor->id)
                ->where('patient_id', $patient->id)
                ->where('status', 'completed')
                ->orderBy('appointment_date', 'desc')
                ->first(),
        ];

        return Inertia::render('Doctor/Patients/Show', [
            'patient' => $patient,
            'stats' => $stats,
        ]);
    }

    public function medicalHistory(Patient $patient)
    {
        $doctor = Auth::user()->doctor;
        
        // Check if this doctor has access to this patient
        $hasAccess = Appointment::where('doctor_id', $doctor->id)
            ->where('patient_id', $patient->id)
            ->exists();

        if (!$hasAccess) {
            abort(403, 'غير مصرح لك بالوصول إلى بيانات هذا المريض');
        }

        $medicalRecords = MedicalRecord::with(['appointments'])
            ->where('doctor_id', $doctor->id)
            ->where('patient_id', $patient->id)
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return Inertia::render('Doctor/Patients/MedicalHistory', [
            'patient' => $patient,
            'medicalRecords' => $medicalRecords,
        ]);
    }

    public function prescriptions(Patient $patient)
    {
        $doctor = Auth::user()->doctor;
        
        // Check if this doctor has access to this patient
        $hasAccess = Appointment::where('doctor_id', $doctor->id)
            ->where('patient_id', $patient->id)
            ->exists();

        if (!$hasAccess) {
            abort(403, 'غير مصرح لك بالوصول إلى بيانات هذا المريض');
        }

        $prescriptions = Prescription::with(['medicalRecord'])
            ->where('doctor_id', $doctor->id)
            ->where('patient_id', $patient->id)
            ->orderBy('prescription_date', 'desc')
            ->paginate(10);

        return Inertia::render('Doctor/Patients/Prescriptions', [
            'patient' => $patient,
            'prescriptions' => $prescriptions,
        ]);
    }

    public function appointments(Patient $patient)
    {
        $doctor = Auth::user()->doctor;
        
        // Check if this doctor has access to this patient
        $hasAccess = Appointment::where('doctor_id', $doctor->id)
            ->where('patient_id', $patient->id)
            ->exists();

        if (!$hasAccess) {
            abort(403, 'غير مصرح لك بالوصول إلى بيانات هذا المريض');
        }

        $appointments = Appointment::with(['specialization'])
            ->where('doctor_id', $doctor->id)
            ->where('patient_id', $patient->id)
            ->orderBy('appointment_date', 'desc')
            ->paginate(15);

        return Inertia::render('Doctor/Patients/Appointments', [
            'patient' => $patient,
            'appointments' => $appointments,
        ]);
    }
}