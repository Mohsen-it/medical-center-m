<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Payment extends Model
{
    use HasFactory;

    protected $fillable = [
        'transaction_id',
        'invoice_id',
        'patient_id',
        'amount',
        'payment_method',
        'status',
        'gateway',
        'gateway_response',
        'notes',
        'processed_at',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'gateway_response' => 'array',
        'processed_at' => 'datetime',
    ];

    public function invoice(): BelongsTo
    {
        return $this->belongsTo(Invoice::class);
    }

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeFailed($query)
    {
        return $query->where('status', 'failed');
    }

    public function markAsCompleted(): void
    {
        $this->update([
            'status' => 'completed',
            'processed_at' => now(),
        ]);

        // Update invoice status if fully paid
        $invoice = $this->invoice;
        if ($invoice) {
            $totalPaid = $invoice->payments()->completed()->sum('amount');
            if ($totalPaid >= $invoice->total_amount) {
                $invoice->markAsPaid();
            }
        }
    }

    public function markAsFailed(): void
    {
        $this->update(['status' => 'failed']);
    }

    public function getFormattedAmountAttribute(): string
    {
        return number_format($this->amount, 2) . ' ريال';
    }

    public function getPaymentMethodTextAttribute(): string
    {
        $methods = [
            'cash' => 'نقدي',
            'card' => 'بطاقة ائتمان',
            'insurance' => 'تأمين',
            'online' => 'دفع إلكتروني',
            'bank_transfer' => 'تحويل بنكي',
        ];

        return $methods[$this->payment_method] ?? $this->payment_method;
    }

    public function getStatusTextAttribute(): string
    {
        $statuses = [
            'pending' => 'معلق',
            'completed' => 'مكتمل',
            'failed' => 'فشل',
            'refunded' => 'مسترد',
        ];

        return $statuses[$this->status] ?? $this->status;
    }

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($payment) {
            if (empty($payment->transaction_id)) {
                $payment->transaction_id = 'TXN-' . uniqid() . '-' . time();
            }
        });
    }
}