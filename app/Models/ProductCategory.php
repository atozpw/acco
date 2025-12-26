<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
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
}
