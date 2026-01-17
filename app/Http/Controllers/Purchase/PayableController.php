<?php

namespace App\Http\Controllers\Purchase;

use App\Http\Controllers\Controller;
use App\Models\Contact;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Response;

class PayableController extends Controller
{
    /**
     * Display the payable list grouped by contact with optional filters.
     */
    public function index(Request $request): Response
    {
        $search = (string) $request->input('search');
        $perPage = (int) $request->input('perPage', 25);
        $taxAmount = $request->filled('tax_amount')
            ? (string) $request->input('tax_amount')
            : null;
        $dateFrom = $this->normalizeDate($request->input('date_from'));
        $dateTo = $this->normalizeDate($request->input('date_to'));

        if ($dateFrom && $dateTo && $dateFrom > $dateTo) {
            [$dateFrom, $dateTo] = [$dateTo, $dateFrom];
        }

        $applyInvoiceFilters = function ($query) use ($dateFrom, $dateTo, $taxAmount) {
            $query->when($dateFrom, fn($query, $dateFrom) => $query->whereDate('date', '>=', $dateFrom))
                ->when($dateTo, fn($query, $dateTo) => $query->whereDate('date', '<=', $dateTo))
                ->when($taxAmount, function ($query, $taxAmount) {
                    if ($taxAmount === 'with') {
                        $query->where('tax_amount', '>', 0);
                    } elseif ($taxAmount === 'without') {
                        $query->where(function ($subQuery) {
                            $subQuery->where('tax_amount', '=', 0)
                                ->orWhereNull('tax_amount');
                        });
                    }
                });
        };

        $payables = Contact::query()
            ->whereHas('purchasesInvoices', function ($query) use ($applyInvoiceFilters) {
                $applyInvoiceFilters($query);
            })
            ->with(['purchasesInvoices' => function ($query) use ($applyInvoiceFilters) {
                $applyInvoiceFilters($query);
                $query->withSum('payablePaymentDetails as paid_amount', 'amount');
            }])
            ->when($search, fn($query, $search) => $query->where('name', 'like', "%{$search}%"))
            ->orderBy('name')
            ->simplePaginate($perPage)
            ->withQueryString()
            ->through(function ($row) {
                $invoices = $row->purchasesInvoices
                    ->map(function ($invoice) {
                        $total = (float) $invoice->total;
                        $paid = (float) ($invoice->paid_amount ?? 0);
                        $outstanding = max($total - $paid, 0);

                        return [
                            'id' => $invoice->id,
                            'total' => $total,
                            'paid' => $paid,
                            'outstanding' => $outstanding,
                        ];
                    });

                return [
                    'id' => $row->id,
                    'contact_name' => $row->name,
                    'total' => $invoices->sum('total'),
                    'paid' => $invoices->sum('paid'),
                    'outstanding' => $invoices->sum('outstanding'),
                ];
            });

        return inertia('purchases/account-payable/index', [
            'payables' => $payables,
            'filters' => [
                'search' => $search,
                'tax_amount' => $taxAmount,
                'date_from' => $dateFrom,
                'date_to' => $dateTo,
                'perPage' => $perPage,
            ],
        ]);
    }

    /**
     * Display the aging detail for a specific payable (purchase invoice).
     */
    public function show(Request $request, string $id): Response
    {
        $contact = Contact::query()
            ->where('id', $id)
            ->whereHas('purchasesInvoices')
            ->firstOrFail();

        $search = (string) $request->input('search');
        $perPage = (int) $request->input('perPage', 25);
        $taxAmount = $request->filled('tax_amount')
            ? (string) $request->input('tax_amount')
            : null;
        $dateFrom = $this->normalizeDate($request->input('date_from'));
        $dateTo = $this->normalizeDate($request->input('date_to'));
        $invoiceId = $request->filled('invoiceIdForDetail')
            ? (int) $request->input('invoiceIdForDetail')
            : null;

        if ($dateFrom && $dateTo && $dateFrom > $dateTo) {
            [$dateFrom, $dateTo] = [$dateTo, $dateFrom];
        }

        $applyInvoiceFilters = function ($query) use ($dateFrom, $dateTo, $taxAmount) {
            $query->when($dateFrom, fn($query, $dateFrom) => $query->whereDate('date', '>=', $dateFrom))
                ->when($dateTo, fn($query, $dateTo) => $query->whereDate('date', '<=', $dateTo))
                ->when($taxAmount, function ($query, $taxAmount) {
                    if ($taxAmount === 'with') {
                        $query->where('tax_amount', '>', 0);
                    } elseif ($taxAmount === 'without') {
                        $query->where(function ($subQuery) {
                            $subQuery->where('tax_amount', '=', 0)
                                ->orWhereNull('tax_amount');
                        });
                    }
                });
        };

        $invoicesQuery = $contact->purchasesInvoices()
            ->with([
                'payablePaymentDetails.payablePayment',
            ])
            ->withSum('payablePaymentDetails as paid_amount', 'amount');

        $applyInvoiceFilters($invoicesQuery);

        $invoices = $invoicesQuery
            ->when($search, fn($query, $search) => $query->where('reference_no', 'like', "%{$search}%"))
            ->when($invoiceId, function ($query, $invoiceId) {
                $query->where('id', $invoiceId);
            })
            ->orderBy('date')
            ->simplePaginate($perPage)
            ->withQueryString()
            ->through(function ($invoice) use ($invoiceId) {
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

                $details = null;

                if ($invoiceId && (int) $invoice->id === $invoiceId) {
                    $payments = $invoice->payablePaymentDetails
                        ->sortBy(function ($detail) {
                            return $detail->payablePayment?->date ?? $detail->created_at;
                        })
                        ->map(function ($detail) use ($invoiceDate) {
                            $payment = $detail->payablePayment;
                            $paymentDate = $payment && $payment->date
                                ? Carbon::parse($payment->date)
                                : null;

                            $amount = (float) $detail->amount;
                            $ageInDays = ($invoiceDate && $paymentDate)
                                ? max($invoiceDate->diffInDays($paymentDate), 0)
                                : 0;

                            $paymentAging = [
                                'lt_30' => 0.0,
                                'between_30_60' => 0.0,
                                'between_60_90' => 0.0,
                                'gt_90' => 0.0,
                            ];

                            if ($amount > 0) {
                                if ($ageInDays < 30) {
                                    $paymentAging['lt_30'] = -$amount;
                                } elseif ($ageInDays < 60) {
                                    $paymentAging['between_30_60'] = -$amount;
                                } elseif ($ageInDays < 90) {
                                    $paymentAging['between_60_90'] = -$amount;
                                } else {
                                    $paymentAging['gt_90'] = -$amount;
                                }
                            }

                            return [
                                'id' => $payment?->id ?? $detail->id,
                                'reference_no' => $payment?->reference_no,
                                'date' => $paymentDate?->toDateString(),
                                'formatted_date' => $paymentDate
                                    ? $paymentDate->format('d/m/Y')
                                    : null,
                                'aging' => $paymentAging,
                            ];
                        })
                        ->values()
                        ->all();

                    $details = [
                        'invoice' => [
                            'id' => $invoice->id,
                            'reference_no' => $invoice->reference_no,
                            'date' => $invoice->date,
                            'formatted_date' => $invoiceDate
                                ? $invoiceDate->format('d/m/Y')
                                : null,
                            'aging' => [
                                'lt_30' => $total,
                                'between_30_60' => 0.0,
                                'between_60_90' => 0.0,
                                'gt_90' => 0.0,
                            ],
                        ],
                        'payments' => $payments,
                    ];
                }

                return [
                    'id' => $invoice->id,
                    'reference_no' => $invoice->reference_no,
                    'date' => $invoice->date,
                    'formatted_date' => $invoiceDate
                        ? $invoiceDate->format('d/m/Y')
                        : null,
                    'aging' => $aging,
                    'details' => $details,
                ];
            });

        return inertia('purchases/account-payable/show', [
            'contact_id' => $contact->id,
            'invoice' => $invoices,
            'filters' => [
                'search' => $search,
                'tax_amount' => $taxAmount,
                'date_from' => $dateFrom,
                'date_to' => $dateTo,
                'perPage' => $perPage,
                'invoiceIdForDetail' => $invoiceId,
            ],
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
