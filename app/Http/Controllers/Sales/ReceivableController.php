<?php

namespace App\Http\Controllers\Sales;

use App\Http\Controllers\Controller;
use App\Models\SalesInvoice;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Response;

class ReceivableController extends Controller
{
    /**
     * Display the receivable list grouped by contact with optional filters.
     */
    public function index(Request $request): Response
    {
        $perPage = (int) $request->input('perPage', 25);
        $taxAmount = $request->filled('tax_amount')
            ? (string) $request->input('tax_amount')
            : null;
        $dateFrom = $this->normalizeDate($request->input('date_from'));
        $dateTo = $this->normalizeDate($request->input('date_to'));

        if ($dateFrom && $dateTo && $dateFrom > $dateTo) {
            [$dateFrom, $dateTo] = [$dateTo, $dateFrom];
        }

        $receivables = SalesInvoice::query()
            ->with('contact:id,name')
            ->withSum('receivablePaymentDetails as paid_amount', 'amount')
            ->when($dateFrom, fn($query, $dateFrom) => $query->whereDate('date', '>=', $dateFrom))
            ->when($dateTo, fn($query, $dateTo) => $query->whereDate('date', '<=', $dateTo))
            ->when($taxAmount, function ($query, $taxAmount) {
                if ($taxAmount === 'with') {
                    $query->where('tax_amount', '>', 0);
                } elseif ($taxAmount === 'without') {
                    $query->where('tax_amount', '=', 0)
                        ->orWhereNull('tax_amount');
                }
            })
            ->orderBy('date')
            ->simplePaginate($perPage)
            ->withQueryString()
            ->through(function ($row) {
                $total = (float) $row->total;
                $paid = (float) $row->paid_amount;
                $outstanding = max($total - $paid, 0);

                return [
                    'id' => $row->id,
                    'reference_no' => $row->reference_no,
                    'contact_id' => $row->contact->id,
                    'contact_name' => $row->contact->name,
                    'total' => $total,
                    'paid' => $paid,
                    'outstanding' => $outstanding,
                ];
            });

        return inertia('sales/account-receivable/index', [
            'receivables' => $receivables,
            'filters' => [
                'tax_amount' => $taxAmount,
                'date_from' => $dateFrom,
                'date_to' => $dateTo,
                'perPage' => $perPage,
            ],
        ]);
    }

    /**
     * Display the aging detail for a specific receivable (sales invoice).
     */
    public function show(string $id): Response
    {
        $invoice = SalesInvoice::query()
            ->withSum('receivablePaymentDetails as paid_amount', 'amount')
            ->findOrFail($id);

        $total = (float) $invoice->total;
        $paid = (float) ($invoice->paid_amount ?? 0);
        $outstanding = max($total - $paid, 0);

        $invoiceDate = $invoice->date ? Carbon::parse($invoice->date) : null;
        $ageInDays = $invoiceDate
            ? $invoiceDate->diffInDays(Carbon::today())
            : 0;

        $aging = [
            'lt_30' => 0.0,
            'between_30_60' => 0.0,
            'between_60_90' => 0.0,
            'gt_90' => 0.0,
        ];

        if ($outstanding > 0) {
            if ($ageInDays < 30) {
                $aging['lt_30'] = $outstanding;
            } elseif ($ageInDays < 60) {
                $aging['between_30_60'] = $outstanding;
            } elseif ($ageInDays < 90) {
                $aging['between_60_90'] = $outstanding;
            } else {
                $aging['gt_90'] = $outstanding;
            }
        }

        $payments = $invoice->receivablePaymentDetails()
            ->with('receivablePayment:id,date,reference_no')
            ->orderBy('created_at')
            ->get()
            ->map(function ($detail) use ($ageInDays, $invoiceDate) {
                $paymentDate = $detail->receivablePayment->date
                    ? Carbon::parse($detail->receivablePayment->date)
                    : null;
                $ageInDays = $paymentDate
                    ? $paymentDate->diffInDays($invoiceDate)
                    : 0;

                $aging = [
                    'lt_30' => 0.00,
                    'between_30_60' => 0.00,
                    'between_60_90' => 0.00,
                    'gt_90' => 0.00,
                ];
                if ((float) $detail->amount > 0) {
                    if ($ageInDays < 30) {
                        $aging['lt_30'] = (float) - $detail->amount;
                    } elseif ($ageInDays < 60) {
                        $aging['between_30_60'] = (float) - $detail->amount;
                    } elseif ($ageInDays < 90) {
                        $aging['between_60_90'] = (float) - $detail->amount;
                    } else {
                        $aging['gt_90'] = (float) - $detail->amount;
                    }
                }
                return [
                    'id' => $detail->id,
                    'reference_no' => $detail->receivablePayment->reference_no,
                    'date' => $detail->receivablePayment->date,
                    'formatted_date' => $paymentDate
                        ? $paymentDate->format('d/m/Y')
                        : null,
                    'aging' => $aging,
                ];
            });

        return inertia('sales/account-receivable/show', [
            'invoice' => [
                'id' => $invoice->id,
                'reference_no' => $invoice->reference_no,
                'date' => $invoice->date,
                'formatted_date' => $invoiceDate
                    ? $invoiceDate->format('d/m/Y')
                    : null,
                'aging' => $aging,
            ],
            'details' => [
                'invoice' => [
                    'id' => $invoice->id,
                    'reference_no' => $invoice->reference_no,
                    'date' => $invoice->date,
                    'formatted_date' => $invoiceDate
                        ? $invoiceDate->format('d/m/Y')
                        : null,
                    'total' => $total,
                ],
                'payments' => $payments,
            ]
        ]);
    }

    private function normalizeDate(?string $value): ?string
    {
        if (! $value) {
            return null;
        }

        try {
            return Carbon::parse($value)->format('Y-m-d');
        } catch (\Throwable $th) {
            return null;
        }
    }
}
