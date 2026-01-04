<?php

namespace App\Observers;

use App\Models\PurchaseReceiptDetail;
use App\Models\Stock;
use Illuminate\Contracts\Events\ShouldHandleEventsAfterCommit;

class PurchaseReceiptDetailObserver implements ShouldHandleEventsAfterCommit
{
    /**
     * Handle the PurchaseReceiptDetail "created" event.
     */
    public function created(PurchaseReceiptDetail $purchaseReceiptDetail): void
    {
        Stock::where('warehouse_id', $purchaseReceiptDetail->purchaseReceipt->warehouse_id)
            ->where('product_id', $purchaseReceiptDetail->product_id)
            ->increment('qty', $purchaseReceiptDetail->qty);
    }

    /**
     * Handle the PurchaseReceiptDetail "updated" event.
     */
    public function updated(PurchaseReceiptDetail $purchaseReceiptDetail): void
    {
        //
    }

    /**
     * Handle the PurchaseReceiptDetail "deleted" event.
     */
    public function deleted(PurchaseReceiptDetail $purchaseReceiptDetail): void
    {
        Stock::where('warehouse_id', $purchaseReceiptDetail->purchaseReceipt->warehouse_id)
            ->where('product_id', $purchaseReceiptDetail->product_id)
            ->decrement('qty', $purchaseReceiptDetail->qty);
    }

    /**
     * Handle the PurchaseReceiptDetail "restored" event.
     */
    public function restored(PurchaseReceiptDetail $purchaseReceiptDetail): void
    {
        //
    }

    /**
     * Handle the PurchaseReceiptDetail "force deleted" event.
     */
    public function forceDeleted(PurchaseReceiptDetail $purchaseReceiptDetail): void
    {
        //
    }
}
