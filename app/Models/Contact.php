<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Contact extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'code',
        'name',
        'address',
        'email',
        'phone',
        'avatar',
        'is_customer',
        'is_vendor',
        'is_employee',
        'is_active',
    ];
}
