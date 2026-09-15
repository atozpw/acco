<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ExpenseGiroOut extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'expense_id',
        'giro_out_id',
    ];

    public function expense(): BelongsTo
    {
        return $this->belongsTo(Expense::class);
    }

    public function giroOut(): BelongsTo
    {
        return $this->belongsTo(GiroOut::class);
    }
}
