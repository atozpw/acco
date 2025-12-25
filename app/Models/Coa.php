<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Coa extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'parent_id',
        'code',
        'name',
        'classification',
        'is_debit',
        'is_cash_bank',
        'is_active',
    ];
}
