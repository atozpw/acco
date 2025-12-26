<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Tax extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'code',
        'name',
        'rate',
        'sales_coa_id',
        'purchase_coa_id',
        'is_active',
    ];

    #[Scope]
    protected function active(Builder $query): void
    {
        $query->where('is_active', 1);
    }

    public function salesCoa(): BelongsTo
    {
        return $this->belongsTo(Coa::class, 'sales_coa_id');
    }

    public function purchaseCoa(): BelongsTo
    {
        return $this->belongsTo(Coa::class, 'purchase_coa_id');
    }
}
