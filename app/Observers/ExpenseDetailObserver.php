<?php

namespace App\Observers;

use App\Models\ExpenseDetail;
use App\Models\Journal;
use Illuminate\Contracts\Events\ShouldHandleEventsAfterCommit;

class ExpenseDetailObserver implements ShouldHandleEventsAfterCommit
{
    /**
     * Handle the ExpenseDetail "created" event.
     */
    public function created(ExpenseDetail $expenseDetail): void
    {
        $referenceNumber = $expenseDetail->expense->reference_no;

        $journal = Journal::query()
            ->ofReferenceNo($referenceNumber)
            ->first();

        $journal->details()->create([
            'coa_id' => $expenseDetail->coa_id,
            'debit' => $expenseDetail->amount,
            'note' => $expenseDetail->note,
            'department_id' => $expenseDetail->department_id,
            'project_id' => $expenseDetail->project_id,
            'created_by' => $expenseDetail->created_by,
        ]);
    }

    /**
     * Handle the ExpenseDetail "updated" event.
     */
    public function updated(ExpenseDetail $expenseDetail): void
    {
        //
    }

    /**
     * Handle the ExpenseDetail "deleted" event.
     */
    public function deleted(ExpenseDetail $expenseDetail): void
    {
        //
    }

    /**
     * Handle the ExpenseDetail "restored" event.
     */
    public function restored(ExpenseDetail $expenseDetail): void
    {
        //
    }

    /**
     * Handle the ExpenseDetail "force deleted" event.
     */
    public function forceDeleted(ExpenseDetail $expenseDetail): void
    {
        //
    }
}
