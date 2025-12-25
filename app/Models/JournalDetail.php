<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class JournalDetail extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'journal_id',
        'coa_id',
        'debit',
        'credit',
        'note',
        'department_id',
        'project_id',
        'created_by',
    ];
}
