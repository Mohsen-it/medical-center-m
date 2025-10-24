<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Doctor extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'specialization_id',
        'license_number',
        'experience_years',
        'consultation_fee',
        'available_days',
        'available_time_from',
        'available_time_to',
        'bio',
        'education',
        'certifications',
        'rating',
        'rating_count',
        'is_available',
    ];

    protected $casts = [
        'available_days' => 'array',
        'certifications' => 'array',
        'consultation_fee' => 'decimal:2',
        'rating' => 'decimal:2',
        'is_available' => 'boolean',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function specialization(): BelongsTo
    {
        return $this->belongsTo(Specialization::class);
    }

    public function appointments(): HasMany
    {
        return $this->hasMany(Appointment::class);
    }

    public function medicalRecords(): HasMany
    {
        return $this->hasMany(MedicalRecord::class);
    }

    public function prescriptions(): HasMany
    {
        return $this->hasMany(Prescription::class);
    }

    public function schedules(): HasMany
    {
        return $this->hasMany(Schedule::class);
    }

    public function invoices(): HasMany
    {
        return $this->hasMany(Invoice::class);
    }

    public function scopeAvailable($query)
    {
        return $query->where('is_available', true);
    }

    public function getFullNameAttribute(): string
    {
        return $this->user->name;
    }

    public function updateRating(float $newRating): void
    {
        $this->rating_count++;
        $this->rating = (($this->rating * ($this->rating_count - 1)) + $newRating) / $this->rating_count;
        $this->save();
    }
}