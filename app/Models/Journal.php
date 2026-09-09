<?php

namespace App\Models;

use App\Models\Scopes\DataVisibilityJournalScope;
use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Attributes\ScopedBy;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

#[ScopedBy([DataVisibilityJournalScope::class])]
class Journal extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'journal_category_id',
        'reference_no',
        'date',
        'description',
        'created_by',
    ];

    #[Scope]
    protected function ofReferenceNo(Builder $query, string $referenceNo): void
    {
        $query->where('reference_no', $referenceNo);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(JournalCategory::class, 'journal_category_id');
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function details(): HasMany
    {
        return $this->hasMany(JournalDetail::class);
    }
}
