<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class SalesInvoice extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'contact_id',
        'coa_id',
        'warehouse_id',
        'reference_no',
        'date',
        'description',
        'amount',
        'tax_amount',
        'discount_percent',
        'discount_amount',
        'total',
        'is_paid',
        'is_delivery',
        'created_by',
    ];

    public function contact(): BelongsTo
    {
        return $this->belongsTo(Contact::class);
    }

    public function coa(): BelongsTo
    {
        return $this->belongsTo(Coa::class);
    }

    public function warehouse(): BelongsTo
    {
        return $this->belongsTo(Warehouse::class);
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function details(): HasMany
    {
        return $this->hasMany(SalesInvoiceDetail::class);
    }

    public function deliveries(): HasMany
    {
        return $this->hasMany(SalesInvoiceDelivery::class);
    }

    public function receivablePaymentDetails(): HasMany
    {
        return $this->hasMany(ReceivablePaymentDetail::class);
    }
}
