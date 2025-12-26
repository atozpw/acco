<?php

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Http\Requests\Master\StoreUnitMeasurementRequest;
use App\Http\Requests\Master\UpdateUnitMeasurementRequest;
use App\Models\UnitMeasurement;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class UnitMeasurementController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $search = $request->input('search');
        $perPage = (int) $request->input('perPage', 15);

        $units = UnitMeasurement::query()
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('code', 'like', "%{$search}%")
                        ->orWhere('name', 'like', "%{$search}%");
                });
            })
            ->orderBy('name')
            ->simplePaginate($perPage)
            ->withQueryString();

        return Inertia::render('master/unit-measurement/index', [
            'units' => $units,
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
        return Inertia::render('master/unit-measurement/create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreUnitMeasurementRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        UnitMeasurement::create($validated);

        return redirect()
            ->route('unit-measurement.index');
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
        $unit = UnitMeasurement::query()->findOrFail($id);

        return Inertia::render('master/unit-measurement/edit', [
            'unit' => $unit,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateUnitMeasurementRequest $request, string $id): RedirectResponse
    {
        $unit = UnitMeasurement::query()->findOrFail($id);

        $validated = $request->validated();

        $unit->update($validated);

        return redirect()
            ->route('unit-measurement.index');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id): RedirectResponse
    {
        $unit = UnitMeasurement::query()->findOrFail($id);

        $unit->delete();

        return redirect()
            ->route('unit-measurement.index');
    }
}
