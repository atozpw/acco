<?php

namespace App\Observers;

use App\Helpers\ReferenceNumber;
use App\Models\CashTransfer;
use App\Models\Journal;
use Illuminate\Contracts\Events\ShouldHandleEventsAfterCommit;

class CashTransferObserver implements ShouldHandleEventsAfterCommit
{
    /**
     * Handle the CashTransfer "created" event.
     */
    public function created(CashTransfer $cashTransfer): void
    {
        $journal = Journal::create([
            'journal_category_id' => 5,
            'reference_no' => $cashTransfer->reference_no,
            'date' => $cashTransfer->date,
            'description' => $cashTransfer->description,
            'created_by' => $cashTransfer->created_by,
        ]);

        $journal->details()->create([
            'coa_id' => $cashTransfer->to_coa_id,
            'debit' => $cashTransfer->amount,
            'department_id' => $cashTransfer->department_id,
            'project_id' => $cashTransfer->project_id,
            'created_by' => $cashTransfer->created_by,
        ]);

        $journal->details()->create([
            'coa_id' => $cashTransfer->from_coa_id,
            'credit' => $cashTransfer->amount,
            'department_id' => $cashTransfer->department_id,
            'project_id' => $cashTransfer->project_id,
            'created_by' => $cashTransfer->created_by,
        ]);

        ReferenceNumber::updateCashTransfer();
    }

    /**
     * Handle the CashTransfer "updated" event.
     */
    public function updated(CashTransfer $cashTransfer): void
    {
        $journal = Journal::query()
            ->ofReferenceNo($cashTransfer->reference_no)
            ->first();

        $journal->reference_no = $cashTransfer->reference_no;
        $journal->date = $cashTransfer->date;
        $journal->description = $cashTransfer->description;
        $journal->save();

        $journal->details()->delete();

        $journal->details()->create([
            'coa_id' => $cashTransfer->to_coa_id,
            'debit' => $cashTransfer->amount,
            'department_id' => $cashTransfer->department_id,
            'project_id' => $cashTransfer->project_id,
            'created_by' => $cashTransfer->created_by,
        ]);

        $journal->details()->create([
            'coa_id' => $cashTransfer->from_coa_id,
            'credit' => $cashTransfer->amount,
            'department_id' => $cashTransfer->department_id,
            'project_id' => $cashTransfer->project_id,
            'created_by' => $cashTransfer->created_by,
        ]);
    }

    /**
     * Handle the CashTransfer "deleted" event.
     */
    public function deleted(CashTransfer $cashTransfer): void
    {
        $journal = Journal::query()
            ->ofReferenceNo($cashTransfer->reference_no)
            ->first();

        $journal->details()->delete();
        $journal->delete();
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
