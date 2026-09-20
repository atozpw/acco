<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class CashAdvanceClassification extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'code',
        'name',
        'cash_advance_income_coa_id',
        'cash_advance_expense_coa_id',
        'is_active',
    ];

    #[Scope]
    protected function active(Builder $query): void
    {
        $query->where('is_active', 1);
    }

    public function incomeCoa(): BelongsTo
    {
        return $this->belongsTo(Coa::class, 'cash_advance_income_coa_id');
    }

    public function expenseCoa(): BelongsTo
    {
        return $this->belongsTo(Coa::class, 'cash_advance_expense_coa_id');
    }
}
