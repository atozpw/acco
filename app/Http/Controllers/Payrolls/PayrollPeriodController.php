<?php

namespace App\Http\Controllers\Payrolls;

use App\Helpers\ReferenceNumber;
use App\Http\Controllers\Controller;
use App\Http\Requests\Payrolls\StorePayrollPeriodRequest;
use App\Models\PayrollFormula;
use App\Models\PayrollPeriode;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class PayrollPeriodController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
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
    public function show(string $id)
    {
        //
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
    public function destroy(string $id)
    {
        //
    }
}
