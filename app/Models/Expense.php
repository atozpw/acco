<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Expense extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'contact_id',
        'coa_id',
        'reference_no',
        'date',
        'description',
        'amount',
        'created_by',
    ];
}
