<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class CashAdvanceExpenseDetail extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'cash_advance_expense_id',
        'cash_advance_classification_id',
        'amount',
        'tax_amount',
        'total',
        'note',
        'tax_id',
        'department_id',
        'project_id',
        'created_by',
    ];

    public function cashAdvanceExpense(): BelongsTo
    {
        return $this->belongsTo(CashAdvanceExpense::class);
    }

    public function cashAdvanceClassification(): BelongsTo
    {
        return $this->belongsTo(CashAdvanceClassification::class);
    }

    public function tax(): BelongsTo
    {
        return $this->belongsTo(Tax::class);
    }

    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
