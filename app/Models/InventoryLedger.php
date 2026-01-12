<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class InventoryLedger extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'reference_no',
        'date',
        'warehouse_id',
        'product_id',
        'movement',
        'qty',
        'price',
    ];

    #[Scope]
    protected function ofReferenceNo(Builder $query, string $referenceNo): void
    {
        $query->where('reference_no', $referenceNo);
    }
}
