<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ExpenseDetail extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'expense_id',
        'coa_id',
        'amount',
        'note',
        'department_id',
        'project_id',
        'created_by',
    ];
}
