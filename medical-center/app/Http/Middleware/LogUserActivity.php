<?php

namespace App\Http\Middleware;

use App\Services\ActivityLogService;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class LogUserActivity
{
    protected ActivityLogService $activityLogService;

    public function __construct(ActivityLogService $activityLogService)
    {
        $this->activityLogService = $activityLogService;
    }

    public function handle(Request $request, Closure $next)
    {
        $response = $next($request);

        // Only log authenticated users
        if (Auth::check() && $request->isMethod('GET')) {
            $user = Auth::user();
            
            // Don't log every request - only important ones
            $importantRoutes = [
                'admin.users.show',
                'admin.appointments.show',
                'doctor.patients.show',
                'receptionist.patients.show',
            ];

            if (in_array($request->route()->getName(), $importantRoutes)) {
                // Extract the model from route parameters
                $parameters = $request->route()->parameters();
                $subject = null;

                foreach ($parameters as $parameter) {
                    if (is_object($parameter) && method_exists($parameter, 'getTable')) {
                        $subject = $parameter;
                        break;
                    }
                }

                if ($subject) {
                    $this->activityLogService->logViewed($subject, $user);
                }
            }
        }

        return $response;
    }
}