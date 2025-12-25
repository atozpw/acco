<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class JournalCategory extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'code',
        'name',
        'is_active',
    ];
}
