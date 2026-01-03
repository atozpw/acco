<?php

namespace App\Observers;

use App\Models\Journal;
use App\Models\JournalDetail;
use App\Models\SalesDelivery;
use Illuminate\Contracts\Events\ShouldHandleEventsAfterCommit;

class SalesDeliveryObserver implements ShouldHandleEventsAfterCommit
{
    /**
     * Handle the SalesDelivery "created" event.
     */
    public function created(SalesDelivery $salesDelivery): void
    {
        $journal = Journal::create([
            'journal_category_id' => 6,
            'reference_no' => $salesDelivery->reference_no,
            'date' => $salesDelivery->date,
            'description' => $salesDelivery->description,
            'created_by' => $salesDelivery->created_by,
        ]);

        $salesDeliveryDetails = $salesDelivery->details()
            ->with('product.category')
            ->get();

        $journalDetails = [];

        foreach ($salesDeliveryDetails as $salesDeliveryDetail) {
            $journalDetails[] = [
                'journal_id' => $journal->id,
                'coa_id' => $salesDeliveryDetail->product->category->sales_delivery_coa_id,
                'debit' => $salesDeliveryDetail->amount,
                'credit' => 0,
                'department_id' => $salesDeliveryDetail->department_id,
                'created_by' => $salesDeliveryDetail->created_by,
                'created_at' => $salesDeliveryDetail->created_at,
                'updated_at' => $salesDeliveryDetail->updated_at,
            ];

            $journalDetails[] = [
                'journal_id' => $journal->id,
                'coa_id' => $salesDeliveryDetail->product->category->inventory_coa_id,
                'debit' => 0,
                'credit' => $salesDeliveryDetail->amount,
                'department_id' => $salesDeliveryDetail->department_id,
                'created_by' => $salesDeliveryDetail->created_by,
                'created_at' => $salesDeliveryDetail->created_at,
                'updated_at' => $salesDeliveryDetail->updated_at,
            ];
        }

        JournalDetail::insert($journalDetails);
    }

    /**
     * Handle the SalesDelivery "updated" event.
     */
    public function updated(SalesDelivery $salesDelivery): void
    {
        $journal = Journal::query()
            ->ofReferenceNo($salesDelivery->reference_no)
            ->firstOrFail();

        $journal->reference_no = $salesDelivery->reference_no;
        $journal->date = $salesDelivery->date;
        $journal->description = $salesDelivery->description;
        $journal->save();

        $journal->details()->delete();

        $salesDeliveryDetails = $salesDelivery->details()
            ->with('product.category')
            ->get();

        $journalDetails = [];

        foreach ($salesDeliveryDetails as $salesDeliveryDetail) {
            $journalDetails[] = [
                'journal_id' => $journal->id,
                'coa_id' => $salesDeliveryDetail->product->category->sales_delivery_coa_id,
                'debit' => $salesDeliveryDetail->amount,
                'credit' => 0,
                'department_id' => $salesDeliveryDetail->department_id,
                'created_by' => $salesDeliveryDetail->created_by,
                'created_at' => $salesDeliveryDetail->created_at,
                'updated_at' => $salesDeliveryDetail->updated_at,
            ];

            $journalDetails[] = [
                'journal_id' => $journal->id,
                'coa_id' => $salesDeliveryDetail->product->category->inventory_coa_id,
                'debit' => 0,
                'credit' => $salesDeliveryDetail->amount,
                'department_id' => $salesDeliveryDetail->department_id,
                'created_by' => $salesDeliveryDetail->created_by,
                'created_at' => $salesDeliveryDetail->created_at,
                'updated_at' => $salesDeliveryDetail->updated_at,
            ];
        }

        JournalDetail::insert($journalDetails);
    }

    /**
     * Handle the SalesDelivery "deleted" event.
     */
    public function deleted(SalesDelivery $salesDelivery): void
    {
        $journal = Journal::query()
            ->ofReferenceNo($salesDelivery->reference_no)
            ->first();

        $journal->details()->delete();
        $journal->delete();
    }

    /**
     * Handle the SalesDelivery "restored" event.
     */
    public function restored(SalesDelivery $salesDelivery): void
    {
        //
    }

    /**
     * Handle the SalesDelivery "force deleted" event.
     */
    public function forceDeleted(SalesDelivery $salesDelivery): void
    {
        //
    }
}
