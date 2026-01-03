<?php

namespace App\Observers;

use App\Models\SalesInvoiceDetail;
use App\Models\Stock;

class SalesInvoiceDetailObserver
{
    /**
     * Handle the SalesInvoiceDetail "created" event.
     */
    public function created(SalesInvoiceDetail $salesInvoiceDetail): void
    {
        if (! $salesInvoiceDetail->salesInvoice->is_delivery) {
            Stock::where('warehouse_id', $salesInvoiceDetail->salesInvoice->warehouse_id)
                ->where('product_id', $salesInvoiceDetail->product_id)
                ->decrement('qty', $salesInvoiceDetail->qty);
        }
    }

    /**
     * Handle the SalesInvoiceDetail "updated" event.
     */
    public function updated(SalesInvoiceDetail $salesInvoiceDetail): void
    {
        //
    }

    /**
     * Handle the SalesInvoiceDetail "deleted" event.
     */
    public function deleted(SalesInvoiceDetail $salesInvoiceDetail): void
    {
        if (! $salesInvoiceDetail->salesInvoice->getOriginal('is_delivery')) {
            Stock::where('warehouse_id', $salesInvoiceDetail->salesInvoice->warehouse_id)
                ->where('product_id', $salesInvoiceDetail->product_id)
                ->increment('qty', $salesInvoiceDetail->qty);
        }
    }

    /**
     * Handle the SalesInvoiceDetail "restored" event.
     */
    public function restored(SalesInvoiceDetail $salesInvoiceDetail): void
    {
        //
    }

    /**
     * Handle the SalesInvoiceDetail "force deleted" event.
     */
    public function forceDeleted(SalesInvoiceDetail $salesInvoiceDetail): void
    {
        //
    }
}
