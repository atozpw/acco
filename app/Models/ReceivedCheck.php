<?php

namespace App\Models;

use App\Models\Scopes\DataVisibilityScope;
use App\Observers\ReceivedCheckObserver;
use Illuminate\Database\Eloquent\Attributes\ObservedBy;
use Illuminate\Database\Eloquent\Attributes\ScopedBy;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

#[ObservedBy([ReceivedCheckObserver::class])]
#[ScopedBy([DataVisibilityScope::class])]
class ReceivedCheck extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'coa_id',
        'bank_id',
        'department_id',
        'project_id',
        'reference_no',
        'number',
        'date',
        'due_date',
        'description',
        'amount',
        'status',
        'created_by',
    ];

    public function coa(): BelongsTo
    {
        return $this->belongsTo(Coa::class);
    }

    public function bank(): BelongsTo
    {
        return $this->belongsTo(Bank::class);
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
