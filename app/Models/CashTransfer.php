<?php

namespace App\Models;

use App\Models\Scopes\DataVisibilityScope;
use App\Observers\CashTransferObserver;
use Illuminate\Database\Eloquent\Attributes\ObservedBy;
use Illuminate\Database\Eloquent\Attributes\ScopedBy;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

#[ObservedBy([CashTransferObserver::class])]
#[ScopedBy([DataVisibilityScope::class])]
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
        'to_department_id',
        'project_id',
        'to_project_id',
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

    public function toDepartment(): BelongsTo
    {
        return $this->belongsTo(Department::class, 'to_department_id');
    }

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function toProject(): BelongsTo
    {
        return $this->belongsTo(Project::class, 'to_project_id');
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
