<?php

namespace App\Http\Controllers;

use App\Models\Journal;
use App\Models\SalesDelivery;
use Carbon\Carbon;
use Illuminate\Http\Request;

class PrintController extends Controller
{
    public function voucher($id)
    {
        $journal = Journal::query()
            ->with([
                'details.coa:id,code,name',
                'details.department:id,code,name',
                'details.project:id,code,name',
                'createdBy:id,name',
            ])
            ->findOrFail($id);

        $payload = [
            'id' => $journal->id,
            'reference_no' => $journal->reference_no,
            'date' => $journal->date,
            'formatted_date' => $journal->date
                ? Carbon::parse($journal->date)->format('d/m/Y')
                : null,
            'description' => $journal->description,
            'details' => $journal->details->map(function ($detail) {
                return [
                    'id' => $detail->id,
                    'coa' => $detail->coa
                        ? [
                            'id' => $detail->coa->id,
                            'code' => $detail->coa->code,
                            'name' => $detail->coa->name,
                        ]
                        : null,
                    'debit' => number_format((float) $detail->debit, 2, '.', ''),
                    'credit' => number_format((float) $detail->credit, 2, '.', ''),
                    'department' => $detail->department
                        ? [
                            'id' => $detail->department->id,
                            'code' => $detail->department->code,
                            'name' => $detail->department->name,
                        ]
                        : null,
                    'project' => $detail->project
                        ? [
                            'id' => $detail->project->id,
                            'code' => $detail->project->code,
                            'name' => $detail->project->name,
                        ]
                        : null,
                ];
            }),
            'created_by' => $journal->createdBy
                ? [
                    'id' => $journal->createdBy->id,
                    'name' => $journal->createdBy->name,
                ]
                : null,
        ];

        return view('print.voucher', compact('payload'));
    }

    public function salesDelivery($id)
    {
        $delivery = SalesDelivery::query()
            ->with([
                'contact:id,name,address',
                'details' => function ($query) {
                    $query->orderBy('id')->with(['product:id,code,name']);
                },
            ])
            ->findOrFail($id);

        $details = $delivery->details->map(function ($detail) {
            return [
                'id' => $detail->id,
                'qty' => (float) $detail->qty,
                'note' => $detail->note,
                'product' => $detail->product
                    ? [
                        'id' => $detail->product->id,
                        'code' => $detail->product->code,
                        'name' => $detail->product->name,
                    ]
                    : null,
            ];
        });

        $payload = [
            'id' => $delivery->id,
            'reference_no' => $delivery->reference_no,
            'date' => $delivery->date,
            'formatted_date' => $delivery->date
                ? Carbon::parse($delivery->date)->format('d/m/Y')
                : null,
            'contact' => $delivery->contact
                ? [
                    'id' => $delivery->contact->id,
                    'name' => $delivery->contact->name,
                    'address' => $delivery->contact->address ?? null,
                ]
                : null,
            'details' => $details,
        ];

        return view('print.sales-delivery', compact('payload'));
    }
}
