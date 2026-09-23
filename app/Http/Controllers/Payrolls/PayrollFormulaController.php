<?php

namespace App\Http\Controllers\Payrolls;

use App\Http\Controllers\Controller;
use App\Http\Requests\Payrolls\StorePayrollFormulaRequest;
use App\Http\Requests\Payrolls\UpdatePayrollFormulaRequest;
use App\Models\Contact;
use App\Models\Department;
use App\Models\PayrollCategory;
use App\Models\PayrollComponent;
use App\Models\PayrollFormula;
use App\Models\Project;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Response;

class PayrollFormulaController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $search = (string) $request->input('search');
        $perPage = (int) $request->input('perPage', 25);
        $payrollCategoryId = $request->input('payroll_category_id');
        $departmentId = $request->input('department_id');
        $projectId = $request->input('project_id');

        $formulas = PayrollFormula::query()
            ->with([
                'category:id,code,name',
                'contact:id,name',
                'department:id,code,name',
                'project:id,code,name',
            ])
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->whereHas('contact', function ($cq) use ($search) {
                        $cq->where('name', 'like', '%' . $search . '%');
                    })->orWhereHas('category', function ($cq) use ($search) {
                        $cq->where('name', 'like', '%' . $search . '%')
                            ->orWhere('code', 'like', '%' . $search . '%');
                    });
                });
            })
            ->when($payrollCategoryId, function ($query, $categoryId) {
                $query->where('payroll_category_id', $categoryId);
            })
            ->when($departmentId, function ($query, $departmentId) {
                $query->where('department_id', $departmentId);
            })
            ->when($projectId, function ($query, $projectId) {
                $query->where('project_id', $projectId);
            })
            ->orderByDesc('created_at')
            ->simplePaginate($perPage)
            ->withQueryString();

        $payrollCategories = PayrollCategory::query()
            ->active()
            ->orderBy('name')
            ->get(['id', 'code', 'name']);

        $departments = Auth::user()
            ?->departments()
            ->active()
            ->orderBy('code')
            ->get(['id', 'code', 'name']) ?? Department::query()->active()->orderBy('code')->get(['id', 'code', 'name']);

        $projects = Auth::user()
            ?->projects()
            ->active()
            ->orderBy('name')
            ->get(['id', 'code', 'name']) ?? Project::query()->active()->orderBy('name')->get(['id', 'code', 'name']);

        return inertia('payrolls/payroll-formulas/index', [
            'formulas' => $formulas,
            'payrollCategories' => $payrollCategories,
            'departments' => $departments,
            'projects' => $projects,
            'filters' => [
                'search' => $search,
                'perPage' => $perPage,
                'payroll_category_id' => $payrollCategoryId ? (int) $payrollCategoryId : null,
                'department_id' => $departmentId ? (int) $departmentId : null,
                'project_id' => $projectId ? (int) $projectId : null,
            ],
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        $payrollCategories = PayrollCategory::query()
            ->active()
            ->orderBy('name')
            ->get(['id', 'code', 'name']);

        $contacts = Contact::query()
            ->active()
            ->where('is_employee', 1)
            ->orderBy('name')
            ->get(['id', 'name']);

        $departments = Auth::user()
            ?->departments()
            ->active()
            ->orderBy('code')
            ->get(['id', 'code', 'name']) ?? Department::query()->active()->orderBy('code')->get(['id', 'code', 'name']);

        $projects = Auth::user()
            ?->projects()
            ->active()
            ->orderBy('name')
            ->get(['id', 'code', 'name']) ?? Project::query()->active()->orderBy('name')->get(['id', 'code', 'name']);

        $payrollComponents = PayrollComponent::query()
            ->active()
            ->orderBy('name')
            ->get(['id', 'code', 'name', 'type']);

        return inertia('payrolls/payroll-formulas/create', [
            'payrollCategories' => $payrollCategories,
            'contacts' => $contacts,
            'departments' => $departments,
            'projects' => $projects,
            'payrollComponents' => $payrollComponents,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StorePayrollFormulaRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        DB::transaction(function () use ($validated, $request) {
            $formula = PayrollFormula::create([
                'payroll_category_id' => $validated['payroll_category_id'],
                'contact_id' => $validated['contact_id'],
                'department_id' => $validated['department_id'],
                'project_id' => $validated['project_id'] ?? null,
                'earning_amount' => $validated['earning_amount'] ?? 0,
                'deduction_amount' => $validated['deduction_amount'] ?? 0,
                'total_amount' => $validated['total_amount'] ?? 0,
                'created_by' => $request->user()?->id,
            ]);

            if (!empty($validated['details'])) {
                foreach ($validated['details'] as $detail) {
                    $formula->details()->create([
                        'payroll_component_id' => $detail['payroll_component_id'],
                        'amount' => $detail['amount'] ?? 0,
                        'created_by' => $request->user()?->id,
                    ]);
                }
            }
        });

        return redirect()
            ->route('payroll-formulas.index')
            ->with('success', 'Perhitungan gaji berhasil dibuat.');
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id): Response
    {
        $formula = PayrollFormula::query()
            ->with([
                'category:id,code,name',
                'contact:id,name',
                'department:id,code,name',
                'project:id,code,name',
                'createdBy:id,name',
                'details' => function ($query) {
                    $query->orderBy('id')->with(['component:id,code,name,type']);
                },
            ])
            ->findOrFail($id);

        return inertia('payrolls/payroll-formulas/show', [
            'formula' => $formula,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id): Response
    {
        $formula = PayrollFormula::query()
            ->with(['details.component'])
            ->findOrFail($id);

        $payrollCategories = PayrollCategory::query()
            ->active()
            ->orderBy('name')
            ->get(['id', 'code', 'name']);

        $contacts = Contact::query()
            ->active()
            ->where('is_employee', 1)
            ->orderBy('name')
            ->get(['id', 'name']);

        $departments = Auth::user()
            ?->departments()
            ->active()
            ->orderBy('code')
            ->get(['id', 'code', 'name']) ?? Department::query()->active()->orderBy('code')->get(['id', 'code', 'name']);

        $projects = Auth::user()
            ?->projects()
            ->active()
            ->orderBy('name')
            ->get(['id', 'code', 'name']) ?? Project::query()->active()->orderBy('name')->get(['id', 'code', 'name']);

        $payrollComponents = PayrollComponent::query()
            ->active()
            ->orderBy('name')
            ->get(['id', 'code', 'name', 'type']);

        return inertia('payrolls/payroll-formulas/edit', [
            'formula' => $formula,
            'payrollCategories' => $payrollCategories,
            'contacts' => $contacts,
            'departments' => $departments,
            'projects' => $projects,
            'payrollComponents' => $payrollComponents,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdatePayrollFormulaRequest $request, string $id): RedirectResponse
    {
        $formula = PayrollFormula::query()->findOrFail($id);
        $validated = $request->validated();

        DB::transaction(function () use ($formula, $validated, $request) {
            $formula->update([
                'payroll_category_id' => $validated['payroll_category_id'],
                'contact_id' => $validated['contact_id'],
                'department_id' => $validated['department_id'],
                'project_id' => $validated['project_id'] ?? null,
                'earning_amount' => $validated['earning_amount'] ?? 0,
                'deduction_amount' => $validated['deduction_amount'] ?? 0,
                'total_amount' => $validated['total_amount'] ?? 0,
            ]);

            $formula->details()->delete();

            if (!empty($validated['details'])) {
                foreach ($validated['details'] as $detail) {
                    $formula->details()->create([
                        'payroll_component_id' => $detail['payroll_component_id'],
                        'amount' => $detail['amount'] ?? 0,
                        'created_by' => $request->user()?->id,
                    ]);
                }
            }
        });

        return redirect()
            ->route('payroll-formulas.index')
            ->with('success', 'Perhitungan gaji berhasil diperbarui.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id): RedirectResponse
    {
        $formula = PayrollFormula::query()->findOrFail($id);
        $formula->details()->delete();
        $formula->delete();

        return redirect()
            ->route('payroll-formulas.index')
            ->with('success', 'Perhitungan gaji berhasil dihapus.');
    }
}
