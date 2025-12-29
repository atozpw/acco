<?php

namespace App\Observers;

use App\Helpers\ReferenceNumber;
use App\Models\Income;
use App\Models\Journal;
use Illuminate\Contracts\Events\ShouldHandleEventsAfterCommit;

class IncomeObserver implements ShouldHandleEventsAfterCommit
{
    /**
     * Handle the Income "created" event.
     */
    public function created(Income $income): void
    {
        $journal = Journal::create([
            'journal_category_id' => 3,
            'reference_no' => $income->reference_no,
            'date' => $income->date,
            'description' => $income->description,
            'created_by' => $income->created_by,
        ]);

        $journal->details()->create([
            'coa_id' => $income->coa_id,
            'debit' => $income->amount,
            'department_id' => 1,
            'created_by' => $income->created_by,
        ]);

        ReferenceNumber::updateIncome();
    }

    /**
     * Handle the Income "updated" event.
     */
    public function updated(Income $income): void
    {
        $journal = Journal::query()
            ->ofReferenceNo($income->reference_no)
            ->first();

        $journal->reference_no = $income->reference_no;
        $journal->date = $income->date;
        $journal->description = $income->description;
        $journal->save();

        $journal->details()->delete();

        $journal->details()->create([
            'coa_id' => $income->coa_id,
            'debit' => $income->amount,
            'department_id' => 1,
            'created_by' => $income->created_by,
        ]);
    }

    /**
     * Handle the Income "deleted" event.
     */
    public function deleted(Income $income): void
    {
        $journal = Journal::query()
            ->ofReferenceNo($income->reference_no)
            ->first();

        $journal->details()->delete();
        $journal->delete();
    }

    /**
     * Handle the Income "restored" event.
     */
    public function restored(Income $income): void
    {
        //
    }

    /**
     * Handle the Income "force deleted" event.
     */
    public function forceDeleted(Income $income): void
    {
        //
    }
}
