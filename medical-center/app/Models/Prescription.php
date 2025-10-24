<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Prescription extends Model
{
    use HasFactory;

    protected $fillable = [
        'medical_record_id',
        'patient_id',
        'doctor_id',
        'medications',
        'dosage',
        'instructions',
        'issued_date',
        'valid_until',
        'status',
        'prescription_number',
    ];

    protected $casts = [
        'medications' => 'array',
        'issued_date' => 'date',
        'valid_until' => 'date',
    ];

    public function medicalRecord(): BelongsTo
    {
        return $this->belongsTo(MedicalRecord::class);
    }

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    public function doctor(): BelongsTo
    {
        return $this->belongsTo(Doctor::class);
    }

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($prescription) {
            $prescription->prescription_number = 'PR' . date('Y') . str_pad(Prescription::count() + 1, 6, '0', STR_PAD_LEFT);
        });
    }
}