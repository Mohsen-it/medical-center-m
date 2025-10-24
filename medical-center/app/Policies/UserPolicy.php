<?php

namespace App\Policies;

use App\Models\User;
use Illuminate\Auth\Access\Response;

class UserPolicy
{
    public function view(User $user, User $model): bool
    {
        // Admin can view all users
        if ($user->isAdmin()) {
            return true;
        }

        // Users can view their own profile
        return $user->id === $model->id;
    }

    public function create(User $user): bool
    {
        // Only admin can create users
        return $user->isAdmin();
    }

    public function update(User $user, User $model): bool
    {
        // Admin can update all users
        if ($user->isAdmin()) {
            return true;
        }

        // Users can update their own profile (with restrictions)
        if ($user->id === $model->id) {
            // Users cannot change their role or status
            return !request()->has(['role_type', 'status']);
        }

        return false;
    }

    public function delete(User $user, User $model): bool
    {
        // Only admin can delete users
        if (!$user->isAdmin()) {
            return false;
        }

        // Cannot delete yourself
        if ($user->id === $model->id) {
            return false;
        }

        return true;
    }

    public function toggleStatus(User $user, User $model): bool
    {
        // Only admin can toggle user status
        return $user->isAdmin() && $user->id !== $model->id;
    }

    public function viewActivityLogs(User $user, User $model): bool
    {
        // Admin can view all activity logs
        if ($user->isAdmin()) {
            return true;
        }

        // Users can view their own activity logs
        return $user->id === $model->id;
    }
}