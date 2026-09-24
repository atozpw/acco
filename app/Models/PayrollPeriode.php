<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class PayrollPeriode extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'payroll_category_id',
        'reference_no',
        'date',
        'start_date',
        'end_date',
        'description',
        'created_by',
    ];

    public function category(): BelongsTo
    {
        return $this->belongsTo(PayrollCategory::class, 'payroll_category_id', 'id');
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function payrolls(): HasMany
    {
        return $this->hasMany(Payroll::class);
    }
}
