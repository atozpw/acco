<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class PurchaseInvoiceDetail extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'purchase_invoice_id',
        'product_id',
        'qty',
        'price',
        'amount',
        'tax_amount',
        'discount_percent',
        'discount_amount',
        'total',
        'note',
        'tax_id',
        'department_id',
        'project_id',
        'created_by',
    ];
}
