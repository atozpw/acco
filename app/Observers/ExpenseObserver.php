<?php

namespace App\Observers;

use App\Helpers\ReferenceNumber;
use App\Models\Expense;
use App\Models\Journal;
use Illuminate\Contracts\Events\ShouldHandleEventsAfterCommit;

class ExpenseObserver implements ShouldHandleEventsAfterCommit
{
    /**
     * Handle the Expense "created" event.
     */
    public function created(Expense $expense): void
    {
        $journal = Journal::create([
            'journal_category_id' => 4,
            'reference_no' => $expense->reference_no,
            'date' => $expense->date,
            'description' => $expense->description,
            'created_by' => $expense->created_by,
        ]);

        $journal->details()->create([
            'coa_id' => $expense->coa_id,
            'credit' => $expense->amount,
            'department_id' => 1,
            'created_by' => $expense->created_by,
        ]);

        ReferenceNumber::updateExpense();
    }

    /**
     * Handle the Expense "updated" event.
     */
    public function updated(Expense $expense): void
    {
        $journal = Journal::query()
            ->ofReferenceNo($expense->reference_no)
            ->first();

        $journal->reference_no = $expense->reference_no;
        $journal->date = $expense->date;
        $journal->description = $expense->description;
        $journal->save();

        $journal->details()->delete();

        $journal->details()->create([
            'coa_id' => $expense->coa_id,
            'credit' => $expense->amount,
            'department_id' => 1,
            'created_by' => $expense->created_by,
        ]);
    }

    /**
     * Handle the Expense "deleted" event.
     */
    public function deleted(Expense $expense): void
    {
        $journal = Journal::query()
            ->ofReferenceNo($expense->reference_no)
            ->first();

        $journal->details()->delete();
        $journal->delete();
    }

    /**
     * Handle the Expense "restored" event.
     */
    public function restored(Expense $expense): void
    {
        //
    }

    /**
     * Handle the Expense "force deleted" event.
     */
    public function forceDeleted(Expense $expense): void
    {
        //
    }
}
