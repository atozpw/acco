<?php

namespace App\Observers;

use App\Models\Journal;
use App\Models\JournalDetail;
use App\Models\ReceivablePayment;
use Illuminate\Contracts\Events\ShouldHandleEventsAfterCommit;

class ReceivablePaymentObserver implements ShouldHandleEventsAfterCommit
{
    /**
     * Handle the ReceivablePayment "created" event.
     */
    public function created(ReceivablePayment $receivablePayment): void
    {
        $journal = Journal::create([
            'journal_category_id' => 8,
            'reference_no' => $receivablePayment->reference_no,
            'date' => $receivablePayment->date,
            'description' => $receivablePayment->description,
            'created_by' => $receivablePayment->created_by,
        ]);

        $receivablePaymentDetails = $receivablePayment->details()
            ->with('salesInvoice')
            ->get();

        $journalDetails = [];

        $journalDetails[] = [
            'journal_id' => $journal->id,
            'coa_id' => $receivablePayment->coa_id,
            'debit' => $receivablePayment->amount,
            'credit' => 0,
            'department_id' => 1,
            'created_by' => $receivablePayment->created_by,
            'created_at' => $receivablePayment->created_at,
            'updated_at' => $receivablePayment->updated_at,
        ];

        foreach ($receivablePaymentDetails as $receivablePaymentDetail) {
            $journalDetails[] = [
                'journal_id' => $journal->id,
                'coa_id' => $receivablePaymentDetail->salesInvoice->coa_id,
                'debit' => 0,
                'credit' => $receivablePaymentDetail->amount,
                'department_id' => $receivablePaymentDetail->department_id,
                'created_by' => $receivablePaymentDetail->created_by,
                'created_at' => $receivablePaymentDetail->created_at,
                'updated_at' => $receivablePaymentDetail->updated_at,
            ];
        }

        JournalDetail::insert($journalDetails);
    }

    /**
     * Handle the ReceivablePayment "updated" event.
     */
    public function updated(ReceivablePayment $receivablePayment): void
    {
        $journal = Journal::query()
            ->ofReferenceNo($receivablePayment->reference_no)
            ->firstOrFail();

        $journal->reference_no = $receivablePayment->reference_no;
        $journal->date = $receivablePayment->date;
        $journal->description = $receivablePayment->description;
        $journal->save();

        $journal->details()->delete();

        $receivablePaymentDetails = $receivablePayment->details()
            ->with('salesInvoice')
            ->get();

        $journalDetails = [];

        $journalDetails[] = [
            'journal_id' => $journal->id,
            'coa_id' => $receivablePayment->coa_id,
            'debit' => $receivablePayment->amount,
            'credit' => 0,
            'department_id' => 1,
            'created_by' => $receivablePayment->created_by,
            'created_at' => $receivablePayment->created_at,
            'updated_at' => $receivablePayment->updated_at,
        ];

        foreach ($receivablePaymentDetails as $receivablePaymentDetail) {
            $journalDetails[] = [
                'journal_id' => $journal->id,
                'coa_id' => $receivablePaymentDetail->salesInvoice->coa_id,
                'debit' => 0,
                'credit' => $receivablePaymentDetail->amount,
                'department_id' => $receivablePaymentDetail->department_id,
                'created_by' => $receivablePaymentDetail->created_by,
                'created_at' => $receivablePaymentDetail->created_at,
                'updated_at' => $receivablePaymentDetail->updated_at,
            ];
        }

        JournalDetail::insert($journalDetails);
    }

    /**
     * Handle the ReceivablePayment "deleted" event.
     */
    public function deleted(ReceivablePayment $receivablePayment): void
    {
        $journal = Journal::query()
            ->ofReferenceNo($receivablePayment->reference_no)
            ->first();

        $journal->details()->delete();
        $journal->delete();
    }

    /**
     * Handle the ReceivablePayment "restored" event.
     */
    public function restored(ReceivablePayment $receivablePayment): void
    {
        //
    }

    /**
     * Handle the ReceivablePayment "force deleted" event.
     */
    public function forceDeleted(ReceivablePayment $receivablePayment): void
    {
        //
    }
}
