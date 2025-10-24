<?php

namespace App\Policies;

use App\Models\Appointment;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class AppointmentPolicy
{
    public function view(User $user, Appointment $appointment): bool
    {
        // Admin can view all appointments
        if ($user->isAdmin()) {
            return true;
        }

        // Doctor can view their own appointments
        if ($user->isDoctor() && $appointment->doctor->user_id === $user->id) {
            return true;
        }

        // Receptionist can view all appointments
        if ($user->isReceptionist()) {
            return true;
        }

        return false;
    }

    public function create(User $user): bool
    {
        // Admin and Receptionist can create appointments
        return $user->isAdmin() || $user->isReceptionist();
    }

    public function update(User $user, Appointment $appointment): bool
    {
        // Admin can update all appointments
        if ($user->isAdmin()) {
            return true;
        }

        // Receptionist can update appointments (but not completed ones)
        if ($user->isReceptionist() && $appointment->status !== 'completed') {
            return true;
        }

        return false;
    }

    public function delete(User $user, Appointment $appointment): bool
    {
        // Only admin can delete appointments
        return $user->isAdmin() && $appointment->status !== 'completed';
    }

    public function confirm(User $user, Appointment $appointment): bool
    {
        // Admin and Receptionist can confirm appointments
        if ($user->isAdmin() || $user->isReceptionist()) {
            return $appointment->status === 'scheduled';
        }

        return false;
    }

    public function complete(User $user, Appointment $appointment): bool
    {
        // Admin can complete all appointments
        if ($user->isAdmin()) {
            return $appointment->status === 'confirmed';
        }

        // Doctor can complete their own appointments
        if ($user->isDoctor() && $appointment->doctor->user_id === $user->id) {
            return $appointment->status === 'confirmed';
        }

        return false;
    }

    public function cancel(User $user, Appointment $appointment): bool
    {
        // Admin can cancel any appointment
        if ($user->isAdmin()) {
            return true;
        }

        // Receptionist can cancel appointments (with restrictions)
        if ($user->isReceptionist()) {
            return $appointment->canBeCancelled();
        }

        // Doctor can cancel their own appointments
        if ($user->isDoctor() && $appointment->doctor->user_id === $user->id) {
            return $appointment->canBeCancelled();
        }

        return false;
    }

    public function checkIn(User $user, Appointment $appointment): bool
    {
        // Only receptionist can check in patients
        return $user->isReceptionist() && $appointment->status === 'scheduled';
    }
}