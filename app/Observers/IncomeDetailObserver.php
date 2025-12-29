<?php

namespace App\Observers;

use App\Models\IncomeDetail;
use App\Models\Journal;
use Illuminate\Contracts\Events\ShouldHandleEventsAfterCommit;

class IncomeDetailObserver implements ShouldHandleEventsAfterCommit
{
    /**
     * Handle the IncomeDetail "created" event.
     */
    public function created(IncomeDetail $incomeDetail): void
    {
        $referenceNumber = $incomeDetail->income->reference_no;

        $journal = Journal::query()
            ->ofReferenceNo($referenceNumber)
            ->first();

        $journal->details()->create([
            'coa_id' => $incomeDetail->coa_id,
            'credit' => $incomeDetail->amount,
            'note' => $incomeDetail->note,
            'department_id' => $incomeDetail->department_id,
            'project_id' => $incomeDetail->project_id,
            'created_by' => $incomeDetail->created_by,
        ]);
    }

    /**
     * Handle the IncomeDetail "updated" event.
     */
    public function updated(IncomeDetail $incomeDetail): void
    {
        //
    }

    /**
     * Handle the IncomeDetail "deleted" event.
     */
    public function deleted(IncomeDetail $incomeDetail): void
    {
        //
    }

    /**
     * Handle the IncomeDetail "restored" event.
     */
    public function restored(IncomeDetail $incomeDetail): void
    {
        //
    }

    /**
     * Handle the IncomeDetail "force deleted" event.
     */
    public function forceDeleted(IncomeDetail $incomeDetail): void
    {
        //
    }
}
