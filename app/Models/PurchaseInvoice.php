<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class PurchaseInvoice extends Model
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
        'is_receipt',
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

    public function details(): HasMany
    {
        return $this->hasMany(PurchaseInvoiceDetail::class);
    }

    public function receipts(): HasMany
    {
        return $this->hasMany(PurchaseInvoiceReceipt::class);
    }

    public function payablePaymentDetails(): HasMany
    {
        return $this->hasMany(PayablePaymentDetail::class);
    }
}
