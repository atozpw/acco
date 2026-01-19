<?php

namespace App\Observers;

use App\Models\Journal;
use App\Models\JournalDetail;
use App\Models\PurchaseReceipt;
use Illuminate\Contracts\Events\ShouldHandleEventsAfterCommit;

class PurchaseReceiptObserver implements ShouldHandleEventsAfterCommit
{
    /**
     * Handle the PurchaseReceipt "created" event.
     */
    public function created(PurchaseReceipt $purchaseReceipt): void
    {
        if (!$purchaseReceipt->is_beginning) {
            $journal = Journal::create([
                'journal_category_id' => 9,
                'reference_no' => $purchaseReceipt->reference_no,
                'date' => $purchaseReceipt->date,
                'description' => $purchaseReceipt->description,
                'created_by' => $purchaseReceipt->created_by,
            ]);

            $purchaseReceiptDetails = $purchaseReceipt->details()
                ->with('product.category')
                ->get();

            $journalDetails = [];

            foreach ($purchaseReceiptDetails as $purchaseReceiptDetail) {
                if ($purchaseReceiptDetail->product->category->inventory_coa_id && $purchaseReceiptDetail->product->is_stock_tracking) {
                    $journalDetails[] = [
                        'journal_id' => $journal->id,
                        'coa_id' => $purchaseReceiptDetail->product->category->inventory_coa_id,
                        'debit' => $purchaseReceiptDetail->amount,
                        'credit' => 0,
                        'department_id' => $purchaseReceiptDetail->department_id,
                        'created_by' => $purchaseReceiptDetail->created_by,
                        'created_at' => $purchaseReceiptDetail->created_at,
                        'updated_at' => $purchaseReceiptDetail->updated_at,
                    ];
                }

                if ($purchaseReceiptDetail->product->category->purchase_receipt_coa_id) {
                    $journalDetails[] = [
                        'journal_id' => $journal->id,
                        'coa_id' => $purchaseReceiptDetail->product->category->purchase_receipt_coa_id,
                        'debit' => 0,
                        'credit' => $purchaseReceiptDetail->amount,
                        'department_id' => $purchaseReceiptDetail->department_id,
                        'created_by' => $purchaseReceiptDetail->created_by,
                        'created_at' => $purchaseReceiptDetail->created_at,
                        'updated_at' => $purchaseReceiptDetail->updated_at,
                    ];
                }
            }

            JournalDetail::insert($journalDetails);
        }
    }

    /**
     * Handle the PurchaseReceipt "updated" event.
     */
    public function updated(PurchaseReceipt $purchaseReceipt): void
    {
        $journal = Journal::query()
            ->ofReferenceNo($purchaseReceipt->reference_no)
            ->firstOrFail();

        $journal->reference_no = $purchaseReceipt->reference_no;
        $journal->date = $purchaseReceipt->date;
        $journal->description = $purchaseReceipt->description;
        $journal->save();

        $journal->details()->delete();

        $purchaseReceiptDetails = $purchaseReceipt->details()
            ->with('product.category')
            ->get();

        $journalDetails = [];

        foreach ($purchaseReceiptDetails as $purchaseReceiptDetail) {
            if ($purchaseReceiptDetail->product->category->inventory_coa_id && $purchaseReceiptDetail->product->is_stock_tracking) {
                $journalDetails[] = [
                    'journal_id' => $journal->id,
                    'coa_id' => $purchaseReceiptDetail->product->category->inventory_coa_id,
                    'debit' => $purchaseReceiptDetail->amount,
                    'credit' => 0,
                    'department_id' => $purchaseReceiptDetail->department_id,
                    'created_by' => $purchaseReceiptDetail->created_by,
                    'created_at' => $purchaseReceiptDetail->created_at,
                    'updated_at' => $purchaseReceiptDetail->updated_at,
                ];
            }

            if ($purchaseReceiptDetail->product->category->purchase_receipt_coa_id) {
                $journalDetails[] = [
                    'journal_id' => $journal->id,
                    'coa_id' => $purchaseReceiptDetail->product->category->purchase_receipt_coa_id,
                    'debit' => 0,
                    'credit' => $purchaseReceiptDetail->amount,
                    'department_id' => $purchaseReceiptDetail->department_id,
                    'created_by' => $purchaseReceiptDetail->created_by,
                    'created_at' => $purchaseReceiptDetail->created_at,
                    'updated_at' => $purchaseReceiptDetail->updated_at,
                ];
            }
        }

        JournalDetail::insert($journalDetails);
    }

    /**
     * Handle the PurchaseReceipt "deleted" event.
     */
    public function deleted(PurchaseReceipt $purchaseReceipt): void
    {
        $journal = Journal::query()
            ->ofReferenceNo($purchaseReceipt->reference_no)
            ->first();

        $journal->details()->delete();
        $journal->delete();
    }

    /**
     * Handle the PurchaseReceipt "restored" event.
     */
    public function restored(PurchaseReceipt $purchaseReceipt): void
    {
        //
    }

    /**
     * Handle the PurchaseReceipt "force deleted" event.
     */
    public function forceDeleted(PurchaseReceipt $purchaseReceipt): void
    {
        //
    }
}
