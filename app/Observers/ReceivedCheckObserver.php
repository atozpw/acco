<?php

namespace App\Observers;

use App\Models\ReceivedCheck;
use Illuminate\Contracts\Events\ShouldHandleEventsAfterCommit;

class ReceivedCheckObserver implements ShouldHandleEventsAfterCommit
{
    /**
     * Handle the ReceivedCheck "created" event.
     */
    public function created(ReceivedCheck $receivedCheck): void
    {
        //
    }

    /**
     * Handle the ReceivedCheck "updated" event.
     */
    public function updated(ReceivedCheck $receivedCheck): void
    {
        //
    }

    /**
     * Handle the ReceivedCheck "deleted" event.
     */
    public function deleted(ReceivedCheck $receivedCheck): void
    {
        //
    }

    /**
     * Handle the ReceivedCheck "restored" event.
     */
    public function restored(ReceivedCheck $receivedCheck): void
    {
        //
    }

    /**
     * Handle the ReceivedCheck "force deleted" event.
     */
    public function forceDeleted(ReceivedCheck $receivedCheck): void
    {
        //
    }
}
