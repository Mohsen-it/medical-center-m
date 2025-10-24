<?php

namespace App\Services;

use App\Models\ActivityLog;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;

class ActivityLogService
{
    public function log(string $action, ?Model $subject = null, ?User $user = null, ?string $description = null, array $properties = []): ActivityLog
    {
        return ActivityLog::create([
            'user_id' => $user?->id,
            'action' => $action,
            'subject_type' => $subject ? get_class($subject) : null,
            'subject_id' => $subject?->id,
            'description' => $description,
            'properties' => $properties,
            'ip_address' => request()?->ip(),
            'user_agent' => request()?->userAgent(),
        ]);
    }

    public function logLogin(User $user): ActivityLog
    {
        return $this->log('login', null, $user, 'User logged in');
    }

    public function logLogout(User $user): ActivityLog
    {
        return $this->log('logout', null, $user, 'User logged out');
    }

    public function logCreated(Model $model, ?User $user = null): ActivityLog
    {
        return $this->log('created', $model, $user, null, [
            'attributes' => $model->getAttributes(),
        ]);
    }

    public function logUpdated(Model $model, ?User $user = null, array $oldValues = []): ActivityLog
    {
        return $this->log('updated', $model, $user, null, [
            'old' => $oldValues,
            'attributes' => $model->getChanges(),
        ]);
    }

    public function logDeleted(Model $model, ?User $user = null): ActivityLog
    {
        return $this->log('deleted', $model, $user, null, [
            'attributes' => $model->getAttributes(),
        ]);
    }

    public function logViewed(Model $model, ?User $user = null): ActivityLog
    {
        return $this->log('viewed', $model, $user);
    }

    public function logAppointmentStatusChange($appointment, string $oldStatus, string $newStatus, ?User $user = null): ActivityLog
    {
        return $this->log('appointment_status_changed', $appointment, $user, "Appointment status changed from {$oldStatus} to {$newStatus}", [
            'old_status' => $oldStatus,
            'new_status' => $newStatus,
        ]);
    }

    public function logPaymentProcessed($payment, ?User $user = null): ActivityLog
    {
        return $this->log('payment_processed', $payment, $user, "Payment of {$payment->formatted_amount} processed");
    }

    public function getUserActivity(User $user, int $limit = 50): \Illuminate\Database\Eloquent\Collection
    {
        return ActivityLog::where('user_id', $user->id)
            ->with('subject')
            ->latest()
            ->limit($limit)
            ->get();
    }

    public function getModelActivity(Model $model, int $limit = 50): \Illuminate\Database\Eloquent\Collection
    {
        return ActivityLog::where('subject_type', get_class($model))
            ->where('subject_id', $model->id)
            ->with('user')
            ->latest()
            ->limit($limit)
            ->get();
    }

    public function getRecentActivity(int $limit = 20): \Illuminate\Database\Eloquent\Collection
    {
        return ActivityLog::with(['user', 'subject'])
            ->latest()
            ->limit($limit)
            ->get();
    }

    public function getActivityStatistics(): array
    {
        $today = now()->startOfDay();
        
        return [
            'total_today' => ActivityLog::where('created_at', '>=', $today)->count(),
            'logins_today' => ActivityLog::where('action', 'login')->where('created_at', '>=', $today)->count(),
            'created_today' => ActivityLog::where('action', 'created')->where('created_at', '>=', $today)->count(),
            'updated_today' => ActivityLog::where('action', 'updated')->where('created_at', '>=', $today)->count(),
            'deleted_today' => ActivityLog::where('action', 'deleted')->where('created_at', '>=', $today)->count(),
            'most_active_users' => ActivityLog::where('created_at', '>=', $today)
                ->with('user')
                ->get()
                ->groupBy('user_id')
                ->map(fn($logs) => [
                    'user' => $logs->first()->user,
                    'count' => $logs->count(),
                ])
                ->sortByDesc('count')
                ->take(5)
                ->values(),
        ];
    }

    public function cleanupOldLogs(): int
    {
        // Delete logs older than 90 days
        return ActivityLog::where('created_at', '<', now()->subDays(90))->delete();
    }
}