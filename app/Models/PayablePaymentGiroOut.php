<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PayablePaymentGiroOut extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'payable_payment_id',
        'giro_out_id',
    ];

    public function payablePayment(): BelongsTo
    {
        return $this->belongsTo(PayablePayment::class);
    }

    public function giroOut(): BelongsTo
    {
        return $this->belongsTo(GiroOut::class);
    }
}
