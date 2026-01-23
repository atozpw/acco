<?php

namespace App\Observers;

use App\Models\Journal;
use App\Models\JournalDetail;
use App\Models\PurchaseInvoice;
use Illuminate\Contracts\Events\ShouldHandleEventsAfterCommit;

class PurchaseInvoiceObserver implements ShouldHandleEventsAfterCommit
{
    /**
     * Handle the PurchaseInvoice "created" event.
     */
    public function created(PurchaseInvoice $purchaseInvoice): void
    {
        $journal = Journal::create([
            'journal_category_id' => 10,
            'reference_no' => $purchaseInvoice->reference_no,
            'date' => $purchaseInvoice->date,
            'description' => $purchaseInvoice->description,
            'created_by' => $purchaseInvoice->created_by,
        ]);

        $purchaseInvoiceDetails = $purchaseInvoice->details()
            ->with('product.category')
            ->get();

        $journalDetails = [];

        foreach ($purchaseInvoiceDetails as $purchaseInvoiceDetail) {
            $coaId = $purchaseInvoice->is_receipt
                ? $purchaseInvoiceDetail->product->category->purchase_receipt_coa_id
                : $purchaseInvoiceDetail->product->category->inventory_coa_id;

            if (!$coaId) continue;

            $journalDetails[] = [
                'journal_id' => $journal->id,
                'coa_id' => $coaId,
                'debit' => $purchaseInvoiceDetail->amount,
                'credit' => 0,
                'department_id' => $purchaseInvoiceDetail->department_id,
                'created_by' => $purchaseInvoiceDetail->created_by,
                'created_at' => $purchaseInvoiceDetail->created_at,
                'updated_at' => $purchaseInvoiceDetail->updated_at,
            ];
        }

        $journalDetails[] = [
            'journal_id' => $journal->id,
            'coa_id' => $purchaseInvoice->coa_id,
            'debit' => 0,
            'credit' => $purchaseInvoice->amount,
            'department_id' => 1,
            'created_by' => $purchaseInvoice->created_by,
            'created_at' => $purchaseInvoice->created_at,
            'updated_at' => $purchaseInvoice->updated_at,
        ];

        JournalDetail::insert($journalDetails);
    }

    /**
     * Handle the PurchaseInvoice "updated" event.
     */
    public function updated(PurchaseInvoice $purchaseInvoice): void
    {
        $journal = Journal::query()
            ->ofReferenceNo($purchaseInvoice->reference_no)
            ->firstOrFail();

        $journal->reference_no = $purchaseInvoice->reference_no;
        $journal->date = $purchaseInvoice->date;
        $journal->description = $purchaseInvoice->description;
        $journal->save();

        $journal->details()->delete();

        $purchaseInvoiceDetails = $purchaseInvoice->details()
            ->with('product.category')
            ->get();

        $journalDetails = [];

        foreach ($purchaseInvoiceDetails as $purchaseInvoiceDetail) {
            $coaId = $purchaseInvoice->is_receipt
                ? $purchaseInvoiceDetail->product->category->purchase_receipt_coa_id
                : $purchaseInvoiceDetail->product->category->inventory_coa_id;

            if (!$coaId) continue;

            $journalDetails[] = [
                'journal_id' => $journal->id,
                'coa_id' => $coaId,
                'debit' => $purchaseInvoiceDetail->amount,
                'credit' => 0,
                'department_id' => $purchaseInvoiceDetail->department_id,
                'created_by' => $purchaseInvoiceDetail->created_by,
                'created_at' => $purchaseInvoiceDetail->created_at,
                'updated_at' => $purchaseInvoiceDetail->updated_at,
            ];
        }

        $journalDetails[] = [
            'journal_id' => $journal->id,
            'coa_id' => $purchaseInvoice->coa_id,
            'debit' => 0,
            'credit' => $purchaseInvoice->amount,
            'department_id' => 1,
            'created_by' => $purchaseInvoice->created_by,
            'created_at' => $purchaseInvoice->created_at,
            'updated_at' => $purchaseInvoice->updated_at,
        ];

        JournalDetail::insert($journalDetails);
    }

    /**
     * Handle the PurchaseInvoice "deleted" event.
     */
    public function deleted(PurchaseInvoice $purchaseInvoice): void
    {
        $journal = Journal::query()
            ->ofReferenceNo($purchaseInvoice->reference_no)
            ->first();

        $journal->details()->delete();
        $journal->delete();
    }

    /**
     * Handle the PurchaseInvoice "restored" event.
     */
    public function restored(PurchaseInvoice $purchaseInvoice): void
    {
        //
    }

    /**
     * Handle the PurchaseInvoice "force deleted" event.
     */
    public function forceDeleted(PurchaseInvoice $purchaseInvoice): void
    {
        //
    }
}
