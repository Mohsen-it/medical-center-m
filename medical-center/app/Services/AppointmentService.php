<?php

namespace App\Services;

use App\Models\Appointment;
use App\Models\Doctor;
use App\Models\Patient;
use App\Models\Invoice;
use Carbon\Carbon;
use Illuminate\Support\Collection;

class AppointmentService
{
    public function createAppointment(array $data): Appointment
    {
        // Get doctor's consultation fee if not provided
        if (!isset($data['fee'])) {
            $doctor = Doctor::findOrFail($data['doctor_id']);
            $data['fee'] = $doctor->consultation_fee;
        }

        // Check availability
        $this->checkDoctorAvailability($data['doctor_id'], $data['appointment_date'], $data['appointment_time']);

        $appointment = Appointment::create([
            ...$data,
            'status' => 'scheduled',
            'is_paid' => false,
        ]);

        // Create invoice if needed
        if ($data['fee'] > 0) {
            $this->createInvoiceForAppointment($appointment);
        }

        return $appointment;
    }

    public function checkDoctorAvailability(int $doctorId, string $date, string $time): bool
    {
        $existingAppointment = Appointment::where('doctor_id', $doctorId)
            ->where('appointment_date', $date)
            ->where('appointment_time', $time)
            ->whereIn('status', ['scheduled', 'confirmed'])
            ->first();

        if ($existingAppointment) {
            throw new \Exception('الطبيب ليس متاحًا في هذا الوقت');
        }

        // Check doctor's schedule
        $dayOfWeek = Carbon::parse($date)->dayOfWeek;
        $schedule = Doctor::findOrFail($doctorId)
            ->schedules()
            ->where('day_of_week', $dayOfWeek)
            ->first();

        if (!$schedule) {
            throw new \Exception('الطبيب لا يعمل في هذا اليوم');
        }

        $appointmentTime = Carbon::parse($time);
        $startTime = Carbon::parse($schedule->start_time);
        $endTime = Carbon::parse($schedule->end_time);

        if ($appointmentTime < $startTime || $appointmentTime > $endTime) {
            throw new \Exception('الوقت المحدد خارج ساعات عمل الطبيب');
        }

        return true;
    }

    public function getAvailableSlots(int $doctorId, string $date): Collection
    {
        $doctor = Doctor::findOrFail($doctorId);
        $dayOfWeek = Carbon::parse($date)->dayOfWeek;
        
        $schedule = $doctor->schedules()->where('day_of_week', $dayOfWeek)->first();
        
        if (!$schedule) {
            return collect([]);
        }

        // Get existing appointments
        $existingAppointments = Appointment::where('doctor_id', $doctorId)
            ->where('appointment_date', $date)
            ->whereIn('status', ['scheduled', 'confirmed'])
            ->pluck('appointment_time')
            ->map(fn($time) => Carbon::parse($time)->format('H:i'))
            ->toArray();

        // Generate slots
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

        return collect($slots);
    }

    public function confirmAppointment(Appointment $appointment): Appointment
    {
        if ($appointment->status !== 'scheduled') {
            throw new \Exception('لا يمكن تأكيد هذا الموعد');
        }

        $appointment->update(['status' => 'confirmed']);
        
        // Send notification to patient
        $this->sendAppointmentNotification($appointment, 'confirmed');

        return $appointment;
    }

    public function completeAppointment(Appointment $appointment): Appointment
    {
        if ($appointment->status !== 'confirmed') {
            throw new \Exception('لا يمكن إكمال هذا الموعد');
        }

        $appointment->complete();
        
        // Send notification to patient
        $this->sendAppointmentNotification($appointment, 'completed');

        return $appointment;
    }

    public function cancelAppointment(Appointment $appointment, string $reason): Appointment
    {
        if (!$appointment->canBeCancelled()) {
            throw new \Exception('لا يمكن إلغاء هذا الموعد');
        }

        $appointment->cancel($reason);
        
        // Send notification to patient and doctor
        $this->sendAppointmentNotification($appointment, 'cancelled', $reason);

        return $appointment;
    }

    public function checkInAppointment(Appointment $appointment): Appointment
    {
        if ($appointment->status !== 'scheduled') {
            throw new \Exception('لا يمكن تسجيل حضور هذا الموعد');
        }

        $appointment->checkIn();
        
        // Send notification to doctor
        $this->sendAppointmentNotification($appointment, 'checked_in');

        return $appointment;
    }

    private function createInvoiceForAppointment(Appointment $appointment): Invoice
    {
        return Invoice::create([
            'patient_id' => $appointment->patient_id,
            'appointment_id' => $appointment->id,
            'doctor_id' => $appointment->doctor_id,
            'subtotal' => $appointment->fee,
            'tax_amount' => 0,
            'discount_amount' => 0,
            'total_amount' => $appointment->fee,
            'status' => 'pending',
            'due_date' => now()->addDays(7),
            'items' => [
                [
                    'description' => 'استشارة طبية - ' . $appointment->specialization->name,
                    'quantity' => 1,
                    'unit_price' => $appointment->fee,
                    'total' => $appointment->fee,
                ]
            ],
        ]);
    }

    private function sendAppointmentNotification(Appointment $appointment, string $action, string $reason = null): void
    {
        $messages = [
            'confirmed' => 'تم تأكيد موعدك',
            'completed' => 'تم إكمال موعدك بنجاح',
            'cancelled' => 'تم إلغاء موعدك' . ($reason ? ': ' . $reason : ''),
            'checked_in' => 'المريض في قائمة الانتظار',
        ];

        $title = match($action) {
            'confirmed' => 'تأكيد موعد',
            'completed' => 'إكمال موعد',
            'cancelled' => 'إلغاء موعد',
            'checked_in' => 'حضور مريض',
            default => 'إشعار موعد',
        };

        // Create notification for patient
        $appointment->patient->notifications()->create([
            'title' => $title,
            'message' => $messages[$action] ?? 'تحديث في حالة الموعد',
            'type' => $action === 'cancelled' ? 'warning' : 'info',
            'data' => [
                'appointment_id' => $appointment->id,
                'action' => $action,
                'reason' => $reason,
            ],
        ]);

        // Create notification for doctor (except for patient-specific actions)
        if (in_array($action, ['checked_in', 'confirmed'])) {
            $appointment->doctor->user->notifications()->create([
                'title' => $title,
                'message' => $messages[$action] ?? 'تحديث في حالة الموعد',
                'type' => 'info',
                'data' => [
                    'appointment_id' => $appointment->id,
                    'action' => $action,
                ],
            ]);
        }
    }

    public function getTodayAppointments(): Collection
    {
        return Appointment::with(['patient', 'doctor.user', 'specialization'])
            ->whereDate('appointment_date', today())
            ->orderBy('appointment_time')
            ->get();
    }

    public function getUpcomingAppointments(int $doctorId, int $days = 7): Collection
    {
        return Appointment::with(['patient', 'specialization'])
            ->where('doctor_id', $doctorId)
            ->where('appointment_date', '>=', today())
            ->where('appointment_date', '<=', now()->addDays($days))
            ->where('status', 'scheduled')
            ->orderBy('appointment_date')
            ->orderBy('appointment_time')
            ->get();
    }

    public function getAppointmentStatistics(): array
    {
        $today = today();
        
        return [
            'total_today' => Appointment::whereDate('appointment_date', $today)->count(),
            'completed_today' => Appointment::whereDate('appointment_date', $today)->where('status', 'completed')->count(),
            'cancelled_today' => Appointment::whereDate('appointment_date', $today)->where('status', 'cancelled')->count(),
            'pending_today' => Appointment::whereDate('appointment_date', $today)->whereIn('status', ['scheduled', 'confirmed'])->count(),
            'this_week' => Appointment::whereBetween('appointment_date', [now()->startOfWeek(), now()->endOfWeek()])->count(),
            'this_month' => Appointment::whereMonth('appointment_date', now()->month)->count(),
        ];
    }
}