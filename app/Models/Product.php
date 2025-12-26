<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
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

    #[Scope]
    protected function active(Builder $query): void
    {
        $query->where('is_active', 1);
    }

    public function stocks(): HasMany
    {
        return $this->hasMany(Stock::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(ProductCategory::class, 'product_category_id');
    }

    public function unitMeasurement(): BelongsTo
    {
        return $this->belongsTo(UnitMeasurement::class, 'unit_measurement_id');
    }

    public function salesTax(): BelongsTo
    {
        return $this->belongsTo(Tax::class, 'sales_tax_id');
    }

    public function purchaseTax(): BelongsTo
    {
        return $this->belongsTo(Tax::class, 'purchase_tax_id');
    }
}
