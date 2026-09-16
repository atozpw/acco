<?php

namespace App\Observers;

use App\Models\GiroBill;
use Illuminate\Contracts\Events\ShouldHandleEventsAfterCommit;

class GiroBillObserver implements ShouldHandleEventsAfterCommit
{
    /**
     * Handle the GiroBill "created" event.
     */
    public function created(GiroBill $giroBill): void
    {
        //
    }

    /**
     * Handle the GiroBill "updated" event.
     */
    public function updated(GiroBill $giroBill): void
    {
        //
    }

    /**
     * Handle the GiroBill "deleted" event.
     */
    public function deleted(GiroBill $giroBill): void
    {
        //
    }

    /**
     * Handle the GiroBill "restored" event.
     */
    public function restored(GiroBill $giroBill): void
    {
        //
    }

    /**
     * Handle the GiroBill "force deleted" event.
     */
    public function forceDeleted(GiroBill $giroBill): void
    {
        //
    }
}
