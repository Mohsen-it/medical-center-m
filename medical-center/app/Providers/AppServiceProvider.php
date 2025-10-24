<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Blade;
use Illuminate\Support\Facades\View;
use Illuminate\Pagination\Paginator;
use App\Services\AppointmentService;
use App\Services\NotificationService;
use App\Services\ActivityLogService;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        // Register services as singletons for better performance
        $this->app->singleton(AppointmentService::class);
        $this->app->singleton(NotificationService::class);
        $this->app->singleton(ActivityLogService::class);
    }

    public function boot(): void
    {
        // Use Bootstrap pagination for better UI
        Paginator::useBootstrap();

        // Custom Blade directives
        Blade::if('admin', function () {
            return auth()->check() && auth()->user()->isAdmin();
        });

        Blade::if('doctor', function () {
            return auth()->check() && auth()->user()->isDoctor();
        });

        Blade::if('receptionist', function () {
            return auth()->check() && auth()->user()->isReceptionist();
        });

        Blade::if('active', function ($route) {
            return request()->routeIs($route) || request()->routeIs($route . '.*');
        });

        // Format currency directive
        Blade::directive('currency', function ($amount) {
            return "<?php echo number_format($amount, 2) . ' ريال'; ?>";
        });

        // Date format directive
        Blade::directive('date', function ($date) {
            return "<?php echo \Carbon\Carbon::parse($date)->format('Y-m-d'); ?>";
        });

        // DateTime format directive
        Blade::directive('datetime', function ($datetime) {
            return "<?php echo \Carbon\Carbon::parse($datetime)->format('Y-m-d H:i'); ?>";
        });

        // Share common data with all views
        View::composer('*', function ($view) {
            if (auth()->check()) {
                $view->with('authUser', auth()->user());
                $view->with('unreadNotifications', auth()->user()->unreadNotifications()->count());
            }
        });

        // Optimize database queries
        \DB::listen(function ($query) {
            if (app()->environment('local') && $query->time > 100) {
                \Log::warning('Slow query detected', [
                    'sql' => $query->sql,
                    'bindings' => $query->bindings,
                    'time' => $query->time . 'ms'
                ]);
            }
        });
    }
}