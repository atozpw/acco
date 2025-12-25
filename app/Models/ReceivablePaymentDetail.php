<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ReceivablePaymentDetail extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'receivable_payment_id',
        'sales_invoice_id',
        'amount',
        'note',
        'department_id',
        'project_id',
        'created_by',
    ];
}
