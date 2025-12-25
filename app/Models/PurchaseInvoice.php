<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class PurchaseInvoice extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'contact_id',
        'coa_id',
        'warehouse_id',
        'reference_no',
        'date',
        'description',
        'amount',
        'tax_amount',
        'discount_percent',
        'discount_amount',
        'total',
        'is_paid',
        'is_receipt',
        'created_by',
    ];
}
