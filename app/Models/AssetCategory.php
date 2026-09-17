<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class AssetCategory extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'code',
        'name',
        'useful_life_in_years',
        'useful_life_in_months',
        'asset_coa_id',
        'accumulation_coa_id',
        'depreciation_coa_id',
        'is_active',
    ];

    #[Scope]
    protected function active(Builder $query): void
    {
        $query->where('is_active', 1);
    }

    public function assetCoa(): BelongsTo
    {
        return $this->belongsTo(Coa::class, 'asset_coa_id');
    }

    public function accumulationCoa(): BelongsTo
    {
        return $this->belongsTo(Coa::class, 'accumulation_coa_id');
    }

    public function depreciationCoa(): BelongsTo
    {
        return $this->belongsTo(Coa::class, 'depreciation_coa_id');
    }
}
