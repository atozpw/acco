<?php

namespace App\Observers;

use App\Models\PurchaseInvoiceDetail;
use App\Models\Stock;
use Illuminate\Contracts\Events\ShouldHandleEventsAfterCommit;

class PurchaseInvoiceDetailObserver implements ShouldHandleEventsAfterCommit
{
    /**
     * Handle the PurchaseInvoiceDetail "created" event.
     */
    public function created(PurchaseInvoiceDetail $purchaseInvoiceDetail): void
    {
        if (! $purchaseInvoiceDetail->purchaseInvoice->is_receipt) {
            Stock::where('warehouse_id', $purchaseInvoiceDetail->purchaseInvoice->warehouse_id)
                ->where('product_id', $purchaseInvoiceDetail->product_id)
                ->increment('qty', $purchaseInvoiceDetail->qty);
        }
    }

    /**
     * Handle the PurchaseInvoiceDetail "updated" event.
     */
    public function updated(PurchaseInvoiceDetail $purchaseInvoiceDetail): void
    {
        //
    }

    /**
     * Handle the PurchaseInvoiceDetail "deleted" event.
     */
    public function deleted(PurchaseInvoiceDetail $purchaseInvoiceDetail): void
    {
        if (! $purchaseInvoiceDetail->purchaseInvoice->getOriginal('is_receipt')) {
            Stock::where('warehouse_id', $purchaseInvoiceDetail->purchaseInvoice->warehouse_id)
                ->where('product_id', $purchaseInvoiceDetail->product_id)
                ->decrement('qty', $purchaseInvoiceDetail->qty);
        }
    }

    /**
     * Handle the PurchaseInvoiceDetail "restored" event.
     */
    public function restored(PurchaseInvoiceDetail $purchaseInvoiceDetail): void
    {
        //
    }

    /**
     * Handle the PurchaseInvoiceDetail "force deleted" event.
     */
    public function forceDeleted(PurchaseInvoiceDetail $purchaseInvoiceDetail): void
    {
        //
    }
}
