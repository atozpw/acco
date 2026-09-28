<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class PayrollPayment extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'payroll_periode_id',
        'coa_id',
        'department_id',
        'project_id',
        'reference_no',
        'date',
        'description',
        'amount',
        'created_by',
    ];

    public function periode(): BelongsTo
    {
        return $this->belongsTo(PayrollPeriode::class, 'payroll_periode_id');
    }

    public function coa(): BelongsTo
    {
        return $this->belongsTo(Coa::class);
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
