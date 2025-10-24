<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Admin\DashboardController as AdminDashboard;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\AppointmentController as AdminAppointmentController;
use App\Http\Controllers\Doctor\DashboardController as DoctorDashboard;
use App\Http\Controllers\Receptionist\DashboardController as ReceptionistDashboard;
use App\Http\Controllers\Receptionist\AppointmentController as ReceptionistAppointmentController;
use App\Http\Controllers\Receptionist\PatientController as ReceptionistPatientController;

Route::get('/', function () {
    return redirect()->route('login');
});

Route::middleware('guest')->group(function () {
    Route::get('login', [AuthenticatedSessionController::class, 'create'])->name('login');
    Route::post('login', [AuthenticatedSessionController::class, 'store']);
});

Route::middleware('auth')->group(function () {
    Route::post('logout', [AuthenticatedSessionController::class, 'destroy'])->name('logout');
    
    Route::middleware('role:admin')->prefix('admin')->name('admin.')->group(function () {
        Route::get('dashboard', [AdminDashboard::class, 'index'])->name('dashboard');
        
        // Users
        Route::get('users', [UserController::class, 'index'])->name('users.index');
        Route::get('users/create', [UserController::class, 'create'])->name('users.create');
        Route::post('users', [UserController::class, 'store'])->name('users.store');
        Route::get('users/{user}', [UserController::class, 'show'])->name('users.show');
        Route::get('users/{user}/edit', [UserController::class, 'edit'])->name('users.edit');
        Route::put('users/{user}', [UserController::class, 'update'])->name('users.update');
        Route::delete('users/{user}', [UserController::class, 'destroy'])->name('users.destroy');
        Route::patch('users/{user}/toggle-status', [UserController::class, 'toggleStatus'])->name('users.toggle-status');
        
        // Appointments
        Route::get('appointments', [AdminAppointmentController::class, 'index'])->name('appointments.index');
        Route::get('appointments/create', [AdminAppointmentController::class, 'create'])->name('appointments.create');
        Route::post('appointments', [AdminAppointmentController::class, 'store'])->name('appointments.store');
        Route::get('appointments/{appointment}', [AdminAppointmentController::class, 'show'])->name('appointments.show');
        Route::get('appointments/{appointment}/edit', [AdminAppointmentController::class, 'edit'])->name('appointments.edit');
        Route::put('appointments/{appointment}', [AdminAppointmentController::class, 'update'])->name('appointments.update');
        Route::delete('appointments/{appointment}', [AdminAppointmentController::class, 'destroy'])->name('appointments.destroy');
        Route::patch('appointments/{appointment}/confirm', [AdminAppointmentController::class, 'confirm'])->name('appointments.confirm');
        Route::patch('appointments/{appointment}/complete', [AdminAppointmentController::class, 'complete'])->name('appointments.complete');
        Route::patch('appointments/{appointment}/cancel', [AdminAppointmentController::class, 'cancel'])->name('appointments.cancel');
        Route::get('appointments/calendar', [AdminAppointmentController::class, 'calendar'])->name('appointments.calendar');
        
        // Reports (placeholder)
        Route::get('reports', function() {
            return inertia('Admin/Reports/Index');
        })->name('reports.index');
        
        // Settings (placeholder)
        Route::get('settings', function() {
            return inertia('Admin/Settings/Index');
        })->name('settings.index');
    });
    
    Route::middleware('role:doctor')->prefix('doctor')->name('doctor.')->group(function () {
        Route::get('dashboard', [DoctorDashboard::class, 'index'])->name('dashboard');
        
        // Appointments (placeholder)
        Route::get('appointments', function() {
            return inertia('Doctor/Appointments/Index');
        })->name('appointments.index');
        
        Route::get('appointments/create', function() {
            return inertia('Doctor/Appointments/Create');
        })->name('appointments.create');
        
        // Patients (placeholder)
        Route::get('patients', function() {
            return inertia('Doctor/Patients/Index');
        })->name('patients.index');
        
        // Medical Records (placeholder)
        Route::get('medical-records', function() {
            return inertia('Doctor/MedicalRecords/Index');
        })->name('medical-records.index');
        
        // Prescriptions (placeholder)
        Route::get('prescriptions', function() {
            return inertia('Doctor/Prescriptions/Index');
        })->name('prescriptions.index');
        
        // Schedule (placeholder)
        Route::get('schedule', function() {
            return inertia('Doctor/Schedule/Index');
        })->name('schedule.index');
    });
    
    Route::middleware('role:receptionist')->prefix('receptionist')->name('receptionist.')->group(function () {
        Route::get('dashboard', [ReceptionistDashboard::class, 'index'])->name('dashboard');
        
        // Appointments
        Route::get('appointments', [ReceptionistAppointmentController::class, 'index'])->name('appointments.index');
        Route::get('appointments/create', [ReceptionistAppointmentController::class, 'create'])->name('appointments.create');
        Route::post('appointments', [ReceptionistAppointmentController::class, 'store'])->name('appointments.store');
        Route::get('appointments/{appointment}', [ReceptionistAppointmentController::class, 'show'])->name('appointments.show');
        Route::patch('appointments/{appointment}/check-in', [ReceptionistAppointmentController::class, 'checkIn'])->name('appointments.check-in');
        Route::patch('appointments/{appointment}/cancel', [ReceptionistAppointmentController::class, 'cancel'])->name('appointments.cancel');
        Route::get('appointments/available-slots', [ReceptionistAppointmentController::class, 'getAvailableSlots'])->name('appointments.available-slots');
        
        // Patients
        Route::get('patients', [ReceptionistPatientController::class, 'index'])->name('patients.index');
        Route::get('patients/create', [ReceptionistPatientController::class, 'create'])->name('patients.create');
        Route::post('patients', [ReceptionistPatientController::class, 'store'])->name('patients.store');
        Route::get('patients/{patient}', [ReceptionistPatientController::class, 'show'])->name('patients.show');
        Route::get('patients/{patient}/edit', [ReceptionistPatientController::class, 'edit'])->name('patients.edit');
        Route::put('patients/{patient}', [ReceptionistPatientController::class, 'update'])->name('patients.update');
        Route::delete('patients/{patient}', [ReceptionistPatientController::class, 'destroy'])->name('patients.destroy');
        Route::get('patients/search', [ReceptionistPatientController::class, 'search'])->name('patients.search');
        
        // Waiting List
        Route::get('waiting-list', [ReceptionistAppointmentController::class, 'waitingList'])->name('waiting-list');
        
        // Attendance (placeholder)
        Route::get('attendance', function() {
            return inertia('Receptionist/Attendance/Index');
        })->name('attendance.index');
    });
});