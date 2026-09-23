<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class PayrollFormula extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'payroll_category_id',
        'contact_id',
        'department_id',
        'project_id',
        'earning_amount',
        'deduction_amount',
        'total_amount',
        'created_by',
    ];

    public function category(): BelongsTo
    {
        return $this->belongsTo(PayrollCategory::class, 'payroll_category_id', 'id');
    }

    public function contact(): BelongsTo
    {
        return $this->belongsTo(Contact::class);
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

    public function details(): HasMany
    {
        return $this->hasMany(PayrollFormulaDetail::class);
    }
}
