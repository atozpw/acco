<?php

namespace App\Observers;

use App\Models\GiroOut;
use Illuminate\Contracts\Events\ShouldHandleEventsAfterCommit;

class GiroOutObserver implements ShouldHandleEventsAfterCommit
{
    /**
     * Handle the GiroOut "created" event.
     */
    public function created(GiroOut $giroOut): void
    {
        //
    }

    /**
     * Handle the GiroOut "updated" event.
     */
    public function updated(GiroOut $giroOut): void
    {
        //
    }

    /**
     * Handle the GiroOut "deleted" event.
     */
    public function deleted(GiroOut $giroOut): void
    {
        //
    }

    /**
     * Handle the GiroOut "restored" event.
     */
    public function restored(GiroOut $giroOut): void
    {
        //
    }

    /**
     * Handle the GiroOut "force deleted" event.
     */
    public function forceDeleted(GiroOut $giroOut): void
    {
        //
    }
}
