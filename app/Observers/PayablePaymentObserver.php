<?php

namespace App\Observers;

use App\Models\Journal;
use App\Models\JournalDetail;
use App\Models\PayablePayment;
use Illuminate\Contracts\Events\ShouldHandleEventsAfterCommit;

class PayablePaymentObserver implements ShouldHandleEventsAfterCommit
{
    /**
     * Handle the PayablePayment "created" event.
     */
    public function created(PayablePayment $payablePayment): void
    {
        $journal = Journal::create([
            'journal_category_id' => 11,
            'reference_no' => $payablePayment->reference_no,
            'date' => $payablePayment->date,
            'description' => $payablePayment->description,
            'created_by' => $payablePayment->created_by,
        ]);

        $payablePaymentDetails = $payablePayment->details()
            ->with('purchaseInvoice')
            ->get();

        $journalDetails = [];

        foreach ($payablePaymentDetails as $payablePaymentDetail) {
            $journalDetails[] = [
                'journal_id' => $journal->id,
                'coa_id' => $payablePaymentDetail->purchaseInvoice->coa_id,
                'debit' => $payablePaymentDetail->amount,
                'credit' => 0,
                'department_id' => $payablePaymentDetail->department_id,
                'created_by' => $payablePaymentDetail->created_by,
                'created_at' => $payablePaymentDetail->created_at,
                'updated_at' => $payablePaymentDetail->updated_at,
            ];
        }

        $journalDetails[] = [
            'journal_id' => $journal->id,
            'coa_id' => $payablePayment->coa_id,
            'debit' => 0,
            'credit' => $payablePayment->amount,
            'department_id' => 1,
            'created_by' => $payablePayment->created_by,
            'created_at' => $payablePayment->created_at,
            'updated_at' => $payablePayment->updated_at,
        ];

        JournalDetail::insert($journalDetails);
    }

    /**
     * Handle the PayablePayment "updated" event.
     */
    public function updated(PayablePayment $payablePayment): void
    {
        $journal = Journal::query()
            ->ofReferenceNo($payablePayment->reference_no)
            ->firstOrFail();

        $journal->reference_no = $payablePayment->reference_no;
        $journal->date = $payablePayment->date;
        $journal->description = $payablePayment->description;
        $journal->save();

        $journal->details()->delete();

        $payablePaymentDetails = $payablePayment->details()
            ->with('purchaseInvoice')
            ->get();

        $journalDetails = [];

        foreach ($payablePaymentDetails as $payablePaymentDetail) {
            $journalDetails[] = [
                'journal_id' => $journal->id,
                'coa_id' => $payablePaymentDetail->purchaseInvoice->coa_id,
                'debit' => $payablePaymentDetail->amount,
                'credit' => 0,
                'department_id' => $payablePaymentDetail->department_id,
                'created_by' => $payablePaymentDetail->created_by,
                'created_at' => $payablePaymentDetail->created_at,
                'updated_at' => $payablePaymentDetail->updated_at,
            ];
        }

        $journalDetails[] = [
            'journal_id' => $journal->id,
            'coa_id' => $payablePayment->coa_id,
            'debit' => 0,
            'credit' => $payablePayment->amount,
            'department_id' => 1,
            'created_by' => $payablePayment->created_by,
            'created_at' => $payablePayment->created_at,
            'updated_at' => $payablePayment->updated_at,
        ];

        JournalDetail::insert($journalDetails);
    }

    /**
     * Handle the PayablePayment "deleted" event.
     */
    public function deleted(PayablePayment $payablePayment): void
    {
        $journal = Journal::query()
            ->ofReferenceNo($payablePayment->reference_no)
            ->first();

        $journal->details()->delete();
        $journal->delete();
    }

    /**
     * Handle the PayablePayment "restored" event.
     */
    public function restored(PayablePayment $payablePayment): void
    {
        //
    }

    /**
     * Handle the PayablePayment "force deleted" event.
     */
    public function forceDeleted(PayablePayment $payablePayment): void
    {
        //
    }
}
