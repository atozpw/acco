<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class ReferenceCoa extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'code',
        'name',
        'coa_id',
    ];

    public function coa(): BelongsTo
    {
        return $this->belongsTo(Coa::class);
    }
}
