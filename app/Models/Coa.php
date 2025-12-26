<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Coa extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'parent_id',
        'code',
        'name',
        'coa_classification_id',
        'is_debit',
        'is_cash_bank',
        'is_active',
    ];

    public function classification(): BelongsTo
    {
        return $this->belongsTo(CoaClassification::class, 'coa_classification_id');
    }
}
