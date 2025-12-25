<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class PurchaseInvoiceReceipt extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'purchase_invoice_id',
        'purchase_receipt_id',
        'note',
        'created_by',
    ];
}
