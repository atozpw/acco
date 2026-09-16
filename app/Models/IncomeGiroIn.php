<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class IncomeGiroIn extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'income_id',
        'giro_in_id',
    ];

    public function income(): BelongsTo
    {
        return $this->belongsTo(Income::class);
    }

    public function giroIn(): BelongsTo
    {
        return $this->belongsTo(GiroIn::class);
    }
}
