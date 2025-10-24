<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\Patient;
use App\Models\Doctor;
use App\Models\Invoice;
use App\Models\Payment;
use App\Models\MedicalRecord;
use App\Models\Prescription;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;
use DB;

class ReportController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Reports/Index');
    }

    public function appointments(Request $request)
    {
        $startDate = $request->start_date ?? Carbon::now()->startOfMonth();
        $endDate = $request->end_date ?? Carbon::now()->endOfMonth();
        
        $query = Appointment::with(['patient', 'doctor.user', 'specialization'])
            ->whereBetween('appointment_date', [$startDate, $endDate]);

        // Filters
        if ($request->doctor_id) {
            $query->where('doctor_id', $request->doctor_id);
        }
        if ($request->specialization_id) {
            $query->where('specialization_id', $request->specialization_id);
        }
        if ($request->status) {
            $query->where('status', $request->status);
        }

        $appointments = $query->orderBy('appointment_date', 'desc')->get();

        // Statistics
        $stats = [
            'total' => $appointments->count(),
            'completed' => $appointments->where('status', 'completed')->count(),
            'cancelled' => $appointments->where('status', 'cancelled')->count(),
            'pending' => $appointments->whereIn('status', ['scheduled', 'confirmed'])->count(),
            'total_revenue' => $appointments->where('status', 'completed')->sum('fee'),
        ];

        // Daily statistics
        $dailyStats = Appointment::whereBetween('appointment_date', [$startDate, $endDate])
            ->selectRaw('DATE(appointment_date) as date, COUNT(*) as count, SUM(fee) as revenue')
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        // Doctor performance
        $doctorStats = Appointment::whereBetween('appointment_date', [$startDate, $endDate])
            ->where('status', 'completed')
            ->join('doctors', 'appointments.doctor_id', '=', 'doctors.id')
            ->join('users', 'doctors.user_id', '=', 'users.id')
            ->selectRaw('
                doctors.id,
                users.name as doctor_name,
                COUNT(*) as total_appointments,
                SUM(appointments.fee) as total_revenue,
                AVG(appointments.fee) as avg_fee
            ')
            ->groupBy('doctors.id', 'users.name')
            ->orderBy('total_appointments', 'desc')
            ->get();

        return Inertia::render('Admin/Reports/Appointments', [
            'appointments' => $appointments,
            'stats' => $stats,
            'dailyStats' => $dailyStats,
            'doctorStats' => $doctorStats,
            'filters' => $request->only(['start_date', 'end_date', 'doctor_id', 'specialization_id', 'status']),
            'doctors' => Doctor::with('user')->active()->get(),
        ]);
    }

    public function patients(Request $request)
    {
        $startDate = $request->start_date ?? Carbon::now()->startOfMonth();
        $endDate = $request->end_date ?? Carbon::now()->endOfMonth();
        
        $query = Patient::with(['appointments' => function($q) use ($startDate, $endDate) {
            $q->whereBetween('appointment_date', [$startDate, $endDate]);
        }]);

        // Filters
        if ($request->status) {
            $query->where('status', $request->status);
        }
        if ($request->gender) {
            $query->where('gender', $request->gender);
        }
        if ($request->age_min) {
            $query->whereRaw('DATE_PART(\'year\', AGE(NOW(), date_of_birth)) >= ?', [$request->age_min]);
        }
        if ($request->age_max) {
            $query->whereRaw('DATE_PART(\'year\', AGE(NOW(), date_of_birth)) <= ?', [$request->age_max]);
        }

        $patients = $query->orderBy('created_at', 'desc')->get();

        // Statistics
        $stats = [
            'total' => $patients->count(),
            'active' => $patients->where('status', 'active')->count(),
            'new_this_month' => $patients->filter(function($patient) use ($startDate, $endDate) {
                return $patient->created_at->between($startDate, $endDate);
            })->count(),
            'with_appointments' => $patients->filter(function($patient) {
                return $patient->appointments->count() > 0;
            })->count(),
        ];

        // Age groups
        $ageGroups = [
            '0-18' => 0,
            '19-35' => 0,
            '36-50' => 0,
            '51-65' => 0,
            '65+' => 0,
        ];

        foreach ($patients as $patient) {
            $age = $patient->date_of_birth ? Carbon::parse($patient->date_of_birth)->age : 0;
            if ($age <= 18) $ageGroups['0-18']++;
            elseif ($age <= 35) $ageGroups['19-35']++;
            elseif ($age <= 50) $ageGroups['36-50']++;
            elseif ($age <= 65) $ageGroups['51-65']++;
            else $ageGroups['65+']++;
        }

        // Gender distribution
        $genderStats = [
            'male' => $patients->where('gender', 'male')->count(),
            'female' => $patients->where('gender', 'female')->count(),
        ];

        return Inertia::render('Admin/Reports/Patients', [
            'patients' => $patients,
            'stats' => $stats,
            'ageGroups' => $ageGroups,
            'genderStats' => $genderStats,
            'filters' => $request->only(['start_date', 'end_date', 'status', 'gender', 'age_min', 'age_max']),
        ]);
    }

    public function financial(Request $request)
    {
        $startDate = $request->start_date ?? Carbon::now()->startOfMonth();
        $endDate = $request->end_date ?? Carbon::now()->endOfMonth();
        
        // Invoices
        $invoicesQuery = Invoice::whereBetween('created_at', [$startDate, $endDate]);
        
        if ($request->status) {
            $invoicesQuery->where('status', $request->status);
        }

        $invoices = $invoicesQuery->with(['patient', 'doctor.user'])->get();

        // Payments
        $paymentsQuery = Payment::whereBetween('payment_date', [$startDate, $endDate]);
        
        if ($request->payment_method) {
            $paymentsQuery->where('payment_method', $request->payment_method);
        }

        $payments = $paymentsQuery->with(['invoice.patient', 'invoice.doctor.user'])->get();

        // Statistics
        $stats = [
            'total_invoices' => $invoices->count(),
            'total_amount' => $invoices->sum('total_amount'),
            'paid_amount' => $payments->sum('amount'),
            'pending_amount' => $invoices->where('status', 'pending')->sum('total_amount'),
            'overdue_amount' => $invoices->where('status', 'overdue')->sum('total_amount'),
            'total_payments' => $payments->count(),
        ];

        // Daily revenue
        $dailyRevenue = Payment::whereBetween('payment_date', [$startDate, $endDate])
            ->selectRaw('DATE(payment_date) as date, SUM(amount) as total')
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        // Payment methods
        $paymentMethods = Payment::whereBetween('payment_date', [$startDate, $endDate])
            ->selectRaw('payment_method, COUNT(*) as count, SUM(amount) as total')
            ->groupBy('payment_method')
            ->get();

        // Top services
        $topServices = DB::table('invoice_items')
            ->join('invoices', 'invoice_items.invoice_id', '=', 'invoices.id')
            ->whereBetween('invoices.created_at', [$startDate, $endDate])
            ->selectRaw('description, COUNT(*) as count, SUM(total) as revenue')
            ->groupBy('description')
            ->orderBy('revenue', 'desc')
            ->limit(10)
            ->get();

        return Inertia::render('Admin/Reports/Financial', [
            'invoices' => $invoices,
            'payments' => $payments,
            'stats' => $stats,
            'dailyRevenue' => $dailyRevenue,
            'paymentMethods' => $paymentMethods,
            'topServices' => $topServices,
            'filters' => $request->only(['start_date', 'end_date', 'status', 'payment_method']),
        ]);
    }

    public function doctors(Request $request)
    {
        $startDate = $request->start_date ?? Carbon::now()->startOfMonth();
        $endDate = $request->end_date ?? Carbon::now()->endOfMonth();
        
        $doctors = Doctor::with(['user', 'specialization', 'appointments' => function($q) use ($startDate, $endDate) {
            $q->whereBetween('appointment_date', [$startDate, $endDate]);
        }])->get();

        // Doctor statistics
        $doctorStats = $doctors->map(function($doctor) use ($startDate, $endDate) {
            $appointments = $doctor->appointments;
            $completedAppointments = $appointments->where('status', 'completed');
            
            return [
                'id' => $doctor->id,
                'name' => $doctor->user->name,
                'specialization' => $doctor->specialization->name,
                'total_appointments' => $appointments->count(),
                'completed_appointments' => $completedAppointments->count(),
                'cancelled_appointments' => $appointments->where('status', 'cancelled')->count(),
                'completion_rate' => $appointments->count() > 0 ? 
                    round(($completedAppointments->count() / $appointments->count()) * 100, 2) : 0,
                'total_revenue' => $completedAppointments->sum('fee'),
                'avg_fee' => $completedAppointments->count() > 0 ? 
                    round($completedAppointments->sum('fee') / $completedAppointments->count(), 2) : 0,
                'rating' => $doctor->rating,
                'is_available' => $doctor->is_available,
            ];
        })->sortByDesc('total_revenue')->values();

        // Overall statistics
        $stats = [
            'total_doctors' => $doctors->count(),
            'active_doctors' => $doctors->where('is_available', true)->count(),
            'total_appointments' => $doctors->sum(function($doctor) {
                return $doctor->appointments->count();
            }),
            'total_revenue' => $doctors->sum(function($doctor) {
                return $doctor->appointments->where('status', 'completed')->sum('fee');
            }),
            'avg_completion_rate' => $doctorStats->avg('completion_rate'),
        ];

        return Inertia::render('Admin/Reports/Doctors', [
            'doctorStats' => $doctorStats,
            'stats' => $stats,
            'filters' => $request->only(['start_date', 'end_date']),
        ]);
    }

    public function export(Request $request)
    {
        $type = $request->type;
        $format = $request->format ?? 'pdf';
        
        // This would typically generate and return a file
        // For now, we'll return the data that would be exported
        
        switch ($type) {
            case 'appointments':
                return $this->exportAppointments($request, $format);
            case 'patients':
                return $this->exportPatients($request, $format);
            case 'financial':
                return $this->exportFinancial($request, $format);
            default:
                return back()->with('error', 'نوع التقرير غير مدعوم');
        }
    }

    private function exportAppointments(Request $request, string $format)
    {
        // Implementation for exporting appointments
        return response()->json(['message' => 'Export functionality would be implemented here']);
    }

    private function exportPatients(Request $request, string $format)
    {
        // Implementation for exporting patients
        return response()->json(['message' => 'Export functionality would be implemented here']);
    }

    private function exportFinancial(Request $request, string $format)
    {
        // Implementation for exporting financial data
        return response()->json(['message' => 'Export functionality would be implemented here']);
    }
}