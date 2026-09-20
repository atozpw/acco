<?php

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Http\Requests\Master\StorePayrollComponentRequest;
use App\Http\Requests\Master\UpdatePayrollComponentRequest;
use App\Models\Coa;
use App\Models\PayrollComponent;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Response;

class PayrollComponentController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $search = (string) $request->input('search');
        $perPage = (int) $request->input('perPage', 15);

        $components = PayrollComponent::query()
            ->with([
                'payableCoa:id,code,name',
                'expenseCoa:id,code,name',
            ])
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('code', 'like', '%' . $search . '%')
                        ->orWhere('name', 'like', '%' . $search . '%');
                });
            })
            ->orderBy('name')
            ->simplePaginate($perPage)
            ->withQueryString();

        return inertia('master/payroll-component/index', [
            'components' => $components,
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
        $coas = Coa::query()
            ->active()
            ->doesntHave('children')
            ->orderBy('code')
            ->get(['id', 'code', 'name']);

        return inertia('master/payroll-component/create', [
            'coas' => $coas,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StorePayrollComponentRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        PayrollComponent::create($validated);

        return redirect()->route('payroll-component-data.index');
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
        $component = PayrollComponent::query()->findOrFail($id);

        $coas = Coa::query()
            ->active()
            ->doesntHave('children')
            ->orderBy('code')
            ->get(['id', 'code', 'name']);

        return inertia('master/payroll-component/edit', [
            'component' => $component,
            'coas' => $coas,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdatePayrollComponentRequest $request, string $id): RedirectResponse
    {
        $validated = $request->validated();

        $component = PayrollComponent::query()->findOrFail($id);

        $component->update($validated);

        return redirect()->route('payroll-component-data.index');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id): RedirectResponse
    {
        $component = PayrollComponent::query()->findOrFail($id);

        $component->delete();

        return redirect()->route('payroll-component-data.index');
    }
}
