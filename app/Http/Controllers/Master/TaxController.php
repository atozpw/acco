<?php

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Http\Requests\Master\StoreTaxRequest;
use App\Http\Requests\Master\UpdateTaxRequest;
use App\Models\Coa;
use App\Models\Tax;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Response;

class TaxController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $search = (string) $request->input('search');
        $perPage = (int) $request->input('perPage', 15);

        $taxes = Tax::query()
            ->with(['salesCoa', 'purchaseCoa'])
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('code', 'like', '%' . $search . '%')
                        ->orWhere('name', 'like', '%' . $search . '%');
                });
            })
            ->orderBy('name')
            ->simplePaginate($perPage)
            ->withQueryString();

        return inertia('master/tax/index', [
            'taxes' => $taxes,
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
        $accounts = Coa::query()
            ->active()
            ->orderBy('code')
            ->get(['id', 'code', 'name']);

        return inertia('master/tax/create', [
            'accounts' => $accounts,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreTaxRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        Tax::create($validated);

        return redirect()->route('tax-data.index');
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
        $tax = Tax::query()->findOrFail($id);

        $accounts = Coa::query()
            ->active()
            ->orderBy('code')
            ->get(['id', 'code', 'name']);

        return inertia('master/tax/edit', [
            'tax' => $tax,
            'accounts' => $accounts,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateTaxRequest $request, string $id): RedirectResponse
    {
        $tax = Tax::query()->findOrFail($id);

        $validated = $request->validated();

        $tax->update($validated);

        return redirect()->route('tax-data.index');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id): RedirectResponse
    {
        $tax = Tax::query()->findOrFail($id);

        $tax->delete();

        return redirect()->route('tax-data.index');
    }
}
