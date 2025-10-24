<?php

namespace App\Policies;

use App\Models\Patient;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class PatientPolicy
{
    public function view(User $user, Patient $patient): bool
    {
        // Admin can view all patients
        if ($user->isAdmin()) {
            return true;
        }

        // Doctor can view patients they have appointments with
        if ($user->isDoctor()) {
            return $patient->appointments()->where('doctor_id', $user->doctor->id)->exists();
        }

        // Receptionist can view all patients
        if ($user->isReceptionist()) {
            return true;
        }

        return false;
    }

    public function create(User $user): bool
    {
        // Admin and Receptionist can create patients
        return $user->isAdmin() || $user->isReceptionist();
    }

    public function update(User $user, Patient $patient): bool
    {
        // Admin can update all patients
        if ($user->isAdmin()) {
            return true;
        }

        // Receptionist can update patients
        if ($user->isReceptionist()) {
            return true;
        }

        return false;
    }

    public function delete(User $user, Patient $patient): bool
    {
        // Only admin can delete patients
        if (!$user->isAdmin()) {
            return false;
        }

        // Check if patient has appointments
        if ($patient->appointments()->exists()) {
            return false;
        }

        return true;
    }

    public function viewMedicalRecords(User $user, Patient $patient): bool
    {
        // Admin can view all medical records
        if ($user->isAdmin()) {
            return true;
        }

        // Doctor can view medical records of their patients
        if ($user->isDoctor()) {
            return $patient->medicalRecords()->where('doctor_id', $user->doctor->id)->exists();
        }

        return false;
    }

    public function createMedicalRecord(User $user, Patient $patient): bool
    {
        // Admin and Doctor can create medical records
        if ($user->isAdmin()) {
            return true;
        }

        if ($user->isDoctor()) {
            // Doctor can create medical records for their patients
            return $patient->appointments()->where('doctor_id', $user->doctor->id)->exists();
        }

        return false;
    }
}