<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class CashTransfer extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'from_coa_id',
        'to_coa_id',
        'reference_no',
        'date',
        'description',
        'amount',
        'department_id',
        'project_id',
        'created_by',
    ];

    public function fromCoa(): BelongsTo
    {
        return $this->belongsTo(Coa::class, 'from_coa_id');
    }

    public function toCoa(): BelongsTo
    {
        return $this->belongsTo(Coa::class, 'to_coa_id');
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
