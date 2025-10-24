<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserProfile extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'date_of_birth',
        'gender',
        'bio',
        'phone',
        'address',
        'city',
        'country',
        'postal_code',
        'preferences',
        'social_links',
        'avatar',
        'email_notifications',
        'sms_notifications',
        'timezone',
        'language',
    ];

    protected $casts = [
        'date_of_birth' => 'date',
        'preferences' => 'array',
        'social_links' => 'array',
        'email_notifications' => 'boolean',
        'sms_notifications' => 'boolean',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function getAgeAttribute(): ?int
    {
        return $this->date_of_birth ? $this->date_of_birth->age : null;
    }

    public function getGenderTextAttribute(): string
    {
        $genders = [
            'male' => 'ذكر',
            'female' => 'أنثى',
            'other' => 'أخرى',
        ];

        return $genders[$this->gender] ?? '';
    }

    public function getFullAddressAttribute(): string
    {
        $parts = array_filter([
            $this->address,
            $this->city,
            $this->country,
            $this->postal_code,
        ]);

        return implode(', ', $parts);
    }

    public function getAvatarUrlAttribute(): ?string
    {
        if (!$this->avatar) {
            return null;
        }

        return asset('storage/' . $this->avatar);
    }

    protected static function boot()
    {
        parent::boot();

        static::created(function ($profile) {
            // Create default preferences
            if (!$profile->preferences) {
                $profile->update([
                    'preferences' => [
                        'theme' => 'light',
                        'notifications' => [
                            'email' => true,
                            'sms' => false,
                            'push' => true,
                        ],
                        'privacy' => [
                            'show_email' => false,
                            'show_phone' => false,
                        ],
                    ]
                ]);
            }
        });
    }
}