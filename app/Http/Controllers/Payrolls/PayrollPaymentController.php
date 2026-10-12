<?php

namespace App\Http\Controllers\Payrolls;

use App\Helpers\ReferenceNumber;
use App\Http\Controllers\Controller;
use App\Http\Requests\Payrolls\StorePayrollPaymentRequest;
use App\Models\Coa;
use App\Models\Journal;
use App\Models\Payroll;
use App\Models\PayrollPayment;
use App\Models\PayrollPeriode;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Response;

class PayrollPaymentController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $search = (string) $request->input('search');
        $perPage = (int) $request->input('perPage', 25);

        $payments = PayrollPayment::query()
            ->when($search, function ($query, $keyword) {
                $query->where(function ($q) use ($keyword) {
                    $q->where('reference_no', 'like', '%' . $keyword . '%')
                        ->orWhere('description', 'like', '%' . $keyword . '%');
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

        return inertia('payrolls/payroll-payment/index', [
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
        $referenceNumber = ReferenceNumber::getPayrollPayment();

        $periodes = PayrollPeriode::query()
            ->where('is_paid', false)
            ->with([
                'payrolls' => function ($query) {
                    $query->with([
                        'contact:id,name',
                        'department:id,code,name',
                        'project:id,code,name',
                    ])->orderBy('id');
                },
            ])
            ->orderByDesc('date')
            ->get([
                'id',
                'payroll_category_id',
                'reference_no',
                'date',
                'description',
            ]);

        $periodes->transform(function ($periode) {
            $totalAmount = $periode->payrolls->sum(fn ($p) => (float) $p->total_amount);
            $totalEarning = $periode->payrolls->sum(fn ($p) => (float) $p->earning_amount);
            $totalDeduction = $periode->payrolls->sum(fn ($p) => (float) $p->deduction_amount);

            $periode->total_amount = $totalAmount;
            $periode->total_earning = $totalEarning;
            $periode->total_deduction = $totalDeduction;
            $periode->payrolls_count = $periode->payrolls->count();

            return $periode;
        });

        $coas = Coa::query()
            ->active()
            ->where('is_cash_bank', 1)
            ->doesntHave('children')
            ->orderBy('code')
            ->get(['id', 'code', 'name']);

        $departments = Auth::user()
            ?->departments()
            ->active()
            ->orderBy('code')
            ->get(['id', 'code', 'name']) ?? collect();

        $projects = Auth::user()
            ?->projects()
            ->active()
            ->orderBy('name')
            ->get(['id', 'code', 'name']) ?? collect();

        return inertia('payrolls/payroll-payment/create', [
            'referenceNumber' => $referenceNumber,
            'periodes' => $periodes,
            'coas' => $coas,
            'departments' => $departments,
            'projects' => $projects,
            'today' => now()->format('Y-m-d'),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StorePayrollPaymentRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        DB::transaction(function () use ($validated, $request) {
            PayrollPayment::query()->create([
                'payroll_periode_id' => $validated['payroll_periode_id'],
                'coa_id' => $validated['coa_id'],
                'department_id' => $validated['department_id'],
                'project_id' => $validated['project_id'] ?? null,
                'reference_no' => $validated['reference_no'],
                'date' => $validated['date'],
                'description' => $validated['description'],
                'amount' => number_format((float) $validated['amount'], 2, '.', ''),
                'created_by' => $request->user()?->id,
            ]);

            PayrollPeriode::query()
                ->where('id', $validated['payroll_periode_id'])
                ->update(['is_paid' => true]);

            ReferenceNumber::updatePayrollPayment();
        });

        return redirect()
            ->route('payroll-payments.index')
            ->with('success', 'Pembayaran gaji berhasil disimpan.');
    }

    /**
     * Get detail of the specified payroll.
     */
    public function payroll(string $id): JsonResponse
    {
        $payroll = Payroll::query()
            ->with([
                'periode' => function ($query) {
                    $query->with(['category:id,name']);
                },
                'contact:id,name',
                'department:id,code,name',
                'project:id,code,name',
                'createdBy:id,name',
                'details' => function ($query) {
                    $query->with([
                        'component:id,code,name,type',
                    ])->orderBy('id');
                },
            ])
            ->findOrFail($id);

        return response()->json($payroll);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id): Response
    {
        $payment = PayrollPayment::query()
            ->with([
                'coa:id,code,name',
                'department:id,code,name',
                'project:id,code,name',
                'createdBy:id,name',
                'periode' => function ($query) {
                    $query->with([
                        'category:id,name',
                        'payrolls' => function ($pq) {
                            $pq->with([
                                'contact:id,name',
                                'department:id,code,name',
                                'project:id,code,name',
                            ])->orderBy('id');
                        },
                    ]);
                },
            ])
            ->findOrFail($id);

        $payment->formatted_date = $payment->date
            ? Carbon::parse($payment->date)->format('d/m/Y')
            : null;

        return inertia('payrolls/payroll-payment/show', [
            'payment' => $payment,
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id): RedirectResponse
    {
        $payment = PayrollPayment::query()->findOrFail($id);

        DB::transaction(function () use ($payment) {
            PayrollPeriode::query()
                ->where('id', $payment->payroll_periode_id)
                ->update(['is_paid' => false]);

            $payment->delete();
        });

        return redirect()
            ->route('payroll-payments.index')
            ->with('success', 'Pembayaran gaji berhasil dihapus.');
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

        return inertia('payrolls/payroll-payment/voucher', [
            'journal' => $payload,
        ]);
    }
}
