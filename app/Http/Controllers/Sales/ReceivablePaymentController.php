<?php

namespace App\Http\Controllers\Sales;

use App\Helpers\ReferenceNumber;
use App\Http\Controllers\Controller;
use App\Http\Requests\Sales\StoreReceivablePaymentRequest;
use App\Http\Requests\Sales\UpdateReceivablePaymentRequest;
use App\Models\Coa;
use App\Models\Contact;
use App\Models\Department;
use App\Models\Journal;
use App\Models\Project;
use App\Models\ReceivablePayment;
use App\Models\SalesInvoice;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Response;

class ReceivablePaymentController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $search = (string) $request->input('search');
        $perPage = (int) $request->input('perPage', 25);

        $payments = ReceivablePayment::query()
            ->with(['contact:id,name'])
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('reference_no', 'like', '%' . $search . '%')
                        ->orWhere('description', 'like', '%' . $search . '%')
                        ->orWhereHas('contact', function ($cq) use ($search) {
                            $cq->where('name', 'like', '%' . $search . '%');
                        });
                });
            })
            ->orderByDesc('date')
            ->simplePaginate($perPage)
            ->withQueryString();

        $payments->getCollection()->transform(function ($payment) {
            $payment->formatted_date = $payment->date
                ? \Carbon\Carbon::parse($payment->date)->format('d/m/Y')
                : null;

            return $payment;
        });

        return inertia('sales/receivable-payment/index', [
            'payments' => $payments,
            'filters' => [
                'search' => $search,
                'perPage' => $perPage,
            ],
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        $referenceNumber = ReferenceNumber::getReceivablePayment();

        $contacts = Contact::query()
            ->active()
            ->where('is_customer', 1)
            ->orderBy('name')
            ->get(['id', 'name']);

        $coas = Coa::query()
            ->active()
            ->where('is_cash_bank', 1)
            ->doesntHave('children')
            ->orderBy('code')
            ->get(['id', 'code', 'name']);

        $departments = Department::query()
            ->active()
            ->orderBy('code')
            ->get(['id', 'code', 'name']);

        $projects = Project::query()
            ->active()
            ->orderBy('name')
            ->get(['id', 'code', 'name']);

        $invoices = SalesInvoice::query()
            ->with(['contact:id,name'])
            ->withSum('receivablePaymentDetails as paid_amount', 'amount')
            ->orderByDesc('date')
            ->get(['id', 'contact_id', 'reference_no', 'date', 'description', 'total']);

        $invoices = $invoices
            ->filter(function ($invoice) {
                $total = (float) $invoice->total;
                $paid = (float) ($invoice->paid_amount ?? 0);

                return $total > $paid;
            })
            ->values();

        $invoices->transform(function ($invoice) {
            $total = (float) $invoice->total;
            $paid = (float) ($invoice->paid_amount ?? 0);
            $outstanding = max($total - $paid, 0);

            $invoice->total = number_format($total, 2, '.', '');
            $invoice->paid_amount = number_format($paid, 2, '.', '');
            $invoice->outstanding_amount = number_format($outstanding, 2, '.', '');

            return $invoice;
        });

        return inertia('sales/receivable-payment/create', [
            'referenceNumber' => $referenceNumber,
            'contacts' => $contacts,
            'coas' => $coas,
            'departments' => $departments,
            'projects' => $projects,
            'invoices' => $invoices,
            'today' => now()->format('Y-m-d'),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreReceivablePaymentRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        DB::transaction(function () use ($validated, $request) {
            $detailTotal = array_reduce(
                $validated['details'],
                fn($carry, $detail) => $carry + (float) $detail['amount'],
                0.0,
            );

            $payment = ReceivablePayment::query()->create([
                'contact_id' => $validated['contact_id'],
                'coa_id' => $validated['coa_id'],
                'reference_no' => $validated['reference_no'],
                'date' => $validated['date'],
                'description' => $validated['description'],
                'amount' => number_format($detailTotal, 2, '.', ''),
                'created_by' => $request->user()?->id,
            ]);

            foreach ($validated['details'] as $detail) {
                $payment->details()->create([
                    'sales_invoice_id' => $detail['sales_invoice_id'],
                    'amount' => number_format((float) $detail['amount'], 2, '.', ''),
                    'note' => $detail['note'] ?? null,
                    'department_id' => $detail['department_id'],
                    'project_id' => $detail['project_id'] ?? null,
                    'created_by' => $request->user()?->id,
                ]);
            }

            ReferenceNumber::updateReceivablePayment();
        });

        return redirect()
            ->route('receivable-payment.index')
            ->with('success', 'Pembayaran piutang berhasil disimpan.');
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id): Response
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

        return inertia('sales/receivable-payment/show', [
            'payment' => [
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
            ],
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id): Response
    {
        $payment = ReceivablePayment::query()
            ->with(['details' => function ($query) {
                $query
                    ->select([
                        'id',
                        'receivable_payment_id',
                        'sales_invoice_id',
                        'amount',
                        'note',
                        'department_id',
                        'project_id',
                    ])
                    ->orderBy('id');
            }])
            ->findOrFail($id);

        $contacts = Contact::query()
            ->active()
            ->where('is_customer', 1)
            ->orderBy('name')
            ->get(['id', 'name']);

        $coas = Coa::query()
            ->active()
            ->where('is_cash_bank', 1)
            ->doesntHave('children')
            ->orderBy('code')
            ->get(['id', 'code', 'name']);

        $departments = Department::query()
            ->active()
            ->orderBy('code')
            ->get(['id', 'code', 'name']);

        $projects = Project::query()
            ->active()
            ->orderBy('name')
            ->get(['id', 'code', 'name']);

        $currentAllocations = $payment->details
            ->groupBy('sales_invoice_id')
            ->map(fn($details) => (float) $details->sum('amount'));

        $invoices = SalesInvoice::query()
            ->with(['contact:id,name'])
            ->withSum('receivablePaymentDetails as paid_amount', 'amount')
            ->orderByDesc('date')
            ->get(['id', 'contact_id', 'reference_no', 'date', 'description', 'total']);

        $invoices = $invoices
            ->filter(function ($invoice) use ($currentAllocations) {
                $total = (float) $invoice->total;
                $paid = (float) ($invoice->paid_amount ?? 0);
                $current = (float) $currentAllocations->get($invoice->id, 0);
                $paidExcludingCurrent = max($paid - $current, 0);

                return $total > $paidExcludingCurrent || $current > 0;
            })
            ->values();

        $invoices->transform(function ($invoice) use ($currentAllocations) {
            $total = (float) $invoice->total;
            $paid = (float) ($invoice->paid_amount ?? 0);
            $current = (float) $currentAllocations->get($invoice->id, 0);
            $paidExcludingCurrent = max($paid - $current, 0);
            $outstanding = max($total - $paidExcludingCurrent, 0);

            $invoice->total = number_format($total, 2, '.', '');
            $invoice->paid_amount = number_format($paidExcludingCurrent, 2, '.', '');
            $invoice->outstanding_amount = number_format($outstanding, 2, '.', '');

            return $invoice;
        });

        $paymentPayload = [
            'id' => $payment->id,
            'contact_id' => $payment->contact_id,
            'coa_id' => $payment->coa_id,
            'reference_no' => $payment->reference_no,
            'date' => $payment->date,
            'description' => $payment->description,
            'amount' => number_format((float) $payment->amount, 2, '.', ''),
            'details' => $payment->details
                ->map(fn($detail) => [
                    'id' => $detail->id,
                    'sales_invoice_id' => $detail->sales_invoice_id,
                    'amount' => number_format((float) $detail->amount, 2, '.', ''),
                    'note' => $detail->note,
                    'department_id' => $detail->department_id,
                    'project_id' => $detail->project_id,
                ])
                ->values(),
        ];

        return inertia('sales/receivable-payment/edit', [
            'payment' => $paymentPayload,
            'contacts' => $contacts,
            'coas' => $coas,
            'departments' => $departments,
            'projects' => $projects,
            'invoices' => $invoices,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateReceivablePaymentRequest $request, string $id): RedirectResponse
    {
        $payment = ReceivablePayment::query()->findOrFail($id);
        $validated = $request->validated();

        DB::transaction(function () use ($payment, $validated, $request) {
            $detailTotal = array_reduce(
                $validated['details'],
                fn($carry, $detail) => $carry + (float) $detail['amount'],
                0.0,
            );

            $payment->update([
                'contact_id' => $validated['contact_id'],
                'coa_id' => $validated['coa_id'],
                'reference_no' => $validated['reference_no'],
                'date' => $validated['date'],
                'description' => $validated['description'],
                'amount' => number_format($detailTotal, 2, '.', ''),
            ]);

            $payment->details()->delete();

            $detailPayloads = array_map(function ($detail) use ($request) {
                return [
                    'sales_invoice_id' => $detail['sales_invoice_id'],
                    'amount' => number_format((float) $detail['amount'], 2, '.', ''),
                    'note' => $detail['note'] ?? null,
                    'department_id' => $detail['department_id'],
                    'project_id' => $detail['project_id'] ?? null,
                    'created_by' => $request->user()?->id,
                ];
            }, $validated['details']);

            $payment->details()->createMany($detailPayloads);
        });

        return redirect()
            ->route('receivable-payment.index')
            ->with('success', 'Pembayaran piutang berhasil diperbarui.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id): RedirectResponse
    {
        $payment = ReceivablePayment::query()->findOrFail($id);

        $payment->details()->delete();
        $payment->delete();

        return redirect()
            ->route('receivable-payment.index')
            ->with('success', 'Pembayaran piutang berhasil dihapus.');
    }

    /**
     * Generate journal voucher for the specified resource.
     */
    public function voucher(string $nomor): Response
    {
        $journal = Journal::query()
            ->with([
                'details.coa:id,code,name',
                'details.department:id,code,name',
                'details.project:id,code,name',
                'createdBy:id,name',
            ])
            ->where('reference_no', $nomor)
            ->firstOrFail();

        $payload = [
            'id' => $journal->id,
            'reference_no' => $journal->reference_no,
            'date' => $journal->date,
            'formatted_date' => $journal->date
                ? \Carbon\Carbon::parse($journal->date)->format('d/m/Y')
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

        return inertia('sales/receivable-payment/voucher', [
            'journal' => $payload,
        ]);
    }
}
