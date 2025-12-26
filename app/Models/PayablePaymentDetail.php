<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
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

    public function payablePayment(): BelongsTo
    {
        return $this->belongsTo(PayablePayment::class);
    }

    public function purchaseInvoice(): BelongsTo
    {
        return $this->belongsTo(PurchaseInvoice::class);
    }

    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
