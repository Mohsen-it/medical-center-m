<?php

namespace App\Services;

use App\Models\Notification;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;

class NotificationService
{
    public function createNotification(Model $notifiable, string $title, string $message, string $type = 'info', array $data = []): Notification
    {
        return $notifiable->notifications()->create([
            'title' => $title,
            'message' => $message,
            'type' => $type,
            'data' => $data,
        ]);
    }

    public function markAsRead(Notification $notification): void
    {
        $notification->markAsRead();
    }

    public function markAllAsRead(User $user): void
    {
        $user->unreadNotifications()->update(['read_at' => now()]);
    }

    public function getUnreadCount(User $user): int
    {
        return $user->unreadNotifications()->count();
    }

    public function getRecentNotifications(User $user, int $limit = 10): \Illuminate\Database\Eloquent\Collection
    {
        return $user->notifications()
            ->with('notifiable')
            ->latest()
            ->limit($limit)
            ->get();
    }

    public function broadcastNotification(Model $notifiable, string $title, string $message, string $type = 'info', array $data = []): void
    {
        $notification = $this->createNotification($notifiable, $title, $message, $type, $data);
        
        // Here you can add real-time broadcasting logic
        // For example, using WebSocket or Pusher
    }

    public function sendAppointmentReminder($appointment): void
    {
        $appointment->patient->notifications()->create([
            'title' => 'تذكير بالموعد',
            'message' => "لديك موعد غدًا الساعة {$appointment->appointment_time} مع د. {$appointment->doctor->user->name}",
            'type' => 'info',
            'data' => [
                'appointment_id' => $appointment->id,
                'reminder_type' => 'appointment',
            ],
        ]);
    }

    public function sendWelcomeNotification(User $user): void
    {
        $this->createNotification(
            $user,
            'مرحباً بك في المجمع الطبي',
            'تم إنشاء حسابك بنجاح. يمكنك الآن استخدام النظام.',
            'success',
            ['action' => 'welcome']
        );
    }

    public function sendSystemNotification(string $title, string $message, string $type = 'info'): void
    {
        $users = User::where('status', 'active')->get();
        
        foreach ($users as $user) {
            $this->createNotification($user, $title, $message, $type, [
                'action' => 'system_announcement',
                'broadcast' => true,
            ]);
        }
    }

    public function cleanupOldNotifications(): int
    {
        // Delete notifications older than 30 days
        return Notification::where('created_at', '<', now()->subDays(30))->delete();
    }
}