<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class ProductCategory extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'code',
        'name',
        'inventory_coa_id',
        'purchase_coa_id',
        'purchase_receipt_coa_id',
        'purchase_return_coa_id',
        'sales_coa_id',
        'sales_delivery_coa_id',
        'sales_return_coa_id',
        'is_active',
    ];

    #[Scope]
    protected function active(Builder $query): void
    {
        $query->where('is_active', 1);
    }

    public function inventoryCoa(): BelongsTo
    {
        return $this->belongsTo(Coa::class, 'inventory_coa_id');
    }

    public function purchaseCoa(): BelongsTo
    {
        return $this->belongsTo(Coa::class, 'purchase_coa_id');
    }

    public function purchaseReceiptCoa(): BelongsTo
    {
        return $this->belongsTo(Coa::class, 'purchase_receipt_coa_id');
    }

    public function purchaseReturnCoa(): BelongsTo
    {
        return $this->belongsTo(Coa::class, 'purchase_return_coa_id');
    }

    public function salesCoa(): BelongsTo
    {
        return $this->belongsTo(Coa::class, 'sales_coa_id');
    }

    public function salesReceiptCoa(): BelongsTo
    {
        return $this->belongsTo(Coa::class, 'sales_receipt_coa_id');
    }

    public function salesReturnCoa(): BelongsTo
    {
        return $this->belongsTo(Coa::class, 'sales_return_coa_id');
    }
}
