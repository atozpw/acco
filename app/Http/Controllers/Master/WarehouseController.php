<?php

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Http\Requests\Master\StoreWarehouseRequest;
use App\Http\Requests\Master\UpdateWarehouseRequest;
use App\Models\Warehouse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Response;

class WarehouseController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $search = (string) $request->input('search');
        $perPage = (int) $request->input('perPage', 15);

        $warehouses = Warehouse::query()
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('code', 'like', '%' . $search . '%')
                        ->orWhere('name', 'like', '%' . $search . '%');
                });
            })
            ->orderBy('name')
            ->simplePaginate($perPage)
            ->withQueryString();

        return inertia('master/warehouse/index', [
            'warehouses' => $warehouses,
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
        return inertia('master/warehouse/create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreWarehouseRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        Warehouse::create($validated);

        return redirect()->route('warehouse-data.index');
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
        $warehouse = Warehouse::query()->findOrFail($id);

        return inertia('master/warehouse/edit', [
            'warehouse' => $warehouse,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateWarehouseRequest $request, string $id): RedirectResponse
    {
        $warehouse = Warehouse::query()->findOrFail($id);

        $validated = $request->validated();

        $warehouse->update($validated);

        return redirect()->route('warehouse-data.index');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id): RedirectResponse
    {
        $warehouse = Warehouse::query()->findOrFail($id);

        $warehouse->delete();

        return redirect()->route('warehouse-data.index');
    }
}
