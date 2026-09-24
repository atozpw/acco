<?php

namespace App\Http\Controllers\Payrolls;

use App\Helpers\ReferenceNumber;
use App\Http\Controllers\Controller;
use App\Http\Requests\Payrolls\StorePayrollPeriodRequest;
use App\Models\Payroll;
use App\Models\PayrollCategory;
use App\Models\PayrollFormula;
use App\Models\PayrollPeriode;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Response;

class PayrollPeriodController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $search = (string) $request->input('search');
        $perPage = (int) $request->input('perPage', 25);

        $periods = PayrollPeriode::query()
            ->withSum('payrolls', 'total_amount')
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('reference_no', 'like', '%' . $search . '%')
                        ->orWhere('description', 'like', '%' . $search . '%');
                });
            })
            ->orderByDesc('created_at')
            ->simplePaginate($perPage)
            ->withQueryString();

        $periods->getCollection()->transform(function ($period) {
            $period->formatted_date = $period->date
                ? Carbon::parse($period->date)->format('d/m/Y')
                : null;
            $period->total_amount = $period->payrolls_sum_total_amount ?? 0;

            return $period;
        });

        $payrollCategories = PayrollCategory::query()
            ->active()
            ->orderBy('name')
            ->get(['id', 'code', 'name']);

        return inertia('payrolls/payroll-periods/index', [
            'periods' => $periods,
            'filters' => [
                'search' => $search,
                'perPage' => $perPage,
            ],
            'payrollCategories' => $payrollCategories,
            'referenceNo' => ReferenceNumber::getPayrollPeriod(),
            'today' => now()->format('Y-m-d'),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StorePayrollPeriodRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        $formulas = PayrollFormula::query()
            ->where('payroll_category_id', $validated['payroll_category_id'])
            ->with(['details.component'])
            ->get();

        if ($formulas->isEmpty()) {
            throw ValidationException::withMessages([
                'payroll_category_id' => 'Tidak ditemukan formula/perhitungan aktif untuk kategori gaji yang dipilih.',
            ]);
        }

        DB::transaction(function () use ($validated, $formulas, $request) {
            $period = PayrollPeriode::create([
                'payroll_category_id' => $validated['payroll_category_id'],
                'reference_no' => $validated['reference_no'],
                'date' => $validated['date'],
                'start_date' => $validated['start_date'] ?? null,
                'end_date' => $validated['end_date'] ?? null,
                'description' => $validated['description'],
                'created_by' => $request->user()?->id,
            ]);

            foreach ($formulas as $formula) {
                $payroll = $period->payrolls()->create([
                    'contact_id' => $formula->contact_id,
                    'department_id' => $formula->department_id,
                    'project_id' => $formula->project_id,
                    'earning_amount' => $formula->earning_amount ?? 0,
                    'deduction_amount' => $formula->deduction_amount ?? 0,
                    'total_amount' => $formula->total_amount ?? 0,
                    'created_by' => $request->user()?->id,
                ]);

                foreach ($formula->details as $detail) {
                    $payroll->details()->create([
                        'payroll_component_id' => $detail->payroll_component_id,
                        'payable_coa_id' => $detail->component?->payable_coa_id,
                        'expense_coa_id' => $detail->component?->expense_coa_id,
                        'amount' => $detail->amount ?? 0,
                        'created_by' => $request->user()?->id,
                    ]);
                }
            }

            ReferenceNumber::updatePayrollPeriod();
        });

        return redirect()
            ->route('payroll-periods.index')
            ->with('success', 'Periode penggajian berhasil dibuat.');
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id): Response
    {
        $period = PayrollPeriode::query()
            ->with([
                'category:id,name',
                'createdBy:id,name',
                'payrolls' => function ($query) {
                    $query->with([
                        'contact:id,name',
                        'department:id,name',
                        'project:id,name',
                    ])->orderBy('id');
                },
            ])
            ->findOrFail($id);

        $period->formatted_date = $period->date
            ? Carbon::parse($period->date)->format('d/m/Y')
            : null;
        $period->formatted_start_date = $period->start_date
            ? Carbon::parse($period->start_date)->format('d/m/Y')
            : null;
        $period->formatted_end_date = $period->end_date
            ? Carbon::parse($period->end_date)->format('d/m/Y')
            : null;

        return inertia('payrolls/payroll-periods/show', [
            'period' => $period,
        ]);
    }

    /**
     * Display the specified payroll detail.
     */
    public function payroll(string $period, string $payroll): Response
    {
        $payrollModel = Payroll::query()
            ->with([
                'periode' => function ($query) {
                    $query->with(['category:id,name']);
                },
                'contact:id,name',
                'department:id,name',
                'project:id,name',
                'createdBy:id,name',
                'details' => function ($query) {
                    $query->with([
                        'component:id,code,name,type',
                    ])->orderBy('id');
                },
            ])
            ->where('payroll_periode_id', $period)
            ->findOrFail($payroll);

        if ($payrollModel->periode) {
            $payrollModel->periode->formatted_date = $payrollModel->periode->date
                ? Carbon::parse($payrollModel->periode->date)->format('d/m/Y')
                : null;
            $payrollModel->periode->formatted_start_date = $payrollModel->periode->start_date
                ? Carbon::parse($payrollModel->periode->start_date)->format('d/m/Y')
                : null;
            $payrollModel->periode->formatted_end_date = $payrollModel->periode->end_date
                ? Carbon::parse($payrollModel->periode->end_date)->format('d/m/Y')
                : null;
        }

        return inertia('payrolls/payroll-periods/payroll', [
            'payroll' => $payrollModel,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id): RedirectResponse
    {
        $period = PayrollPeriode::query()->findOrFail($id);

        DB::transaction(function () use ($period) {
            foreach ($period->payrolls as $payroll) {
                $payroll->details()->delete();
                $payroll->delete();
            }
            $period->delete();
        });

        return redirect()
            ->route('payroll-periods.index')
            ->with('success', 'Periode penggajian berhasil dihapus.');
    }
}
