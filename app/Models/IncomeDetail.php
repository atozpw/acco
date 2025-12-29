<?php

namespace App\Models;

use App\Observers\IncomeDetailObserver;
use Illuminate\Database\Eloquent\Attributes\ObservedBy;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

#[ObservedBy([IncomeDetailObserver::class])]
class IncomeDetail extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'income_id',
        'coa_id',
        'amount',
        'note',
        'department_id',
        'project_id',
        'created_by',
    ];

    public function income(): BelongsTo
    {
        return $this->belongsTo(Income::class);
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
