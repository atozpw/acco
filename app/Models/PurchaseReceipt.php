<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class PurchaseReceipt extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'contact_id',
        'warehouse_id',
        'reference_no',
        'date',
        'description',
        'amount',
        'tax_amount',
        'discount_percent',
        'discount_amount',
        'total',
        'is_closed',
        'created_by',
    ];
}
