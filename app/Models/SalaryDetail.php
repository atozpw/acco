<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class SalaryDetail extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'salary_id',
        'payroll_component_id',
        'amount',
        'created_by',
    ];

    public function salary(): BelongsTo
    {
        return $this->belongsTo(Salary::class);
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
