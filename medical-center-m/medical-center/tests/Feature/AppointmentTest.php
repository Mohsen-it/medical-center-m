<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Patient;
use App\Models\Doctor;
use App\Models\Specialization;
use App\Models\Appointment;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class AppointmentTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Create test data
        $this->admin = User::factory()->create(['role_type' => 'admin']);
        $this->receptionist = User::factory()->create(['role_type' => 'receptionist']);
        $this->doctor = User::factory()->create(['role_type' => 'doctor']);
        
        $this->specialization = Specialization::factory()->create();
        $this->doctorUser = Doctor::factory()->create([
            'user_id' => $this->doctor->id,
            'specialization_id' => $this->specialization->id,
        ]);
        $this->patient = Patient::factory()->create();
    }

    public function test_admin_can_view_appointments_index()
    {
        $response = $this->actingAs($this->admin)
            ->get(route('admin.appointments.index'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('Admin/Appointments/Index'));
    }

    public function test_receptionist_can_create_appointment()
    {
        $appointmentData = [
            'patient_id' => $this->patient->id,
            'doctor_id' => $this->doctorUser->id,
            'specialization_id' => $this->specialization->id,
            'appointment_date' => now()->addDay()->toDateString(),
            'appointment_time' => '10:00',
            'type' => 'consultation',
            'fee' => 150.00,
            'notes' => 'Test appointment',
        ];

        $response = $this->actingAs($this->receptionist)
            ->post(route('receptionist.appointments.store'), $appointmentData);

        $response->assertRedirect();
        $this->assertDatabaseHas('appointments', [
            'patient_id' => $this->patient->id,
            'doctor_id' => $this->doctorUser->id,
            'status' => 'scheduled',
        ]);
    }

    public function test_doctor_can_view_their_appointments()
    {
        $appointment = Appointment::factory()->create([
            'doctor_id' => $this->doctorUser->id,
        ]);

        $response = $this->actingAs($this->doctor)
            ->get(route('doctor.appointments.index'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('Doctor/Appointments/Index'));
    }

    public function test_doctor_cannot_view_other_doctors_appointments()
    {
        $otherDoctor = User::factory()->create(['role_type' => 'doctor']);
        $otherDoctorUser = Doctor::factory()->create(['user_id' => $otherDoctor->id]);
        
        $appointment = Appointment::factory()->create([
            'doctor_id' => $otherDoctorUser->id,
        ]);

        $response = $this->actingAs($this->doctor)
            ->get(route('doctor.appointments.show', $appointment));

        $response->assertStatus(403);
    }

    public function test_appointment_can_be_confirmed()
    {
        $appointment = Appointment::factory()->create([
            'status' => 'scheduled',
        ]);

        $response = $this->actingAs($this->admin)
            ->patch(route('admin.appointments.confirm', $appointment));

        $response->assertRedirect();
        $this->assertDatabaseHas('appointments', [
            'id' => $appointment->id,
            'status' => 'confirmed',
        ]);
    }

    public function test_appointment_can_be_completed()
    {
        $appointment = Appointment::factory()->create([
            'status' => 'confirmed',
        ]);

        $response = $this->actingAs($this->admin)
            ->patch(route('admin.appointments.complete', $appointment));

        $response->assertRedirect();
        $this->assertDatabaseHas('appointments', [
            'id' => $appointment->id,
            'status' => 'completed',
        ]);
    }

    public function test_appointment_can_be_cancelled_with_reason()
    {
        $appointment = Appointment::factory()->create([
            'status' => 'scheduled',
        ]);

        $response = $this->actingAs($this->admin)
            ->patch(route('admin.appointments.cancel', $appointment), [
                'cancellation_reason' => 'Patient requested cancellation',
            ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('appointments', [
            'id' => $appointment->id,
            'status' => 'cancelled',
            'cancellation_reason' => 'Patient requested cancellation',
        ]);
    }

    public function test_appointment_validation_requires_patient_and_doctor()
    {
        $response = $this->actingAs($this->receptionist)
            ->post(route('receptionist.appointments.store'), [
                'appointment_date' => now()->addDay()->toDateString(),
                'appointment_time' => '10:00',
                'type' => 'consultation',
                'fee' => 150.00,
            ]);

        $response->assertSessionHasErrors(['patient_id', 'doctor_id']);
    }

    public function test_appointment_date_cannot_be_in_past()
    {
        $response = $this->actingAs($this->receptionist)
            ->post(route('receptionist.appointments.store'), [
                'patient_id' => $this->patient->id,
                'doctor_id' => $this->doctorUser->id,
                'specialization_id' => $this->specialization->id,
                'appointment_date' => now()->subDay()->toDateString(),
                'appointment_time' => '10:00',
                'type' => 'consultation',
                'fee' => 150.00,
            ]);

        $response->assertSessionHasErrors(['appointment_date']);
    }

    public function test_unauthorized_user_cannot_access_admin_appointments()
    {
        $response = $this->actingAs($this->receptionist)
            ->get(route('admin.appointments.index'));

        $response->assertStatus(403);
    }

    public function test_guest_cannot_access_appointments()
    {
        $response = $this->get(route('admin.appointments.index'));
        $response->assertRedirect('/login');
    }
}