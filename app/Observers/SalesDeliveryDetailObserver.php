<?php

namespace App\Observers;

use App\Models\SalesDeliveryDetail;
use App\Models\Stock;
use Illuminate\Contracts\Events\ShouldHandleEventsAfterCommit;

class SalesDeliveryDetailObserver implements ShouldHandleEventsAfterCommit
{
    /**
     * Handle the SalesDeliveryDetail "created" event.
     */
    public function created(SalesDeliveryDetail $salesDeliveryDetail): void
    {
        Stock::where('warehouse_id', $salesDeliveryDetail->salesDelivery->warehouse_id)
            ->where('product_id', $salesDeliveryDetail->product_id)
            ->decrement('qty', $salesDeliveryDetail->qty);
    }

    /**
     * Handle the SalesDeliveryDetail "updated" event.
     */
    public function updated(SalesDeliveryDetail $salesDeliveryDetail): void
    {
        //
    }

    /**
     * Handle the SalesDeliveryDetail "deleted" event.
     */
    public function deleted(SalesDeliveryDetail $salesDeliveryDetail): void
    {
        Stock::where('warehouse_id', $salesDeliveryDetail->salesDelivery->warehouse_id)
            ->where('product_id', $salesDeliveryDetail->product_id)
            ->increment('qty', $salesDeliveryDetail->qty);
    }

    /**
     * Handle the SalesDeliveryDetail "restored" event.
     */
    public function restored(SalesDeliveryDetail $salesDeliveryDetail): void
    {
        //
    }

    /**
     * Handle the SalesDeliveryDetail "force deleted" event.
     */
    public function forceDeleted(SalesDeliveryDetail $salesDeliveryDetail): void
    {
        //
    }
}
