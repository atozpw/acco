<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class CashTransfer extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'from_coa_id',
        'to_coa_id',
        'reference_no',
        'date',
        'description',
        'amount',
        'department_id',
        'project_id',
        'created_by',
    ];
}
