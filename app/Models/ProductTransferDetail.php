<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class ProductTransferDetail extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'product_transfer_id',
        'product_id',
        'qty',
        'note',
        'created_by',
    ];

    public function productTransfer(): BelongsTo
    {
        return $this->belongsTo(ProductTransfer::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
