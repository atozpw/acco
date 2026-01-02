<?php

namespace App\Observers;

use App\Models\Product;
use App\Models\Stock;
use App\Models\Warehouse;

class WarehouseObserver
{
    /**
     * Handle the Warehouse "created" event.
     */
    public function created(Warehouse $warehouse): void
    {
        $products = Product::where('is_stock_tracking', 1)->select('id')->get();

        foreach ($products as $product) {
            Stock::create([
                'warehouse_id' => $warehouse->id,
                'product_id' => $product->id,
            ]);
        }
    }

    /**
     * Handle the Warehouse "updated" event.
     */
    public function updated(Warehouse $warehouse): void
    {
        //
    }

    /**
     * Handle the Warehouse "deleted" event.
     */
    public function deleted(Warehouse $warehouse): void
    {
        Stock::where('warehouse_id', $warehouse->id)->delete();
    }

    /**
     * Handle the Warehouse "restored" event.
     */
    public function restored(Warehouse $warehouse): void
    {
        //
    }

    /**
     * Handle the Warehouse "force deleted" event.
     */
    public function forceDeleted(Warehouse $warehouse): void
    {
        //
    }
}
