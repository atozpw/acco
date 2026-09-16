<?php

namespace App\Observers;

use App\Models\GiroIn;
use Illuminate\Contracts\Events\ShouldHandleEventsAfterCommit;

class GiroInObserver implements ShouldHandleEventsAfterCommit
{
    /**
     * Handle the GiroIn "created" event.
     */
    public function created(GiroIn $giroIn): void
    {
        //
    }

    /**
     * Handle the GiroIn "updated" event.
     */
    public function updated(GiroIn $giroIn): void
    {
        //
    }

    /**
     * Handle the GiroIn "deleted" event.
     */
    public function deleted(GiroIn $giroIn): void
    {
        //
    }

    /**
     * Handle the GiroIn "restored" event.
     */
    public function restored(GiroIn $giroIn): void
    {
        //
    }

    /**
     * Handle the GiroIn "force deleted" event.
     */
    public function forceDeleted(GiroIn $giroIn): void
    {
        //
    }
}
