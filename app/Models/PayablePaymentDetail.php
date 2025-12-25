<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class PayablePaymentDetail extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'payable_payment_id',
        'purchase_invoice_id',
        'amount',
        'note',
        'department_id',
        'project_id',
        'created_by',
    ];
}
