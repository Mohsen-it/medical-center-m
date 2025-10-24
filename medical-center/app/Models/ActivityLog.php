<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ActivityLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'action',
        'subject_type',
        'subject_id',
        'description',
        'properties',
        'ip_address',
        'user_agent',
    ];

    protected $casts = [
        'properties' => 'array',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function subject()
    {
        return $this->morphTo();
    }

    public function scopeForUser($query, $user)
    {
        return $query->where('user_id', $user->id);
    }

    public function scopeForModel($query, $model)
    {
        return $query->where('subject_type', get_class($model))
                    ->where('subject_id', $model->id);
    }

    public function scopeRecent($query, $days = 7)
    {
        return $query->where('created_at', '>=', now()->subDays($days));
    }

    public function getDescriptionAttribute(): string
    {
        if ($this->description) {
            return $this->description;
        }

        $user = $this->user ? $this->user->name : 'System';
        $action = $this->getActionText();
        $subject = $this->getSubjectText();

        return "{$user} {$action} {$subject}";
    }

    private function getActionText(): string
    {
        $actions = [
            'created' => 'أنشأ',
            'updated' => 'حدث',
            'deleted' => 'حذف',
            'login' => 'دخل إلى',
            'logout' => 'خرج من',
            'viewed' => 'شاهد',
            'approved' => 'وافق على',
            'rejected' => 'رفض',
            'completed' => 'أكمل',
            'cancelled' => 'ألغى',
        ];

        return $actions[$this->action] ?? $this->action;
    }

    private function getSubjectText(): string
    {
        if (!$this->subject_type || !$this->subject_id) {
            return '';
        }

        $modelClass = class_basename($this->subject_type);
        
        $models = [
            'Appointment' => 'موعد',
            'Patient' => 'مريض',
            'Doctor' => 'طبيب',
            'MedicalRecord' => 'سجل طبي',
            'Prescription' => 'وصفة طبية',
            'Invoice' => 'فاتورة',
            'Payment' => 'دفع',
        ];

        return $models[$modelClass] ?? $modelClass;
    }
}