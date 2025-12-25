<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ProductTransferDetail extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'product_transfer_id',
        'product_id',
        'qty',
        'note',
        'created_by',
    ];
}
