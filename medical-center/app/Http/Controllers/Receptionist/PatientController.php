<?php

namespace App\Http\Controllers\Receptionist;

use App\Http\Controllers\Controller;
use App\Models\Patient;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Validation\Rule;

class PatientController extends Controller
{
    public function index(Request $request)
    {
        $query = Patient::query();

        // Search
        if ($request->search) {
            $query->where(function($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('email', 'like', '%' . $request->search . '%')
                  ->orWhere('phone', 'like', '%' . $request->search . '%')
                  ->orWhere('national_id', 'like', '%' . $request->search . '%');
            });
        }

        // Status filter
        if ($request->status) {
            $query->where('status', $request->status === 'active');
        }

        $patients = $query->orderBy('created_at', 'desc')->paginate(15);

        return Inertia::render('Receptionist/Patients/Index', [
            'patients' => $patients,
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    public function create()
    {
        return Inertia::render('Receptionist/Patients/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['nullable', 'string', 'email', 'max:255', 'unique:patients'],
            'phone' => ['required', 'string', 'max:20', 'unique:patients'],
            'date_of_birth' => ['required', 'date', 'before:today'],
            'gender' => ['required', 'in:male,female'],
            'blood_type' => ['nullable', 'in:A+,A-,B+,B-,AB+,AB-,O+,O-'],
            'address' => ['nullable', 'string', 'max:500'],
            'emergency_contact' => ['nullable', 'string', 'max:20'],
            'medical_history' => ['nullable', 'string', 'max:2000'],
            'allergies' => ['nullable', 'string', 'max:1000'],
            'national_id' => ['nullable', 'string', 'max:20', 'unique:patients'],
            'insurance_number' => ['nullable', 'string', 'max:50'],
        ]);

        $patient = Patient::create([
            ...$validated,
            'status' => true,
        ]);

        return redirect()->route('receptionist.patients.index')
            ->with('success', 'تم إضافة المريض بنجاح');
    }

    public function show(Patient $patient)
    {
        $patient->load([
            'appointments' => function($query) {
                $query->with(['doctor.user', 'specialization'])
                      ->orderBy('appointment_date', 'desc')
                      ->limit(10);
            },
            'medicalRecords' => function($query) {
                $query->with('doctor.user')
                      ->orderBy('created_at', 'desc')
                      ->limit(10);
            },
            'prescriptions' => function($query) {
                $query->with('doctor.user')
                      ->orderBy('created_at', 'desc')
                      ->limit(10);
            }
        ]);

        return Inertia::render('Receptionist/Patients/Show', [
            'patient' => $patient,
        ]);
    }

    public function edit(Patient $patient)
    {
        return Inertia::render('Receptionist/Patients/Edit', [
            'patient' => $patient,
        ]);
    }

    public function update(Request $request, Patient $patient)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['nullable', 'string', 'email', 'max:255', Rule::unique('patients')->ignore($patient->id)],
            'phone' => ['required', 'string', 'max:20', Rule::unique('patients')->ignore($patient->id)],
            'date_of_birth' => ['required', 'date', 'before:today'],
            'gender' => ['required', 'in:male,female'],
            'blood_type' => ['nullable', 'in:A+,A-,B+,B-,AB+,AB-,O+,O-'],
            'address' => ['nullable', 'string', 'max:500'],
            'emergency_contact' => ['nullable', 'string', 'max:20'],
            'medical_history' => ['nullable', 'string', 'max:2000'],
            'allergies' => ['nullable', 'string', 'max:1000'],
            'national_id' => ['nullable', 'string', 'max:20', Rule::unique('patients')->ignore($patient->id)],
            'insurance_number' => ['nullable', 'string', 'max:50'],
        ]);

        $patient->update($validated);

        return redirect()->route('receptionist.patients.index')
            ->with('success', 'تم تحديث بيانات المريض بنجاح');
    }

    public function destroy(Patient $patient)
    {
        // Check if patient has appointments
        if ($patient->appointments()->exists()) {
            return back()->with('error', 'لا يمكن حذف المريض لوجود مواعيد مرتبطة به');
        }

        $patient->delete();

        return redirect()->route('receptionist.patients.index')
            ->with('success', 'تم حذف المريض بنجاح');
    }

    public function search(Request $request)
    {
        $query = $request->get('q');
        
        if (!$query || strlen($query) < 2) {
            return response()->json([]);
        }

        $patients = Patient::where('name', 'like', '%' . $query . '%')
            ->orWhere('phone', 'like', '%' . $query . '%')
            ->orWhere('national_id', 'like', '%' . $query . '%')
            ->active()
            ->limit(10)
            ->get(['id', 'name', 'phone', 'national_id']);

        return response()->json($patients);
    }
}