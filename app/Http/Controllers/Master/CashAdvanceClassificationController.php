<?php

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Http\Requests\Master\StoreCashAdvanceClassificationRequest;
use App\Http\Requests\Master\UpdateCashAdvanceClassificationRequest;
use App\Models\Coa;
use App\Models\CashAdvanceClassification;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Response;

class CashAdvanceClassificationController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $search = (string) $request->input('search');
        $perPage = (int) $request->input('perPage', 15);

        $classifications = CashAdvanceClassification::query()
            ->with([
                'incomeCoa:id,code,name',
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

        return inertia('master/cash-advance-classification/index', [
            'classifications' => $classifications,
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

        return inertia('master/cash-advance-classification/create', [
            'coas' => $coas,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreCashAdvanceClassificationRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        CashAdvanceClassification::create($validated);

        return redirect()->route('cash-advance-classification.index');
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
        $classification = CashAdvanceClassification::query()->findOrFail($id);

        $coas = Coa::query()
            ->active()
            ->doesntHave('children')
            ->orderBy('code')
            ->get(['id', 'code', 'name']);

        return inertia('master/cash-advance-classification/edit', [
            'classification' => $classification,
            'coas' => $coas,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateCashAdvanceClassificationRequest $request, string $id): RedirectResponse
    {
        $validated = $request->validated();

        $classification = CashAdvanceClassification::query()->findOrFail($id);

        $classification->update($validated);

        return redirect()->route('cash-advance-classification.index');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id): RedirectResponse
    {
        $classification = CashAdvanceClassification::query()->findOrFail($id);

        $classification->delete();

        return redirect()->route('cash-advance-classification.index');
    }
}
