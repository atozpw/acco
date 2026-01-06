<?php

namespace App\Models;

use App\Observers\PurchaseReceiptObserver;
use Illuminate\Database\Eloquent\Attributes\ObservedBy;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

#[ObservedBy([PurchaseReceiptObserver::class])]
class PurchaseReceipt extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'contact_id',
        'warehouse_id',
        'reference_no',
        'date',
        'description',
        'amount',
        'tax_amount',
        'discount_percent',
        'discount_amount',
        'total',
        'is_closed',
        'created_by',
    ];

    public function contact(): BelongsTo
    {
        return $this->belongsTo(Contact::class);
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
        return $this->hasMany(PurchaseReceiptDetail::class);
    }

    public function invoiceReceipts(): HasMany
    {
        return $this->hasMany(PurchaseInvoiceReceipt::class);
    }
}
