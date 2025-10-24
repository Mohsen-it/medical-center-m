<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Department extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'head_doctor_id',
        'floor',
        'room_number',
        'capacity',
        'phone',
        'email',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function headDoctor(): BelongsTo
    {
        return $this->belongsTo(Doctor::class, 'head_doctor_id');
    }

    public function clinics(): HasMany
    {
        return $this->hasMany(Clinic::class);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}