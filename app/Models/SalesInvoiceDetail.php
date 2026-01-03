<?php

namespace App\Models;

use App\Observers\SalesInvoiceDetailObserver;
use Illuminate\Database\Eloquent\Attributes\ObservedBy;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

#[ObservedBy([SalesInvoiceDetailObserver::class])]
class SalesInvoiceDetail extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'sales_invoice_id',
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

    public function salesInvoice(): BelongsTo
    {
        return $this->belongsTo(SalesInvoice::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function tax(): BelongsTo
    {
        return $this->belongsTo(Tax::class);
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
