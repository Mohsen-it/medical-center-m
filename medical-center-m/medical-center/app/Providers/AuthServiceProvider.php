<?php

namespace App\Providers;

use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Gate;
use App\Policies\AppointmentPolicy;
use App\Policies\PatientPolicy;
use App\Policies\UserPolicy;
use App\Models\Appointment;
use App\Models\Patient;
use App\Models\User;

class AuthServiceProvider extends ServiceProvider
{
    protected $policies = [
        Appointment::class => AppointmentPolicy::class,
        Patient::class => PatientPolicy::class,
        User::class => UserPolicy::class,
    ];

    public function boot(): void
    {
        $this->registerPolicies();

        // Implicitly grant "Super Admin" role all permissions
        Gate::before(function (User $user, string $ability) {
            if ($user->isAdmin() && $user->email === 'admin@medical.com') {
                return true;
            }
        });

        // Define gates for common operations
        Gate::define('access-admin-panel', function (User $user) {
            return $user->isAdmin();
        });

        Gate::define('access-doctor-panel', function (User $user) {
            return $user->isDoctor();
        });

        Gate::define('access-receptionist-panel', function (User $user) {
            return $user->isReceptionist();
        });

        Gate::define('manage-users', function (User $user) {
            return $user->isAdmin();
        });

        Gate::define('manage-appointments', function (User $user) {
            return $user->isAdmin() || $user->isReceptionist();
        });

        Gate::define('manage-patients', function (User $user) {
            return $user->isAdmin() || $user->isReceptionist();
        });

        Gate::define('view-reports', function (User $user) {
            return $user->isAdmin();
        });

        Gate::define('manage-system-settings', function (User $user) {
            return $user->isAdmin() && $user->email === 'admin@medical.com';
        });
    }
}