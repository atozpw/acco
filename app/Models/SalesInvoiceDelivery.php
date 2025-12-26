<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class SalesInvoiceDelivery extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'sales_invoice_id',
        'sales_delivery_id',
        'note',
        'created_by',
    ];

    public function salesInvoice(): BelongsTo
    {
        return $this->belongsTo(SalesInvoice::class);
    }

    public function salesDelivery(): BelongsTo
    {
        return $this->belongsTo(SalesDelivery::class);
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
