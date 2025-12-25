<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class SalesInvoiceDelivery extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'sales_invoice_id',
        'sales_delivery_id',
        'note',
        'created_by',
    ];
}
