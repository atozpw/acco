<?php

namespace App\Observers;

use App\Models\Product;
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
        $warehouseId = $purchaseReceiptDetail->purchaseReceipt->warehouse_id;
        $productId = $purchaseReceiptDetail->product_id;
        $qtyIn = $purchaseReceiptDetail->qty;
        $priceIn = $purchaseReceiptDetail->price;

        $oldStock = Stock::where('product_id', $productId)->sum('qty');

        Stock::where('warehouse_id', $warehouseId)
            ->where('product_id', $productId)
            ->increment('qty', $qtyIn);

        $product = Product::lockForUpdate()->findOrFail($productId);

        $newStock = $oldStock + $qtyIn;

        $newCogs = $oldStock == 0
            ? $priceIn
            : (($oldStock * $product->cogs) + ($qtyIn * $priceIn)) / $newStock;

        $product->updateQuietly([
            'purchase_price' => $priceIn,
            'cogs' => $newCogs,
        ]);
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
