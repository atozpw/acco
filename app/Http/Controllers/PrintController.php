<?php

namespace App\Http\Controllers;

use App\Models\Journal;
use App\Models\PayablePayment;
use App\Models\PurchaseInvoice;
use App\Models\PurchaseReceipt;
use App\Models\ReceivablePayment;
use App\Models\SalesDelivery;
use App\Models\SalesInvoice;
use Carbon\Carbon;

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

    public function salesInvoice($id)
    {
        $invoice = SalesInvoice::query()
            ->with([
                'contact:id,name,address',
                'details' => function ($query) {
                    $query
                        ->with([
                            'product:id,code,name',
                            'tax:id,rate',
                        ])
                        ->orderBy('id');
                },
            ])
            ->findOrFail($id);

        $invoice->formatted_date = $invoice->date
            ? Carbon::parse($invoice->date)->format('d/m/Y')
            : null;

        $details = $invoice->details->map(function ($detail) {
            $amount = (float) $detail->amount;
            $discountAmount = (float) $detail->discount_amount;
            $discountPercent = (float) $detail->discount_percent;

            if ($discountPercent === 0.0 && $discountAmount > 0 && $amount > 0) {
                $discountPercent = round(($discountAmount / $amount) * 100, 2);
            }

            return [
                'id' => $detail->id,
                'qty' => (float) $detail->qty,
                'price' => (float) $detail->price,
                'amount' => (float) $detail->amount,
                'discount_percent' => $discountPercent,
                'discount_amount' => $discountAmount,
                'tax_amount' => (float) $detail->tax_amount,
                'total' => (float) $detail->total,
                'tax_rate' => $detail->tax ? (float) $detail->tax->rate : null,
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
            'id' => $invoice->id,
            'reference_no' => $invoice->reference_no,
            'formatted_date' => $invoice->formatted_date,
            'description' => $invoice->description,
            'contact' => $invoice->contact
                ? [
                    'id' => $invoice->contact->id,
                    'name' => $invoice->contact->name,
                    'address' => $invoice->contact->address,
                ]
                : null,
            'details' => $details,
            'amount' => (float) $invoice->amount,
            'discount_percent' => (float) $invoice->discount_percent,
            'discount_amount' => (float) $invoice->discount_amount,
            'tax_amount' => (float) $invoice->tax_amount,
            'total' => (float) $invoice->total,
        ];

        return view('print.sales-invoice', compact('payload'));

    }

    public function accountReceivablePayment($id)
    {
        $payment = ReceivablePayment::query()
            ->with([
                'contact:id,name',
                'details' => function ($query) {
                    $query
                        ->with([
                            'salesInvoice:id,reference_no,date,discount_amount',
                        ])
                        ->orderBy('id');
                },
            ])
            ->findOrFail($id);

        $payment->formatted_date = $payment->date
            ? Carbon::parse($payment->date)->format('d/m/Y')
            : null;

        $details = $payment->details
            ->map(function ($detail) {
                $invoice = $detail->salesInvoice;

                $discountAmount = (float) ($invoice->discount_amount ?? 0);
                $discountPercent = (float) ($invoice->discount_percent ?? 0);

                if ($discountAmount <= 0 && $discountPercent > 0) {
                    $baseAmount = (float) ($invoice->amount ?? 0);
                    if ($baseAmount > 0) {
                        $discountAmount = round($baseAmount * ($discountPercent / 100), 2);
                    }
                }

                return [
                    'id' => $detail->id,
                    'amount' => (float) $detail->amount,
                    'sales_invoice' => $invoice
                        ? [
                            'id' => $invoice->id,
                            'reference_no' => $invoice->reference_no,
                            'formatted_date' => $invoice->date
                                ? Carbon::parse($invoice->date)->format('d/m/Y')
                                : null,
                            'discount_amount' => $discountAmount,
                        ]
                        : null,
                ];
            })
            ->values();

        $payload = [
            'id' => $payment->id,
            'reference_no' => $payment->reference_no,
            'formatted_date' => $payment->formatted_date,
            'description' => $payment->description,
            'amount' => (float) $payment->amount,
            'contact' => $payment->contact
                ? [
                    'id' => $payment->contact->id,
                    'name' => $payment->contact->name,
                ]
                : null,
            'details' => $details,
        ];

        return view('print.account-receivable-payment', compact('payload'));
    }

    public function purchaseReceipt($id)
    {
        $receipt = PurchaseReceipt::query()
            ->with([
                'contact:id,name,address',
                'details' => function ($query) {
                    $query->orderBy('id')->with(['product:id,code,name']);
                },
            ])
            ->findOrFail($id);

        $details = $receipt->details->map(function ($detail) {
            return [
                'id' => $detail->id,
                'qty' => (float) $detail->qty,
                'note' => $detail->note ?? null,
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
            'id' => $receipt->id,
            'reference_no' => $receipt->reference_no,
            'date' => $receipt->date,
            'formatted_date' => $receipt->date
                ? Carbon::parse($receipt->date)->format('d/m/Y')
                : null,
            'contact' => $receipt->contact
                ? [
                    'id' => $receipt->contact->id,
                    'name' => $receipt->contact->name,
                    'address' => $receipt->contact->address ?? null,
                ]
                : null,
            'details' => $details,
        ];

        return view('print.purchase-receipt', compact('payload'));
    }

    public function purchaseInvoice($id)
    {
        $invoice = PurchaseInvoice::query()
            ->with([
                'contact:id,name,address',
                'details' => function ($query) {
                    $query
                        ->with([
                            'product:id,code,name',
                            'tax:id,rate',
                        ])
                        ->orderBy('id');
                },
            ])
            ->findOrFail($id);

        $invoice->formatted_date = $invoice->date
            ? Carbon::parse($invoice->date)->format('d/m/Y')
            : null;

        $details = $invoice->details->map(function ($detail) {
            $amount = (float) $detail->amount;
            $discountAmount = (float) $detail->discount_amount;
            $discountPercent = (float) $detail->discount_percent;

            if ($discountPercent === 0.0 && $discountAmount > 0 && $amount > 0) {
                $discountPercent = round(($discountAmount / $amount) * 100, 2);
            }

            return [
                'id' => $detail->id,
                'qty' => (float) $detail->qty,
                'price' => (float) $detail->price,
                'amount' => $amount,
                'discount_percent' => $discountPercent,
                'discount_amount' => $discountAmount,
                'tax_amount' => (float) $detail->tax_amount,
                'total' => (float) $detail->total,
                'tax_rate' => $detail->tax ? (float) $detail->tax->rate : null,
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
            'id' => $invoice->id,
            'reference_no' => $invoice->reference_no,
            'formatted_date' => $invoice->formatted_date,
            'description' => $invoice->description,
            'contact' => $invoice->contact
                ? [
                    'id' => $invoice->contact->id,
                    'name' => $invoice->contact->name,
                    'address' => $invoice->contact->address,
                ]
                : null,
            'details' => $details,
            'amount' => (float) $invoice->amount,
            'discount_percent' => (float) $invoice->discount_percent,
            'discount_amount' => (float) $invoice->discount_amount,
            'tax_amount' => (float) $invoice->tax_amount,
            'total' => (float) $invoice->total,
        ];

        return view('print.purchase-invoice', compact('payload'));
    }

    public function payablePayment($id)
    {
        $payment = PayablePayment::query()
            ->with([
                'contact:id,name',
                'details' => function ($query) {
                    $query
                        ->with([
                            'purchaseInvoice:id,reference_no,date,amount,discount_percent,discount_amount',
                        ])
                        ->orderBy('id');
                },
            ])
            ->findOrFail($id);

        $payment->formatted_date = $payment->date
            ? Carbon::parse($payment->date)->format('d/m/Y')
            : null;

        $details = $payment->details
            ->map(function ($detail) {
                $invoice = $detail->purchaseInvoice;

                $discountAmount = (float) ($invoice->discount_amount ?? 0);
                $discountPercent = (float) ($invoice->discount_percent ?? 0);

                if ($discountAmount <= 0 && $discountPercent > 0) {
                    $baseAmount = (float) ($invoice->amount ?? 0);
                    if ($baseAmount > 0) {
                        $discountAmount = round($baseAmount * ($discountPercent / 100), 2);
                    }
                }

                return [
                    'id' => $detail->id,
                    'amount' => (float) $detail->amount,
                    'purchase_invoice' => $invoice
                        ? [
                            'id' => $invoice->id,
                            'reference_no' => $invoice->reference_no,
                            'formatted_date' => $invoice->date
                                ? Carbon::parse($invoice->date)->format('d/m/Y')
                                : null,
                            'discount_amount' => $discountAmount,
                        ]
                        : null,
                ];
            })
            ->values();

        $payload = [
            'id' => $payment->id,
            'reference_no' => $payment->reference_no,
            'formatted_date' => $payment->formatted_date,
            'description' => $payment->description,
            'amount' => (float) $payment->amount,
            'contact' => $payment->contact
                ? [
                    'id' => $payment->contact->id,
                    'name' => $payment->contact->name,
                ]
                : null,
            'details' => $details,
        ];

        return view('print.payable-payment', compact('payload'));

    }
}
