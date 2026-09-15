<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ReceivablePaymentGiroIn extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'receivable_payment_id',
        'giro_in_id',
    ];

    public function receivablePayment(): BelongsTo
    {
        return $this->belongsTo(ReceivablePayment::class);
    }

    public function giroIn(): BelongsTo
    {
        return $this->belongsTo(GiroIn::class);
    }
}
