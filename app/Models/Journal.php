<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

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
}
