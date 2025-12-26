<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Product extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'product_category_id',
        'code',
        'name',
        'unit_measurement_id',
        'sales_price',
        'purchase_price',
        'sales_tax_id',
        'purchase_tax_id',
        'minimum_stock',
        'description',
        'image',
        'is_active',
    ];
}
