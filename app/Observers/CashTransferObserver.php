<?php

namespace App\Observers;

use App\Helpers\ReferenceNumber;
use App\Models\CashTransfer;

class CashTransferObserver
{
    /**
     * Handle the CashTransfer "created" event.
     */
    public function created(CashTransfer $cashTransfer): void
    {
        ReferenceNumber::updateCashTransfer();
    }

    /**
     * Handle the CashTransfer "updated" event.
     */
    public function updated(CashTransfer $cashTransfer): void
    {
        //
    }

    /**
     * Handle the CashTransfer "deleted" event.
     */
    public function deleted(CashTransfer $cashTransfer): void
    {
        //
    }

    /**
     * Handle the CashTransfer "restored" event.
     */
    public function restored(CashTransfer $cashTransfer): void
    {
        //
    }

    /**
     * Handle the CashTransfer "force deleted" event.
     */
    public function forceDeleted(CashTransfer $cashTransfer): void
    {
        //
    }
}
