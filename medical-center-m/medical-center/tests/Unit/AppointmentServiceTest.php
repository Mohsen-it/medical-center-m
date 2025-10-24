<?php

namespace Tests\Unit;

use App\Services\AppointmentService;
use App\Models\Appointment;
use App\Models\Doctor;
use App\Models\Patient;
use App\Models\Specialization;
use App\Models\Invoice;
use Carbon\Carbon;
use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;

class AppointmentServiceTest extends TestCase
{
    use RefreshDatabase;

    protected AppointmentService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new AppointmentService();
    }

    public function test_can_create_appointment()
    {
        $doctor = Doctor::factory()->create();
        $patient = Patient::factory()->create();
        $specialization = Specialization::factory()->create();

        $appointmentData = [
            'patient_id' => $patient->id,
            'doctor_id' => $doctor->id,
            'specialization_id' => $specialization->id,
            'appointment_date' => now()->addDay()->toDateString(),
            'appointment_time' => '10:00',
            'type' => 'consultation',
            'fee' => 150.00,
        ];

        $appointment = $this->service->createAppointment($appointmentData);

        $this->assertInstanceOf(Appointment::class, $appointment);
        $this->assertEquals($patient->id, $appointment->patient_id);
        $this->assertEquals($doctor->id, $appointment->doctor_id);
        $this->assertEquals('scheduled', $appointment->status);
    }

    public function test_create_appointment_generates_invoice()
    {
        $doctor = Doctor::factory()->create(['consultation_fee' => 200.00]);
        $patient = Patient::factory()->create();
        $specialization = Specialization::factory()->create();

        $appointmentData = [
            'patient_id' => $patient->id,
            'doctor_id' => $doctor->id,
            'specialization_id' => $specialization->id,
            'appointment_date' => now()->addDay()->toDateString(),
            'appointment_time' => '10:00',
            'type' => 'consultation',
            'fee' => 200.00,
        ];

        $this->service->createAppointment($appointmentData);

        $this->assertDatabaseHas('invoices', [
            'patient_id' => $patient->id,
            'doctor_id' => $doctor->id,
            'total_amount' => 200.00,
            'status' => 'pending',
        ]);
    }

    public function test_checks_doctor_availability()
    {
        $doctor = Doctor::factory()->create();
        
        // Create existing appointment
        Appointment::factory()->create([
            'doctor_id' => $doctor->id,
            'appointment_date' => now()->addDay()->toDateString(),
            'appointment_time' => '10:00',
            'status' => 'scheduled',
        ]);

        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('الطبيب ليس متاحًا في هذا الوقت');

        $this->service->checkDoctorAvailability(
            $doctor->id,
            now()->addDay()->toDateString(),
            '10:00'
        );
    }

    public function test_can_get_available_slots()
    {
        $doctor = Doctor::factory()->create();
        
        // Create schedule for doctor
        $this->createDoctorSchedule($doctor);

        // Create existing appointment at 10:00
        Appointment::factory()->create([
            'doctor_id' => $doctor->id,
            'appointment_date' => now()->addDay()->toDateString(),
            'appointment_time' => '10:00',
            'status' => 'scheduled',
        ]);

        $availableSlots = $this->service->getAvailableSlots(
            $doctor->id,
            now()->addDay()->toDateString()
        );

        $this->assertIsObject($availableSlots);
        $this->assertNotContains('10:00', $availableSlots->toArray());
        $this->assertContains('10:30', $availableSlots->toArray());
    }

    public function test_can_confirm_appointment()
    {
        $appointment = Appointment::factory()->create(['status' => 'scheduled']);

        $confirmedAppointment = $this->service->confirmAppointment($appointment);

        $this->assertEquals('confirmed', $confirmedAppointment->status);
        $this->assertNotNull($confirmedAppointment->fresh());
    }

    public function test_cannot_confirm_completed_appointment()
    {
        $appointment = Appointment::factory()->create(['status' => 'completed']);

        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('لا يمكن تأكيد هذا الموعد');

        $this->service->confirmAppointment($appointment);
    }

    public function test_can_complete_appointment()
    {
        $appointment = Appointment::factory()->create(['status' => 'confirmed']);

        $completedAppointment = $this->service->completeAppointment($appointment);

        $this->assertEquals('completed', $completedAppointment->status);
        $this->assertNotNull($completedAppointment->completed_at);
    }

    public function test_can_cancel_appointment()
    {
        $appointment = Appointment::factory()->create([
            'status' => 'scheduled',
            'appointment_date' => now()->addDays(2),
        ]);

        $cancelledAppointment = $this->service->cancelAppointment($appointment, 'Patient request');

        $this->assertEquals('cancelled', $cancelledAppointment->status);
        $this->assertEquals('Patient request', $cancelledAppointment->cancellation_reason);
    }

    public function test_cannot_cancel_appointment_less_than_24_hours()
    {
        $appointment = Appointment::factory()->create([
            'status' => 'scheduled',
            'appointment_date' => now()->addHours(12),
        ]);

        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('لا يمكن إلغاء هذا الموعد');

        $this->service->cancelAppointment($appointment, 'Patient request');
    }

    public function test_can_check_in_appointment()
    {
        $appointment = Appointment::factory()->create(['status' => 'scheduled']);

        $checkedInAppointment = $this->service->checkInAppointment($appointment);

        $this->assertEquals('confirmed', $checkedInAppointment->status);
        $this->assertNotNull($checkedInAppointment->checked_in_at);
    }

    public function test_gets_appointment_statistics()
    {
        // Create test appointments
        Appointment::factory()->create([
            'appointment_date' => today(),
            'status' => 'completed',
        ]);
        Appointment::factory()->create([
            'appointment_date' => today(),
            'status' => 'cancelled',
        ]);
        Appointment::factory()->create([
            'appointment_date' => today(),
            'status' => 'scheduled',
        ]);

        $stats = $this->service->getAppointmentStatistics();

        $this->assertEquals(3, $stats['total_today']);
        $this->assertEquals(1, $stats['completed_today']);
        $this->assertEquals(1, $stats['cancelled_today']);
        $this->assertEquals(1, $stats['pending_today']);
    }

    public function test_gets_today_appointments()
    {
        $appointment1 = Appointment::factory()->create([
            'appointment_date' => today(),
            'appointment_time' => '09:00',
        ]);
        $appointment2 = Appointment::factory()->create([
            'appointment_date' => today(),
            'appointment_time' => '10:00',
        ]);
        Appointment::factory()->create([
            'appointment_date' => now()->addDay(),
            'appointment_time' => '09:00',
        ]);

        $todayAppointments = $this->service->getTodayAppointments();

        $this->assertCount(2, $todayAppointments);
        $this->assertTrue($todayAppointments->contains($appointment1));
        $this->assertTrue($todayAppointments->contains($appointment2));
    }

    private function createDoctorSchedule(Doctor $doctor)
    {
        // This would typically create a schedule record
        // For testing purposes, we'll assume the doctor is available
        // In a real implementation, you would create the schedule here
    }
}