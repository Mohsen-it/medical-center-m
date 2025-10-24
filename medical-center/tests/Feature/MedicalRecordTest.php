<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Patient;
use App\Models\Doctor;
use App\Models\Specialization;
use App\Models\MedicalRecord;
use App\Models\Appointment;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MedicalRecordTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->admin = User::factory()->create(['role_type' => 'admin']);
        $this->doctor = User::factory()->create(['role_type' => 'doctor']);
        
        $this->specialization = Specialization::factory()->create();
        $this->doctorUser = Doctor::factory()->create([
            'user_id' => $this->doctor->id,
            'specialization_id' => $this->specialization->id,
        ]);
        $this->patient = Patient::factory()->create();
    }

    public function test_doctor_can_create_medical_record()
    {
        $medicalRecordData = [
            'patient_id' => $this->patient->id,
            'chief_complaint' => 'Headache and fever',
            'history_of_present_illness' => 'Patient reports headache for 3 days',
            'diagnosis' => 'Common cold',
            'treatment_plan' => 'Rest and fluids',
            'vital_signs' => [
                'blood_pressure' => '120/80',
                'heart_rate' => 72,
                'temperature' => 37.5,
            ],
        ];

        $response = $this->actingAs($this->doctor)
            ->post(route('doctor.medical-records.store'), $medicalRecordData);

        $response->assertRedirect();
        $this->assertDatabaseHas('medical_records', [
            'patient_id' => $this->patient->id,
            'doctor_id' => $this->doctorUser->id,
            'diagnosis' => 'Common cold',
        ]);
    }

    public function test_doctor_can_view_their_medical_records()
    {
        $medicalRecord = MedicalRecord::factory()->create([
            'doctor_id' => $this->doctorUser->id,
        ]);

        $response = $this->actingAs($this->doctor)
            ->get(route('doctor.medical-records.index'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('Doctor/MedicalRecords/Index'));
    }

    public function test_doctor_cannot_view_other_doctors_medical_records()
    {
        $otherDoctor = User::factory()->create(['role_type' => 'doctor']);
        $otherDoctorUser = Doctor::factory()->create(['user_id' => $otherDoctor->id]);
        
        $medicalRecord = MedicalRecord::factory()->create([
            'doctor_id' => $otherDoctorUser->id,
        ]);

        $response = $this->actingAs($this->doctor)
            ->get(route('doctor.medical-records.show', $medicalRecord));

        $response->assertStatus(403);
    }

    public function test_medical_record_can_be_edited_within_24_hours()
    {
        $medicalRecord = MedicalRecord::factory()->create([
            'doctor_id' => $this->doctorUser->id,
            'created_at' => now()->subHours(12),
        ]);

        $response = $this->actingAs($this->doctor)
            ->get(route('doctor.medical-records.edit', $medicalRecord));

        $response->assertStatus(200);
    }

    public function test_medical_record_cannot_be_edited_after_24_hours()
    {
        $medicalRecord = MedicalRecord::factory()->create([
            'doctor_id' => $this->doctorUser->id,
            'created_at' => now()->subHours(25),
        ]);

        $response = $this->actingAs($this->doctor)
            ->get(route('doctor.medical-records.edit', $medicalRecord));

        $response->assertRedirect();
        $response->assertSessionHas('error');
    }

    public function test_medical_record_validation_requires_diagnosis()
    {
        $response = $this->actingAs($this->doctor)
            ->post(route('doctor.medical-records.store'), [
                'patient_id' => $this->patient->id,
                'chief_complaint' => 'Headache',
                'treatment_plan' => 'Rest',
            ]);

        $response->assertSessionHasErrors(['diagnosis']);
    }

    public function test_medical_record_stores_vital_signs_as_json()
    {
        $vitalSigns = [
            'blood_pressure' => '120/80',
            'heart_rate' => 72,
            'temperature' => 37.5,
            'weight' => 70,
            'height' => 170,
        ];

        $response = $this->actingAs($this->doctor)
            ->post(route('doctor.medical-records.store'), [
                'patient_id' => $this->patient->id,
                'chief_complaint' => 'Headache',
                'diagnosis' => 'Common cold',
                'treatment_plan' => 'Rest',
                'vital_signs' => $vitalSigns,
            ]);

        $this->assertDatabaseHas('medical_records', [
            'patient_id' => $this->patient->id,
            'doctor_id' => $this->doctorUser->id,
        ]);

        $record = MedicalRecord::first();
        $this->assertEquals($vitalSigns, $record->vital_signs);
    }

    public function test_medical_record_can_be_linked_to_appointment()
    {
        $appointment = Appointment::factory()->create([
            'doctor_id' => $this->doctorUser->id,
            'patient_id' => $this->patient->id,
        ]);

        $response = $this->actingAs($this->doctor)
            ->post(route('doctor.medical-records.store'), [
                'patient_id' => $this->patient->id,
                'appointment_id' => $appointment->id,
                'chief_complaint' => 'Headache',
                'diagnosis' => 'Common cold',
                'treatment_plan' => 'Rest',
            ]);

        $this->assertDatabaseHas('appointments', [
            'id' => $appointment->id,
            'medical_record_id' => MedicalRecord::first()->id,
        ]);
    }

    public function test_admin_can_view_all_medical_records()
    {
        $medicalRecord = MedicalRecord::factory()->create([
            'doctor_id' => $this->doctorUser->id,
        ]);

        $response = $this->actingAs($this->admin)
            ->get(route('admin.medical-records.index'));

        $response->assertStatus(200);
    }

    public function test_receptionist_cannot_access_medical_records()
    {
        $receptionist = User::factory()->create(['role_type' => 'receptionist']);

        $response = $this->actingAs($receptionist)
            ->get(route('doctor.medical-records.index'));

        $response->assertStatus(403);
    }
}