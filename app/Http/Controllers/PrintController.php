<?php

namespace App\Http\Controllers;

use App\Models\CashTransfer;
use App\Models\Expense;
use App\Models\Income;
use App\Models\Journal;
use App\Models\PayablePayment;
use App\Models\PurchaseInvoice;
use App\Models\PurchaseReceipt;
use App\Models\ReceivablePayment;
use App\Models\SalesDelivery;
use App\Models\CoaClassification;
use App\Models\Contact;
use App\Models\Department;
use App\Models\Project;
use App\Models\SalesInvoice;
use App\Models\JournalDetail;
use App\Models\Coa;
use App\Services\Report\Finance\BalanceSheetService;
use App\Services\Report\Finance\ProfitLossService;
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
                    'note' => $detail->note,
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

    public function expense($id)
    {
        $expense = Expense::query()
            ->with([
                'contact:id,name',
                'createdBy:id,name',
                'details.coa:id,code,name',
                'details.department:id,code,name',
                'details.project:id,code,name',
            ])
            ->findOrFail($id);

        $payload = [
            'id' => $expense->id,
            'reference_no' => $expense->reference_no,
            'date' => $expense->date,
            'formatted_date' => $expense->date
                ? now()->parse($expense->date)->format('d/m/Y')
                : null,
            'description' => $expense->description,
            'amount' => number_format((float) $expense->amount, 2, '.', ''),
            'contact' => $expense->contact
                ? [
                    'id' => $expense->contact->id,
                    'name' => $expense->contact->name,
                ]
                : null,
            'created_by' => $expense->createdBy
                ? [
                    'id' => $expense->createdBy->id,
                    'name' => $expense->createdBy->name,
                ]
                : null,
            'details' => $expense->details
                ->map(function ($detail) {
                    return [
                        'coa' => $detail->coa
                            ? [
                                'id' => $detail->coa->id,
                                'code' => $detail->coa->code,
                                'name' => $detail->coa->name,
                            ]
                            : null,
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
                        'amount' => number_format((float) $detail->amount, 2, '.', ''),
                        'note' => $detail->note,
                    ];
                })
                ->values(),
        ];

        return view('print.expense', compact('payload'));
    }

    public function income($id)
    {
        $income = Income::query()
            ->with([
                'contact:id,name',
                'createdBy:id,name',
                'details.coa:id,code,name',
                'details.department:id,code,name',
                'details.project:id,code,name',
            ])
            ->findOrFail($id);

        $payload = [
            'id' => $income->id,
            'reference_no' => $income->reference_no,
            'date' => $income->date,
            'formatted_date' => $income->date
                ? now()->parse($income->date)->format('d/m/Y')
                : null,
            'description' => $income->description,
            'amount' => number_format((float) $income->amount, 2, '.', ''),
            'contact' => $income->contact
                ? [
                    'id' => $income->contact->id,
                    'name' => $income->contact->name,
                ]
                : null,
            'created_by' => $income->createdBy
                ? [
                    'id' => $income->createdBy->id,
                    'name' => $income->createdBy->name,
                ]
                : null,
            'details' => $income->details
                ->map(function ($detail) {
                    return [
                        'coa' => $detail->coa
                            ? [
                                'id' => $detail->coa->id,
                                'code' => $detail->coa->code,
                                'name' => $detail->coa->name,
                            ]
                            : null,
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
                        'amount' => number_format((float) $detail->amount, 2, '.', ''),
                        'note' => $detail->note,
                    ];
                })
                ->values(),
        ];

        return view('print.income', compact('payload'));
    }

    public function cashTransfer($id)
    {
        $cashTransfer = CashTransfer::query()
            ->with([
                'fromCoa:id,code,name',
                'toCoa:id,code,name',
                'department:id,code,name',
                'project:id,code,name',
                'createdBy:id,name',
            ])
            ->findOrFail($id);

        $payload = [
            'id' => $cashTransfer->id,
            'reference_no' => $cashTransfer->reference_no,
            'date' => $cashTransfer->date,
            'formatted_date' => $cashTransfer->date
                ? Carbon::parse($cashTransfer->date)->format('d/m/Y')
                : null,
            'description' => $cashTransfer->description,
            'amount' => number_format((float) $cashTransfer->amount, 2, '.', ''),
            'department' => $cashTransfer->department
                ? [
                    'id' => $cashTransfer->department->id,
                    'code' => $cashTransfer->department->code,
                    'name' => $cashTransfer->department->name,
                ]
                : null,
            'project' => $cashTransfer->project
                ? [
                    'id' => $cashTransfer->project->id,
                    'code' => $cashTransfer->project->code,
                    'name' => $cashTransfer->project->name,
                ]
                : null,
            'from_coa' => $cashTransfer->fromCoa
                ? [
                    'id' => $cashTransfer->fromCoa->id,
                    'code' => $cashTransfer->fromCoa->code,
                    'name' => $cashTransfer->fromCoa->name,
                ]
                : null,
            'to_coa' => $cashTransfer->toCoa
                ? [
                    'id' => $cashTransfer->toCoa->id,
                    'code' => $cashTransfer->toCoa->code,
                    'name' => $cashTransfer->toCoa->name,
                ]
                : null,
            'created_by' => $cashTransfer->createdBy
                ? [
                    'id' => $cashTransfer->createdBy->id,
                    'name' => $cashTransfer->createdBy->name,
                ]
                : null,
        ];

        return view('print.cash-transfer', compact('payload'));
    }

    public function balanceSheet(Request $request, BalanceSheetService $balanceSheetService)
    {
        $dateFrom = (string) $request->input('date_from', Carbon::now()->startOfMonth()->toDateString());
        $dateTo = (string) $request->input('date_to', Carbon::now()->toDateString());

        $filters = [
            'date_from' => $dateFrom,
            'date_to' => $dateTo,
            'classification_id' => $request->filled('classification_id') ? (int) $request->input('classification_id') : null,
            'department_id' => $request->filled('department_id') ? (int) $request->input('department_id') : null,
            'project_id' => $request->filled('project_id') ? (int) $request->input('project_id') : null,
            'customer_id' => $request->filled('customer_id') ? (int) $request->input('customer_id') : null,
        ];

        $report = $balanceSheetService->get($filters);

        $formatDateLabel = function ($value) {
            if (!$value) {
                return '-';
            }
            try {
                return Carbon::parse($value)->translatedFormat('d M Y');
            } catch (\Exception $e) {
                return $value;
            }
        };

        $periodLabel = ($filters['date_from'] || $filters['date_to'])
            ? $formatDateLabel($filters['date_from']) . ' - ' . $formatDateLabel($filters['date_to'])
            : 'Semua periode';

        $departmentName = $filters['department_id']
            ? (Department::find($filters['department_id'])?->name ?? 'Semua')
            : 'Semua';

        $projectName = $filters['project_id']
            ? (Project::find($filters['project_id'])?->name ?? 'Semua')
            : 'Semua';

        $classificationName = $filters['classification_id']
            ? (CoaClassification::find($filters['classification_id'])?->name ?? 'Semua')
            : 'Semua';

        $customerName = $filters['customer_id']
            ? (Contact::find($filters['customer_id'])?->name ?? 'Semua')
            : 'Semua';

        $payload = [
            'report' => $report,
            'period' => $periodLabel,
            'department' => $departmentName,
            'project' => $projectName,
            'classification' => $classificationName,
            'customer' => $customerName,
            'created_by' => [
                'name' => $request->user()?->name ?? '-',
            ],
        ];

        return view('print.balance-sheet', compact('payload'));
    }

    public function profitLoss(Request $request, ProfitLossService $profitLossService)
    {
        $dateFrom = (string) $request->input('date_from', Carbon::now()->startOfMonth()->toDateString());
        $dateTo = (string) $request->input('date_to', Carbon::now()->toDateString());

        $filters = [
            'date_from' => $dateFrom,
            'date_to' => $dateTo,
            'classification_id' => $request->filled('classification_id') ? (int) $request->input('classification_id') : null,
            'department_id' => $request->filled('department_id') ? (int) $request->input('department_id') : null,
            'project_id' => $request->filled('project_id') ? (int) $request->input('project_id') : null,
        ];

        $report = $profitLossService->generate($filters);

        $formatDateLabel = function ($value) {
            if (!$value) {
                return '-';
            }
            try {
                return Carbon::parse($value)->translatedFormat('d M Y');
            } catch (\Exception $e) {
                return $value;
            }
        };

        $periodLabel = ($filters['date_from'] || $filters['date_to'])
            ? $formatDateLabel($filters['date_from']) . ' - ' . $formatDateLabel($filters['date_to'])
            : 'Semua periode';

        $departmentName = $filters['department_id']
            ? (Department::find($filters['department_id'])?->name ?? 'Semua')
            : 'Semua';

        $projectName = $filters['project_id']
            ? (Project::find($filters['project_id'])?->name ?? 'Semua')
            : 'Semua';

        $classificationName = $filters['classification_id']
            ? (CoaClassification::find($filters['classification_id'])?->name ?? 'Semua')
            : 'Semua';

        $payload = [
            'report' => $report,
            'period' => $periodLabel,
            'department' => $departmentName,
            'project' => $projectName,
            'classification' => $classificationName,
            'created_by' => [
                'name' => $request->user()?->name ?? '-',
            ],
        ];

        return view('print.profit-loss', compact('payload'));
    }

    public function balanceSheetComparison(Request $request, BalanceSheetService $balanceSheetService)
    {
        $month = (int) $request->input('month', Carbon::now()->month);
        $year = (int) $request->input('year', Carbon::now()->year);

        $baseFilters = [
            'classification_id' => $request->filled('classification_id') ? (int) $request->input('classification_id') : null,
            'department_id' => $request->filled('department_id') ? (int) $request->input('department_id') : null,
            'project_id' => $request->filled('project_id') ? (int) $request->input('project_id') : null,
            'customer_id' => $request->filled('customer_id') ? (int) $request->input('customer_id') : null,
        ];

        // Periode 1: Akumulasi s/d akhir bulan terpilih
        $currentMonthStart = Carbon::create($year, $month, 1)->toDateString();
        $currentMonthEnd = Carbon::create($year, $month, 1)->endOfMonth()->toDateString();
        $currentMonthFilters = array_merge($baseFilters, [
            'date_from' => $currentMonthStart,
            'date_to' => $currentMonthEnd,
        ]);

        // Periode 2: Akumulasi s/d akhir bulan sebelumnya / tahun berjalan
        $currentYearStart = Carbon::create($year, 1, 1)->toDateString();
        $currentYearEnd = Carbon::create($year, $month, 1)->endOfMonth()->toDateString();
        $currentYearFilters = array_merge($baseFilters, [
            'date_from' => $currentYearStart,
            'date_to' => $currentYearEnd,
        ]);

        // Periode 3: Akumulasi s/d 31 Desember tahun lalu
        $prevYearStart = Carbon::create($year - 1, 1, 1)->toDateString();
        $prevYearEnd = Carbon::create($year - 1, 12, 31)->toDateString();
        $prevYearFilters = array_merge($baseFilters, [
            'date_from' => $prevYearStart,
            'date_to' => $prevYearEnd,
        ]);

        $reportCurrentMonth = $balanceSheetService->get($currentMonthFilters);
        $reportCurrentYear = $balanceSheetService->get($currentYearFilters);
        $reportPrevYear = $balanceSheetService->get($prevYearFilters);

        $buildAmountMap = function ($report) use (&$buildAmountMap) {
            $map = [];
            $walk = function ($accounts) use (&$walk, &$map) {
                foreach ($accounts as $acc) {
                    $map[$acc['id']] = $acc['amount'];
                    if (!empty($acc['children']) && count($acc['children']) > 0) {
                        $walk($acc['children']);
                    }
                }
            };
            foreach ($report['classifications'] ?? [] as $cls) {
                $walk($cls['accounts'] ?? []);
            }
            return $map;
        };

        $buildClassTotalMap = function ($report) {
            $map = [];
            foreach ($report['classifications'] ?? [] as $cls) {
                $map[$cls['classification_id']] = $cls['total'];
            }
            return $map;
        };

        $prevYearMap = $buildAmountMap($reportPrevYear);
        $currentYearMap = $buildAmountMap($reportCurrentYear);

        $prevYearClassMap = $buildClassTotalMap($reportPrevYear);
        $currentYearClassMap = $buildClassTotalMap($reportCurrentYear);

        $monthNames = [
            1 => 'Januari', 2 => 'Februari', 3 => 'Maret', 4 => 'April',
            5 => 'Mei', 6 => 'Juni', 7 => 'Juli', 8 => 'Agustus',
            9 => 'September', 10 => 'Oktober', 11 => 'November', 12 => 'Desember',
        ];

        $periodLabel = ($monthNames[$month] ?? '') . ' ' . $year;

        $departmentName = $baseFilters['department_id']
            ? (Department::find($baseFilters['department_id'])?->name ?? 'Semua')
            : 'Semua';

        $projectName = $baseFilters['project_id']
            ? (Project::find($baseFilters['project_id'])?->name ?? 'Semua')
            : 'Semua';

        $classificationName = $baseFilters['classification_id']
            ? (CoaClassification::find($baseFilters['classification_id'])?->name ?? 'Semua')
            : 'Semua';

        $customerName = $baseFilters['customer_id']
            ? (Contact::find($baseFilters['customer_id'])?->name ?? 'Semua')
            : 'Semua';

        $payload = [
            'report' => $reportCurrentMonth,
            'prev_year_map' => $prevYearMap,
            'current_year_map' => $currentYearMap,
            'prev_year_class_map' => $prevYearClassMap,
            'current_year_class_map' => $currentYearClassMap,
            'period' => $periodLabel,
            'department' => $departmentName,
            'project' => $projectName,
            'classification' => $classificationName,
            'customer' => $customerName,
            'created_by' => [
                'name' => $request->user()?->name ?? '-',
            ],
        ];

        return view('print.balance-sheet-comparison', compact('payload'));
    }

    public function profitLossComparison(Request $request, ProfitLossService $profitLossService)
    {
        $month = (int) $request->input('month', Carbon::now()->month);
        $year = (int) $request->input('year', Carbon::now()->year);

        $baseFilters = [
            'classification_id' => $request->filled('classification_id') ? (int) $request->input('classification_id') : null,
            'department_id' => $request->filled('department_id') ? (int) $request->input('department_id') : null,
            'project_id' => $request->filled('project_id') ? (int) $request->input('project_id') : null,
        ];

        // Periode 1: Bulan ini
        $currentMonthStart = Carbon::create($year, $month, 1)->toDateString();
        $currentMonthEnd = Carbon::create($year, $month, 1)->endOfMonth()->toDateString();
        $currentMonthFilters = array_merge($baseFilters, [
            'date_from' => $currentMonthStart,
            'date_to' => $currentMonthEnd,
        ]);

        // Periode 2: Tahun berjalan s/d bulan terpilih
        $currentYearStart = Carbon::create($year, 1, 1)->toDateString();
        $currentYearEnd = Carbon::create($year, $month, 1)->endOfMonth()->toDateString();
        $currentYearFilters = array_merge($baseFilters, [
            'date_from' => $currentYearStart,
            'date_to' => $currentYearEnd,
        ]);

        // Periode 3: Tahun lalu penuh
        $prevYearStart = Carbon::create($year - 1, 1, 1)->toDateString();
        $prevYearEnd = Carbon::create($year - 1, 12, 31)->toDateString();
        $prevYearFilters = array_merge($baseFilters, [
            'date_from' => $prevYearStart,
            'date_to' => $prevYearEnd,
        ]);

        $reportCurrentMonth = $profitLossService->generate($currentMonthFilters);
        $reportCurrentYear = $profitLossService->generate($currentYearFilters);
        $reportPrevYear = $profitLossService->generate($prevYearFilters);

        $buildAmountMap = function ($report) use (&$buildAmountMap) {
            $map = [];
            $walk = function ($accounts) use (&$walk, &$map) {
                foreach ($accounts as $acc) {
                    $map[$acc['id']] = $acc['amount'];
                    if (!empty($acc['children']) && count($acc['children']) > 0) {
                        $walk($acc['children']);
                    }
                }
            };
            foreach ($report['classifications'] ?? [] as $cls) {
                $walk($cls['accounts'] ?? []);
            }
            return $map;
        };

        $buildClassTotalMap = function ($report) {
            $map = [];
            foreach ($report['classifications'] ?? [] as $cls) {
                $map[$cls['classification_id']] = $cls['total'];
            }
            return $map;
        };

        $prevYearMap = $buildAmountMap($reportPrevYear);
        $currentYearMap = $buildAmountMap($reportCurrentYear);

        $prevYearClassMap = $buildClassTotalMap($reportPrevYear);
        $currentYearClassMap = $buildClassTotalMap($reportCurrentYear);

        $monthNames = [
            1 => 'Januari', 2 => 'Februari', 3 => 'Maret', 4 => 'April',
            5 => 'Mei', 6 => 'Juni', 7 => 'Juli', 8 => 'Agustus',
            9 => 'September', 10 => 'Oktober', 11 => 'November', 12 => 'Desember',
        ];

        $periodLabel = ($monthNames[$month] ?? '') . ' ' . $year;

        $departmentName = $baseFilters['department_id']
            ? (Department::find($baseFilters['department_id'])?->name ?? 'Semua')
            : 'Semua';

        $projectName = $baseFilters['project_id']
            ? (Project::find($baseFilters['project_id'])?->name ?? 'Semua')
            : 'Semua';

        $classificationName = $baseFilters['classification_id']
            ? (CoaClassification::find($baseFilters['classification_id'])?->name ?? 'Semua')
            : 'Semua';

        $payload = [
            'report_current_month' => $reportCurrentMonth,
            'report_current_year' => $reportCurrentYear,
            'report_prev_year' => $reportPrevYear,
            'prev_year_map' => $prevYearMap,
            'current_year_map' => $currentYearMap,
            'prev_year_class_map' => $prevYearClassMap,
            'current_year_class_map' => $currentYearClassMap,
            'period' => $periodLabel,
            'department' => $departmentName,
            'project' => $projectName,
            'classification' => $classificationName,
            'created_by' => [
                'name' => $request->user()?->name ?? '-',
            ],
        ];

        return view('print.profit-loss-comparison', compact('payload'));
    }

    public function ledger(Request $request)
    {
        $search = (string) $request->input('search');
        $coa_id = (int) $request->input('coa_id');
        $department_id = (int) $request->input('department_id');
        $date_from = (string) $request->input('date_from', Carbon::now()->startOfMonth()->toDateString());
        $date_to = (string) $request->input('date_to', Carbon::now()->toDateString());

        $year_of_date_from = Carbon::parse($date_from)->year;

        $opening_balance = JournalDetail::query()
            ->whereHas('journal', function ($query) use ($date_from, $year_of_date_from) {
                $query->whereYear('date', '=', $year_of_date_from)
                    ->where('date', '<', $date_from);
            })
            ->when($coa_id, fn($query) => $query->where('coa_id', $coa_id))
            ->when($department_id, fn($query) => $query->where('department_id', $department_id))
            ->selectRaw('COALESCE(SUM(debit) - SUM(credit), 0) as balance')
            ->value('balance');

        $journals = JournalDetail::query()
            ->with([
                'journal:id,date,reference_no,description',
                'coa:id,code,name',
                'department:id,code,name',
                'project:id,code,name',
            ])
            ->when($coa_id, fn($query) => $query->where('coa_id', $coa_id))
            ->when($department_id, fn($query) => $query->where('department_id', $department_id))
            ->when($search, function ($query) use ($search) {
                $query->whereHas('journal', function ($journalQuery) use ($search) {
                    $journalQuery->where(function ($innerQuery) use ($search) {
                        $innerQuery->where('reference_no', 'like', '%' . $search . '%')
                            ->orWhere('description', 'like', '%' . $search . '%');
                    });
                });
            })
            ->when($date_from || $date_to, function ($query) use ($date_from, $date_to) {
                $query->whereHas('journal', function ($journalQuery) use ($date_from, $date_to) {
                    if ($date_from) {
                        $journalQuery->whereDate('date', '>=', $date_from);
                    }
                    if ($date_to) {
                        $journalQuery->whereDate('date', '<=', $date_to);
                    }
                });
            })
            ->orderBy(
                Journal::select('date')
                    ->whereColumn('journals.id', 'journal_details.journal_id')
            )
            ->orderBy('journal_details.id')
            ->get();

        $formatDateLabel = function ($value) {
            if (!$value) return '-';
            try {
                return Carbon::parse($value)->translatedFormat('d M Y');
            } catch (\Exception $e) {
                return $value;
            }
        };

        $periodLabel = ($date_from || $date_to)
            ? $formatDateLabel($date_from) . ' - ' . $formatDateLabel($date_to)
            : 'Semua periode';

        $departmentName = $department_id
            ? (Department::find($department_id)?->name ?? 'Semua')
            : 'Semua';

        $coaName = $coa_id
            ? (Coa::find($coa_id)?->name ?? 'Semua')
            : 'Semua';

        $payload = [
            'journals' => $journals,
            'opening_balance' => $opening_balance,
            'period' => $periodLabel,
            'department' => $departmentName,
            'coa' => $coaName,
            'created_by' => [
                'name' => $request->user()?->name ?? '-',
            ],
        ];

        return view('print.ledger', compact('payload'));
    }
}
