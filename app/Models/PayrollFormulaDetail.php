<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class PayrollFormulaDetail extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'payroll_formula_id',
        'payroll_component_id',
        'amount',
        'created_by',
    ];

    public function formula(): BelongsTo
    {
        return $this->belongsTo(PayrollFormula::class);
    }

    public function component(): BelongsTo
    {
        return $this->belongsTo(PayrollComponent::class);
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
