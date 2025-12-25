<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Tax extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'code',
        'name',
        'rate',
        'sales_coa_id',
        'purchase_coa_id',
        'is_active',
    ];
}
