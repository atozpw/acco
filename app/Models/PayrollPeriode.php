<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class PayrollPeriode extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'code',
        'name',
        'debt_date',
        'start_date',
        'end_date',
        'created_by',
    ];
}
