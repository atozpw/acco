<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserProject extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'user_id',
        'project_id',
    ];

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }
}
