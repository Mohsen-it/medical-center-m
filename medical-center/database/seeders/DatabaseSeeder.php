<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\UserProfile;
use App\Models\Specialization;
use App\Models\Doctor;
use App\Models\Patient;
use App\Models\Department;
use App\Models\Clinic;
use App\Models\Schedule;
use App\Models\Appointment;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->command->info('Starting database seeding...');

        // Create users
        $this->createUsers();
        
        // Create specializations
        $this->createSpecializations();
        
        // Create departments and clinics
        $this->createDepartmentsAndClinics();
        
        // Create doctors
        $this->createDoctors();
        
        // Create patients
        $this->createPatients();
        
        // Create schedules
        $this->createSchedules();
        
        // Create appointments
        $this->createAppointments();

        $this->command->info('Database seeding completed successfully!');
    }

    private function createUsers(): void
    {
        $users = [
            [
                'name' => 'أحمد محمد',
                'email' => 'admin@medical.com',
                'password' => Hash::make('password'),
                'phone' => '0501234567',
                'role_type' => 'admin',
                'status' => 'active',
            ],
            [
                'name' => 'د. خالد العتيبي',
                'email' => 'khaled@medical.com',
                'password' => Hash::make('password'),
                'phone' => '0507654321',
                'role_type' => 'doctor',
                'status' => 'active',
            ],
            [
                'name' => 'د. سارة أحمد',
                'email' => 'sara@medical.com',
                'password' => Hash::make('password'),
                'phone' => '0509876543',
                'role_type' => 'doctor',
                'status' => 'active',
            ],
            [
                'name' => 'محمد عبدالله',
                'email' => 'reception@medical.com',
                'password' => Hash::make('password'),
                'phone' => '0501112233',
                'role_type' => 'receptionist',
                'status' => 'active',
            ],
            [
                'name' => 'فاطمة علي',
                'email' => 'fatima@medical.com',
                'password' => Hash::make('password'),
                'phone' => '0504445566',
                'role_type' => 'receptionist',
                'status' => 'active',
            ],
        ];

        foreach ($users as $userData) {
            $user = User::create($userData);
            
            // Create profile for each user
            UserProfile::create([
                'user_id' => $user->id,
                'date_of_birth' => Carbon::now()->subYears(rand(25, 45)),
                'gender' => rand(0, 1) ? 'male' : 'female',
                'phone' => $userData['phone'],
                'address' => 'الرياض، المملكة العربية السعودية',
                'city' => 'الرياض',
                'country' => 'المملكة العربية السعودية',
                'email_notifications' => true,
                'sms_notifications' => false,
                'timezone' => 'Asia/Riyadh',
                'language' => 'ar',
            ]);
        }

        $this->command->info('✓ Users created successfully');
    }

    private function createSpecializations(): void
    {
        $specializations = [
            ['name' => 'طب عام', 'description' => 'الطب العام والعلاج الأساسي'],
            ['name' => 'طب القلب', 'description' => 'أمراض القلب والأوعية الدموية'],
            ['name' => 'طب الأطفال', 'description' => 'رعاية صحية للأطفال والرضع'],
            ['name' => 'طب النساء والتوليد', 'description' => 'صحة المرأة والتوليد'],
            ['name' => 'طب الجلدية', 'description' => 'أمراض الجلد والجمال'],
            ['name' => 'طب العيون', 'description' => 'أمراض العيون وجراحتها'],
            ['name' => 'طب الأنف والأذن والحنجرة', 'description' => 'أمراض الأنف والأذن والحنجرة'],
            ['name' => 'طب الأسنان', 'description' => 'صحة الفم والأسنان'],
            ['name' => 'طب العظام', 'description' => 'أمراض العظام والمفاصل'],
            ['name' => 'طب النفسية', 'description' => 'الصحة النفسية والعلاج'],
        ];

        foreach ($specializations as $spec) {
            Specialization::create($spec);
        }

        $this->command->info('✓ Specializations created successfully');
    }

    private function createDepartmentsAndClinics(): void
    {
        $departments = [
            ['name' => 'قسم الطب الباطني', 'description' => 'العلاج الطبي الباطني الشامل', 'floor' => 1, 'room_number' => '101', 'capacity' => 20],
            ['name' => 'قسم الجراحة', 'description' => 'العمليات الجراحية المختلفة', 'floor' => 2, 'room_number' => '201', 'capacity' => 15],
            ['name' => 'قسم الطوارئ', 'description' => 'الطوارئ والحالات الحرجة', 'floor' => 0, 'room_number' => '001', 'capacity' => 30],
            ['name' => 'قسم الأشعة', 'description' => 'الأشعة التشخيصية', 'floor' => 1, 'room_number' => '105', 'capacity' => 10],
            ['name' => 'قسم المختبر', 'description' => 'التحاليل الطبية', 'floor' => 1, 'room_number' => '106', 'capacity' => 8],
        ];

        foreach ($departments as $deptData) {
            $department = Department::create($deptData);
            
            // Create clinics for each department
            for ($i = 1; $i <= 3; $i++) {
                Clinic::create([
                    'department_id' => $department->id,
                    'name' => "عيادة {$department->name} {$i}",
                    'room_number' => $deptData['room_number'] . $i,
                    'equipment' => json_encode(['جهاز قياس ضغط الدم', 'جهاز قياس السكر', 'طبيب كشف']),
                    'status' => 'active',
                ]);
            }
        }

        $this->command->info('✓ Departments and clinics created successfully');
    }

    private function createDoctors(): void
    {
        $doctors = [
            ['user_id' => 2, 'specialization_id' => 1, 'license_number' => 'DOC-2024-001', 'experience_years' => 10, 'consultation_fee' => 200.00, 'bio' => 'طبيب عام بخبرة 10 سنوات في الطب العام', 'education' => 'بكالوريوس الطب والجراحة - جامعة الملك سعود', 'certifications' => json_encode(['البورد السعودي في الطب العام']), 'rating' => 4.5, 'rating_count' => 150, 'is_available' => true],
            ['user_id' => 3, 'specialization_id' => 2, 'license_number' => 'DOC-2024-002', 'experience_years' => 8, 'consultation_fee' => 300.00, 'bio' => 'استشاري أمراض القلب بخبرة 8 سنوات', 'education' => 'بكالوريوس الطب - جامعة الملك سعود', 'certifications' => json_encode(['البورد السعودي في أمراض القلب', 'زمالة أمراض القلب - كندا']), 'rating' => 4.8, 'rating_count' => 200, 'is_available' => true],
        ];

        foreach ($doctors as $doctorData) {
            Doctor::create($doctorData);
        }

        $this->command->info('✓ Doctors created successfully');
    }

    private function createPatients(): void
    {
        $patients = [
            ['name' => 'محمد عبدالرحمن', 'email' => 'mohammed@email.com', 'phone' => '0501234567', 'date_of_birth' => '1990-05-15', 'gender' => 'male', 'blood_type' => 'O+', 'address' => 'الرياض، حي النخيل', 'emergency_contact' => '0509876543', 'national_id' => '1234567890', 'insurance_number' => 'INS-001234'],
            ['name' => 'فاطمة أحمد', 'email' => 'fatima@email.com', 'phone' => '0502345678', 'date_of_birth' => '1985-08-20', 'gender' => 'female', 'blood_type' => 'A+', 'address' => 'الرياض، حي الملز', 'emergency_contact' => '0508765432', 'national_id' => '2345678901', 'insurance_number' => 'INS-002345'],
            ['name' => 'عبدالله محمد', 'email' => 'abdullah@email.com', 'phone' => '0503456789', 'date_of_birth' => '1992-12-10', 'gender' => 'male', 'blood_type' => 'B+', 'address' => 'الرياض، حي العليا', 'emergency_contact' => '0507654321', 'national_id' => '3456789012', 'insurance_number' => 'INS-003456'],
            ['name' => 'نورة خالد', 'email' => 'nora@email.com', 'phone' => '0504567890', 'date_of_birth' => '1988-03-25', 'gender' => 'female', 'blood_type' => 'AB+', 'address' => 'الرياض، حي الروضة', 'emergency_contact' => '0506543210', 'national_id' => '4567890123', 'insurance_number' => 'INS-004567'],
            ['name' => 'سالم علي', 'email' => 'salem@email.com', 'phone' => '0505678901', 'date_of_birth' => '1995-07-18', 'gender' => 'male', 'blood_type' => 'O-', 'address' => 'الرياض، حي الشفا', 'emergency_contact' => '0505432109', 'national_id' => '5678901234', 'insurance_number' => 'INS-005678'],
        ];

        foreach ($patients as $patientData) {
            Patient::create($patientData);
        }

        $this->command->info('✓ Patients created successfully');
    }

    private function createSchedules(): void
    {
        $schedules = [];
        
        // Dr. Khaled's schedule
        for ($day = 0; $day < 5; $day++) { // Sunday to Thursday
            $schedules[] = [
                'doctor_id' => 1,
                'clinic_id' => 1,
                'day_of_week' => $day,
                'start_time' => '09:00:00',
                'end_time' => '17:00:00',
                'max_patients' => 20,
                'is_available' => true,
            ];
        }

        // Dr. Sara's schedule
        for ($day = 0; $day < 5; $day++) { // Sunday to Thursday
            $schedules[] = [
                'doctor_id' => 2,
                'clinic_id' => 2,
                'day_of_week' => $day,
                'start_time' => '08:00:00',
                'end_time' => '16:00:00',
                'max_patients' => 15,
                'is_available' => true,
            ];
        }

        foreach ($schedules as $scheduleData) {
            Schedule::create($scheduleData);
        }

        $this->command->info('✓ Schedules created successfully');
    }

    private function createAppointments(): void
    {
        $appointments = [];
        
        // Create some appointments for today
        for ($i = 0; $i < 5; $i++) {
            $appointments[] = [
                'patient_id' => rand(1, 5),
                'doctor_id' => rand(1, 2),
                'specialization_id' => rand(1, 10),
                'clinic_id' => rand(1, 15),
                'appointment_date' => Carbon::today(),
                'appointment_time' => Carbon::today()->addHours(9 + $i * 2)->format('H:i:s'),
                'status' => ['scheduled', 'confirmed', 'completed'][array_rand(['scheduled', 'confirmed', 'completed'])],
                'type' => ['consultation', 'follow_up'][array_rand(['consultation', 'follow_up'])],
                'notes' => 'ملاحظات الموعد',
                'fee' => [200.00, 300.00][array_rand([200.00, 300.00])],
                'is_paid' => false,
            ];
        }

        // Create some appointments for future dates
        for ($i = 1; $i <= 7; $i++) {
            for ($j = 0; $j < rand(2, 5); $j++) {
                $appointments[] = [
                    'patient_id' => rand(1, 5),
                    'doctor_id' => rand(1, 2),
                    'specialization_id' => rand(1, 10),
                    'clinic_id' => rand(1, 15),
                    'appointment_date' => Carbon::today()->addDays($i),
                    'appointment_time' => Carbon::today()->addDays($i)->addHours(9 + $j * 2)->format('H:i:s'),
                    'status' => 'scheduled',
                    'type' => ['consultation', 'follow_up', 'emergency'][array_rand(['consultation', 'follow_up', 'emergency'])],
                    'notes' => 'ملاحظات الموعد',
                    'fee' => [200.00, 300.00][array_rand([200.00, 300.00])],
                    'is_paid' => false,
                ];
            }
        }

        foreach ($appointments as $appointmentData) {
            Appointment::create($appointmentData);
        }

        $this->command->info('✓ Appointments created successfully');
    }
}