<?php

namespace App\Http\Controllers\Purchase;

use App\Helpers\ReferenceNumber;
use App\Http\Controllers\Controller;
use App\Http\Requests\Purchase\StorePayablePaymentRequest;
use App\Http\Requests\Purchase\UpdatePayablePaymentRequest;
use App\Models\Coa;
use App\Models\Contact;
use App\Models\Department;
use App\Models\PayablePayment;
use App\Models\Project;
use App\Models\PurchaseInvoice;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Response;

class PayablePaymentController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $search = (string) $request->input('search');
        $perPage = (int) $request->input('perPage', 25);

        $payments = PayablePayment::query()
            ->with(['contact:id,name'])
            ->when($search, function ($query, $keyword) {
                $query->where(function ($q) use ($keyword) {
                    $q->where('reference_no', 'like', '%' . $keyword . '%')
                        ->orWhere('description', 'like', '%' . $keyword . '%')
                        ->orWhereHas('contact', function ($contactQuery) use ($keyword) {
                            $contactQuery->where('name', 'like', '%' . $keyword . '%');
                        });
                });
            })
            ->orderByDesc('date')
            ->simplePaginate($perPage)
            ->withQueryString();

        $payments->getCollection()->transform(function ($payment) {
            $payment->formatted_date = $payment->date
                ? Carbon::parse($payment->date)->format('d/m/Y')
                : null;

            return $payment;
        });

        return inertia('purchases/payable-payment/index', [
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
        $referenceNumber = ReferenceNumber::getPayablePayment();

        $contacts = Contact::query()
            ->active()
            ->where('is_vendor', 1)
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

        $invoices = PurchaseInvoice::query()
            ->with(['contact:id,name'])
            ->withSum('payablePaymentDetails as paid_amount', 'amount')
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

        return inertia('purchases/payable-payment/create', [
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
    public function store(StorePayablePaymentRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        DB::transaction(function () use ($validated, $request) {
            $detailTotal = array_reduce(
                $validated['details'],
                fn($carry, $detail) => $carry + (float) $detail['amount'],
                0.0,
            );

            $payment = PayablePayment::query()->create([
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
                    'purchase_invoice_id' => $detail['purchase_invoice_id'],
                    'amount' => number_format((float) $detail['amount'], 2, '.', ''),
                    'note' => $detail['note'] ?? null,
                    'department_id' => $detail['department_id'],
                    'project_id' => $detail['project_id'] ?? null,
                    'created_by' => $request->user()?->id,
                ]);
            }

            ReferenceNumber::updatePayablePayment();
        });

        return redirect()
            ->route('payable-payment.index')
            ->with('success', 'Pembayaran utang berhasil disimpan.');
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id): Response
    {
        $payment = PayablePayment::query()
            ->with(['details' => function ($query) {
                $query
                    ->select([
                        'id',
                        'payable_payment_id',
                        'purchase_invoice_id',
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
            ->where('is_vendor', 1)
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
            ->groupBy('purchase_invoice_id')
            ->map(fn($details) => (float) $details->sum('amount'));

        $invoices = PurchaseInvoice::query()
            ->with(['contact:id,name'])
            ->withSum('payablePaymentDetails as paid_amount', 'amount')
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
                    'purchase_invoice_id' => $detail->purchase_invoice_id,
                    'amount' => number_format((float) $detail->amount, 2, '.', ''),
                    'note' => $detail->note,
                    'department_id' => $detail->department_id,
                    'project_id' => $detail->project_id,
                ])
                ->values(),
        ];

        return inertia('purchases/payable-payment/edit', [
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
    public function update(UpdatePayablePaymentRequest $request, string $id): RedirectResponse
    {
        $payment = PayablePayment::query()->findOrFail($id);
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
                    'purchase_invoice_id' => $detail['purchase_invoice_id'],
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
            ->route('payable-payment.index')
            ->with('success', 'Pembayaran utang berhasil diperbarui.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id): RedirectResponse
    {
        $payment = PayablePayment::query()->findOrFail($id);

        $payment->details()->delete();
        $payment->delete();

        return redirect()
            ->route('payable-payment.index')
            ->with('success', 'Pembayaran utang berhasil dihapus.');
    }
}
