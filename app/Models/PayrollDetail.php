<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class PayrollDetail extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'payroll_id',
        'payroll_component_id',
        'payable_coa_id',
        'expense_coa_id',
        'amount',
        'created_by',
    ];

    public function payroll(): BelongsTo
    {
        return $this->belongsTo(Payroll::class);
    }

    public function component(): BelongsTo
    {
        return $this->belongsTo(PayrollComponent::class);
    }

    public function payableCoa(): BelongsTo
    {
        return $this->belongsTo(Coa::class, 'payable_coa_id');
    }

    public function expenseCoa(): BelongsTo
    {
        return $this->belongsTo(Coa::class, 'expense_coa_id');
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
