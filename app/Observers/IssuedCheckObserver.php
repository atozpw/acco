<?php

namespace App\Observers;

use App\Models\IssuedCheck;
use Illuminate\Contracts\Events\ShouldHandleEventsAfterCommit;

class IssuedCheckObserver implements ShouldHandleEventsAfterCommit
{
    /**
     * Handle the IssuedCheck "created" event.
     */
    public function created(IssuedCheck $issuedCheck): void
    {
        //
    }

    /**
     * Handle the IssuedCheck "updated" event.
     */
    public function updated(IssuedCheck $issuedCheck): void
    {
        //
    }

    /**
     * Handle the IssuedCheck "deleted" event.
     */
    public function deleted(IssuedCheck $issuedCheck): void
    {
        //
    }

    /**
     * Handle the IssuedCheck "restored" event.
     */
    public function restored(IssuedCheck $issuedCheck): void
    {
        //
    }

    /**
     * Handle the IssuedCheck "force deleted" event.
     */
    public function forceDeleted(IssuedCheck $issuedCheck): void
    {
        //
    }
}
