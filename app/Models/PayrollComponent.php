<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class PayrollComponent extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'code',
        'name',
        'type',
        'payable_coa_id',
        'expense_coa_id',
        'is_active',
    ];

    #[Scope]
    protected function active(Builder $query): void
    {
        $query->where('is_active', 1);
    }

    public function payableCoa(): BelongsTo
    {
        return $this->belongsTo(Coa::class, 'payable_coa_id');
    }

    public function expenseCoa(): BelongsTo
    {
        return $this->belongsTo(Coa::class, 'expense_coa_id');
    }
}
