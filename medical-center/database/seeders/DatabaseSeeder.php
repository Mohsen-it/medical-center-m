<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Specialization;
use App\Models\Doctor;
use App\Models\Patient;
use App\Models\Department;
use App\Models\Clinic;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Create admin user
        $admin = User::create([
            'name' => 'أحمد محمد',
            'email' => 'admin@medical.com',
            'password' => Hash::make('password'),
            'phone' => '0501234567',
            'role_type' => 'admin',
            'status' => 'active',
        ]);

        // Create specializations
        $specializations = [
            ['name' => 'طب عام', 'description' => 'الطب العام والعلاج الشامل', 'icon' => 'stethoscope', 'color' => '#0ea5e9'],
            ['name' => 'طب القلب', 'description' => 'أمراض القلب والأوعية الدموية', 'icon' => 'heart', 'color' => '#ef4444'],
            ['name' => 'طب الأطفال', 'description' => 'رعاية الأطفال وحديثي الولادة', 'icon' => 'baby', 'color' => '#10b981'],
            ['name' => 'طب النساء', 'description' => 'صحة المرأة والتوليد', 'icon' => 'user', 'color' => '#f59e0b'],
            ['name' => 'طب العيون', 'description' => 'أمراض العيون وجراحتها', 'icon' => 'eye', 'color' => '#6366f1'],
            ['name' => 'طب الأسنان', 'description' => 'صحة الفم والأسنان', 'icon' => 'tooth', 'color' => '#8b5cf6'],
        ];

        foreach ($specializations as $spec) {
            Specialization::create($spec);
        }

        // Create departments
        $departments = [
            ['name' => 'الطوارئ', 'description' => 'قسم الطوارئ والحالات الحرجة', 'floor' => 1, 'room_number' => '101'],
            ['name' => 'العيادات الخارجية', 'description' => 'العيادات الخارجية والاستشارات', 'floor' => 2, 'room_number' => '201'],
            ['name' => 'الأشعة', 'description' => 'قسم الأشعة التشخيصية', 'floor' => 1, 'room_number' => '102'],
            ['name' => 'المختبر', 'description' => 'المختبر الطبي والتحاليل', 'floor' => 1, 'room_number' => '103'],
        ];

        foreach ($departments as $dept) {
            Department::create($dept);
        }

        // Create clinics
        $clinics = [
            ['department_id' => 2, 'name' => 'عيادة الطب العام', 'room_number' => '201'],
            ['department_id' => 2, 'name' => 'عيادة طب القلب', 'room_number' => '202'],
            ['department_id' => 2, 'name' => 'عيادة طب الأطفال', 'room_number' => '203'],
            ['department_id' => 2, 'name' => 'عيادة طب النساء', 'room_number' => '204'],
            ['department_id' => 2, 'name' => 'عيادة طب العيون', 'room_number' => '205'],
            ['department_id' => 2, 'name' => 'عيادة طب الأسنان', 'room_number' => '206'],
        ];

        foreach ($clinics as $clinic) {
            Clinic::create($clinic);
        }

        // Create doctors
        $doctors = [
            [
                'name' => 'د. خالد العتيبي',
                'email' => 'khaled@medical.com',
                'specialization' => 'طب عام',
                'license_number' => 'DOC001',
                'experience_years' => 10,
                'consultation_fee' => 150,
            ],
            [
                'name' => 'د. نورة السعيد',
                'email' => 'nora@medical.com',
                'specialization' => 'طب الأطفال',
                'license_number' => 'DOC002',
                'experience_years' => 8,
                'consultation_fee' => 200,
            ],
            [
                'name' => 'د. محمد الشمري',
                'email' => 'mohammed@medical.com',
                'specialization' => 'طب القلب',
                'license_number' => 'DOC003',
                'experience_years' => 15,
                'consultation_fee' => 300,
            ],
        ];

        foreach ($doctors as $docData) {
            $user = User::create([
                'name' => $docData['name'],
                'email' => $docData['email'],
                'password' => Hash::make('password'),
                'phone' => '050' . rand(1000000, 9999999),
                'role_type' => 'doctor',
                'status' => 'active',
            ]);

            $specialization = Specialization::where('name', $docData['specialization'])->first();

            Doctor::create([
                'user_id' => $user->id,
                'specialization_id' => $specialization->id,
                'license_number' => $docData['license_number'],
                'experience_years' => $docData['experience_years'],
                'consultation_fee' => $docData['consultation_fee'],
                'available_days' => json_encode(['saturday', 'sunday', 'monday', 'tuesday', 'wednesday']),
                'available_time_from' => '09:00:00',
                'available_time_to' => '17:00:00',
                'bio' => 'طبيب متخصص ومتميز في مجال ' . $docData['specialization'],
                'rating' => rand(40, 50) / 10,
                'rating_count' => rand(20, 100),
                'is_available' => true,
            ]);
        }

        // Create receptionist
        $receptionist = User::create([
            'name' => 'فاطمة أحمد',
            'email' => 'reception@medical.com',
            'password' => Hash::make('password'),
            'phone' => '0507654321',
            'role_type' => 'receptionist',
            'status' => 'active',
        ]);

        // Create sample patients
        $patients = [
            ['name' => 'عبدالله محمد', 'phone' => '0551234567', 'gender' => 'male'],
            ['name' => 'مريم أحمد', 'phone' => '0552345678', 'gender' => 'female'],
            ['name' => 'سعد خالد', 'phone' => '0553456789', 'gender' => 'male'],
            ['name' => 'نورة سعيد', 'phone' => '0554567890', 'gender' => 'female'],
            ['name' => 'خالد العمر', 'phone' => '0555678901', 'gender' => 'male'],
        ];

        foreach ($patients as $patientData) {
            Patient::create([
                'name' => $patientData['name'],
                'phone' => $patientData['phone'],
                'email' => strtolower(str_replace(' ', '.', $patientData['name'])) . '@email.com',
                'date_of_birth' => Carbon::now()->subYears(rand(20, 60))->subDays(rand(1, 365)),
                'gender' => $patientData['gender'],
                'blood_type' => ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'][rand(0, 7)],
                'address' => 'الرياض، المملكة العربية السعودية',
                'emergency_contact' => '05' . rand(10000000, 99999999),
                'status' => 'active',
            ]);
        }
    }
}