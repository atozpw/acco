<?php

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Http\Requests\Master\StoreCoaRequest;
use App\Http\Requests\Master\UpdateCoaRequest;
use App\Models\Coa;
use App\Models\CoaClassification;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Response;

class CoaController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $search = (string) $request->input('search');
        $perPage = (int) $request->input('perPage', 15);

        $accounts = Coa::query()
            ->with('classification')
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('code', 'like', '%' . $search . '%')
                        ->orWhere('name', 'like', '%' . $search . '%');
                });
            })
            ->orderBy('code')
            ->simplePaginate($perPage)
            ->withQueryString();

        return inertia('master/coa/index', [
            'accounts' => $accounts,
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
        $parents = Coa::query()
            ->orderBy('code')
            ->get(['id', 'code', 'name']);

        $classifications = CoaClassification::query()
            ->orderBy('id')
            ->get(['id', 'name']);

        return inertia('master/coa/create', [
            'parents' => $parents,
            'classifications' => $classifications,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreCoaRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        Coa::create($validated);

        return redirect()->route('coa.index');
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
        $account = Coa::with('classification')->findOrFail($id);

        $parents = Coa::query()
            ->where('id', '!=', $account->id)
            ->orderBy('code')
            ->get(['id', 'code', 'name']);

        $classifications = CoaClassification::query()
            ->orderBy('id')
            ->get(['id', 'name']);

        return inertia('master/coa/edit', [
            'account' => $account,
            'parents' => $parents,
            'classifications' => $classifications,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateCoaRequest $request, string $id): RedirectResponse
    {
        $account = Coa::findOrFail($id);

        $validated = $request->validated();

        $account->update($validated);

        return redirect()->route('coa.index');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id): RedirectResponse
    {
        $account = Coa::findOrFail($id);

        $account->delete();

        return redirect()->route('coa.index');
    }
}
