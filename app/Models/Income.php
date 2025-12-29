<?php

namespace App\Models;

use App\Observers\IncomeObserver;
use Illuminate\Database\Eloquent\Attributes\ObservedBy;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

#[ObservedBy([IncomeObserver::class])]
class Income extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'contact_id',
        'coa_id',
        'reference_no',
        'date',
        'description',
        'amount',
        'created_by',
    ];

    public function contact(): BelongsTo
    {
        return $this->belongsTo(Contact::class);
    }

    public function coa(): BelongsTo
    {
        return $this->belongsTo(Coa::class);
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function details(): HasMany
    {
        return $this->hasMany(IncomeDetail::class);
    }
}
