<?php

namespace Tests\Unit;

use App\Models\Patient;
use App\Models\Appointment;
use App\Models\MedicalRecord;
use Carbon\Carbon;
use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;

class PatientTest extends TestCase
{
    use RefreshDatabase;

    public function test_patient_can_be_created()
    {
        $patient = Patient::factory()->create([
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'phone' => '+1234567890',
            'national_id' => '1234567890',
            'date_of_birth' => '1990-01-01',
            'gender' => 'male',
        ]);

        $this->assertInstanceOf(Patient::class, $patient);
        $this->assertEquals('John Doe', $patient->name);
        $this->assertEquals('john@example.com', $patient->email);
        $this->assertEquals('male', $patient->gender);
    }

    public function test_patient_has_many_appointments()
    {
        $patient = Patient::factory()->create();
        
        $appointment1 = Appointment::factory()->create(['patient_id' => $patient->id]);
        $appointment2 = Appointment::factory()->create(['patient_id' => $patient->id]);

        $this->assertCount(2, $patient->appointments);
        $this->assertTrue($patient->appointments->contains($appointment1));
        $this->assertTrue($patient->appointments->contains($appointment2));
    }

    public function test_patient_has_many_medical_records()
    {
        $patient = Patient::factory()->create();
        
        $record1 = MedicalRecord::factory()->create(['patient_id' => $patient->id]);
        $record2 = MedicalRecord::factory()->create(['patient_id' => $patient->id]);

        $this->assertCount(2, $patient->medicalRecords);
        $this->assertTrue($patient->medicalRecords->contains($record1));
        $this->assertTrue($patient->medicalRecords->contains($record2));
    }

    public function test_patient_age_is_calculated_correctly()
    {
        $patient = Patient::factory()->create([
            'date_of_birth' => Carbon::now()->subYears(30)->toDateString(),
        ]);

        $this->assertEquals(30, $patient->age);
    }

    public function test_patient_scope_filters_by_status()
    {
        $activePatient = Patient::factory()->create(['status' => 'active']);
        $inactivePatient = Patient::factory()->create(['status' => 'inactive']);

        $activePatients = Patient::active()->get();
        $inactivePatients = Patient::inactive()->get();

        $this->assertCount(1, $activePatients);
        $this->assertCount(1, $inactivePatients);
        $this->assertTrue($activePatients->contains($activePatient));
        $this->assertTrue($inactivePatients->contains($inactivePatient));
    }

    public function test_patient_can_be_searched_by_name()
    {
        $patient1 = Patient::factory()->create(['name' => 'John Doe']);
        $patient2 = Patient::factory()->create(['name' => 'Jane Smith']);

        $searchResults = Patient::where('name', 'like', '%John%')->get();

        $this->assertCount(1, $searchResults);
        $this->assertTrue($searchResults->contains($patient1));
        $this->assertFalse($searchResults->contains($patient2));
    }

    public function test_patient_can_be_searched_by_phone()
    {
        $patient1 = Patient::factory()->create(['phone' => '+1234567890']);
        $patient2 = Patient::factory()->create(['phone' => '+0987654321']);

        $searchResults = Patient::where('phone', '+1234567890')->get();

        $this->assertCount(1, $searchResults);
        $this->assertTrue($searchResults->contains($patient1));
    }

    public function test_patient_national_id_is_unique()
    {
        $patient1 = Patient::factory()->create(['national_id' => '1234567890']);

        $this->expectException(\Illuminate\Database\QueryException::class);
        
        Patient::factory()->create(['national_id' => '1234567890']);
    }

    public function test_patient_email_is_unique()
    {
        $patient1 = Patient::factory()->create(['email' => 'test@example.com']);

        $this->expectException(\Illuminate\Database\QueryException::class);
        
        Patient::factory()->create(['email' => 'test@example.com']);
    }

    public function test_patient_soft_delete()
    {
        $patient = Patient::factory()->create();
        $patientId = $patient->id;

        $patient->delete();

        $this->assertSoftDeleted('patients', ['id' => $patientId]);
        $this->assertNotNull($patient->deleted_at);
    }

    public function test_patient_can_be_restored()
    {
        $patient = Patient::factory()->create();
        $patient->delete();

        $patient->restore();

        $this->assertNotSoftDeleted('patients', ['id' => $patient->id]);
        $this->assertNull($patient->deleted_at);
    }
}