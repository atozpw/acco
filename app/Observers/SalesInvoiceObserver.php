<?php

namespace App\Observers;

use App\Models\Journal;
use App\Models\JournalDetail;
use App\Models\SalesInvoice;
use Illuminate\Contracts\Events\ShouldHandleEventsAfterCommit;

class SalesInvoiceObserver implements ShouldHandleEventsAfterCommit
{
    /**
     * Handle the SalesInvoice "created" event.
     */
    public function created(SalesInvoice $salesInvoice): void
    {
        $journal = Journal::create([
            'journal_category_id' => 7,
            'reference_no' => $salesInvoice->reference_no,
            'date' => $salesInvoice->date,
            'description' => $salesInvoice->description,
            'created_by' => $salesInvoice->created_by,
        ]);

        $salesInvoiceDetails = $salesInvoice->details()
            ->with('product.category')
            ->get();

        $journalDetails = [];

        $journalDetails[] = [
            'journal_id' => $journal->id,
            'coa_id' => $salesInvoice->coa_id,
            'debit' => $salesInvoice->amount,
            'credit' => 0,
            'department_id' => 1,
            'created_by' => $salesInvoice->created_by,
            'created_at' => $salesInvoice->created_at,
            'updated_at' => $salesInvoice->updated_at,
        ];

        foreach ($salesInvoiceDetails as $salesInvoiceDetail) {
            if ($salesInvoiceDetail->product->category->purchase_coa_id) {
                $journalDetails[] = [
                    'journal_id' => $journal->id,
                    'coa_id' => $salesInvoiceDetail->product->category->purchase_coa_id,
                    'debit' => $salesInvoiceDetail->amount,
                    'credit' => 0,
                    'department_id' => $salesInvoiceDetail->department_id,
                    'created_by' => $salesInvoiceDetail->created_by,
                    'created_at' => $salesInvoiceDetail->created_at,
                    'updated_at' => $salesInvoiceDetail->updated_at,
                ];
            }

            if ($salesInvoiceDetail->product->category->sales_coa_id) {
                $journalDetails[] = [
                    'journal_id' => $journal->id,
                    'coa_id' => $salesInvoiceDetail->product->category->sales_coa_id,
                    'debit' => 0,
                    'credit' => $salesInvoiceDetail->amount,
                    'department_id' => $salesInvoiceDetail->department_id,
                    'created_by' => $salesInvoiceDetail->created_by,
                    'created_at' => $salesInvoiceDetail->created_at,
                    'updated_at' => $salesInvoiceDetail->updated_at,
                ];
            }

            if ($salesInvoiceDetail->product->category->inventory_coa_id) {
                $journalDetails[] = [
                    'journal_id' => $journal->id,
                    'coa_id' => $salesInvoiceDetail->product->category->inventory_coa_id,
                    'debit' => 0,
                    'credit' => $salesInvoiceDetail->amount,
                    'department_id' => $salesInvoiceDetail->department_id,
                    'created_by' => $salesInvoiceDetail->created_by,
                    'created_at' => $salesInvoiceDetail->created_at,
                    'updated_at' => $salesInvoiceDetail->updated_at,
                ];
            }
        }

        JournalDetail::insert($journalDetails);
    }

    /**
     * Handle the SalesInvoice "updated" event.
     */
    public function updated(SalesInvoice $salesInvoice): void
    {
        $journal = Journal::query()
            ->ofReferenceNo($salesInvoice->reference_no)
            ->firstOrFail();

        $journal->reference_no = $salesInvoice->reference_no;
        $journal->date = $salesInvoice->date;
        $journal->description = $salesInvoice->description;
        $journal->save();

        $journal->details()->delete();

        $salesInvoiceDetails = $salesInvoice->details()
            ->with('product.category')
            ->get();

        $journalDetails = [];

        $journalDetails[] = [
            'journal_id' => $journal->id,
            'coa_id' => $salesInvoice->coa_id,
            'debit' => $salesInvoice->amount,
            'credit' => 0,
            'department_id' => 1,
            'created_by' => $salesInvoice->created_by,
            'created_at' => $salesInvoice->created_at,
            'updated_at' => $salesInvoice->updated_at,
        ];

        foreach ($salesInvoiceDetails as $salesInvoiceDetail) {
            if ($salesInvoiceDetail->product->category->purchase_coa_id) {
                $journalDetails[] = [
                    'journal_id' => $journal->id,
                    'coa_id' => $salesInvoiceDetail->product->category->purchase_coa_id,
                    'debit' => $salesInvoiceDetail->amount,
                    'credit' => 0,
                    'department_id' => $salesInvoiceDetail->department_id,
                    'created_by' => $salesInvoiceDetail->created_by,
                    'created_at' => $salesInvoiceDetail->created_at,
                    'updated_at' => $salesInvoiceDetail->updated_at,
                ];
            }

            if ($salesInvoiceDetail->product->category->sales_coa_id) {
                $journalDetails[] = [
                    'journal_id' => $journal->id,
                    'coa_id' => $salesInvoiceDetail->product->category->sales_coa_id,
                    'debit' => 0,
                    'credit' => $salesInvoiceDetail->amount,
                    'department_id' => $salesInvoiceDetail->department_id,
                    'created_by' => $salesInvoiceDetail->created_by,
                    'created_at' => $salesInvoiceDetail->created_at,
                    'updated_at' => $salesInvoiceDetail->updated_at,
                ];
            }

            if ($salesInvoiceDetail->product->category->inventory_coa_id) {
                $journalDetails[] = [
                    'journal_id' => $journal->id,
                    'coa_id' => $salesInvoiceDetail->product->category->inventory_coa_id,
                    'debit' => 0,
                    'credit' => $salesInvoiceDetail->amount,
                    'department_id' => $salesInvoiceDetail->department_id,
                    'created_by' => $salesInvoiceDetail->created_by,
                    'created_at' => $salesInvoiceDetail->created_at,
                    'updated_at' => $salesInvoiceDetail->updated_at,
                ];
            }
        }

        JournalDetail::insert($journalDetails);
    }

    /**
     * Handle the SalesInvoice "deleted" event.
     */
    public function deleted(SalesInvoice $salesInvoice): void
    {
        $journal = Journal::query()
            ->ofReferenceNo($salesInvoice->reference_no)
            ->first();

        $journal->details()->delete();
        $journal->delete();
    }

    /**
     * Handle the SalesInvoice "restored" event.
     */
    public function restored(SalesInvoice $salesInvoice): void
    {
        //
    }

    /**
     * Handle the SalesInvoice "force deleted" event.
     */
    public function forceDeleted(SalesInvoice $salesInvoice): void
    {
        //
    }
}
