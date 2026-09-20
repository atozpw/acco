<?php

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Http\Requests\Master\StoreAssetCategoryRequest;
use App\Http\Requests\Master\UpdateAssetCategoryRequest;
use App\Models\AssetCategory;
use App\Models\Coa;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Response;

class AssetCategoryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $search = (string) $request->input('search');
        $perPage = (int) $request->input('perPage', 15);

        $categories = AssetCategory::query()
            ->with([
                'assetCoa:id,code,name',
                'accumulationCoa:id,code,name',
                'depreciationCoa:id,code,name',
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

        return inertia('master/asset-category/index', [
            'categories' => $categories,
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

        return inertia('master/asset-category/create', [
            'coas' => $coas,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreAssetCategoryRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        
        $validated['useful_life_in_months'] = $validated['useful_life_in_years'] * 12;

        AssetCategory::create($validated);

        return redirect()->route('asset-category-data.index');
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
        $category = AssetCategory::query()->findOrFail($id);

        $coas = Coa::query()
            ->active()
            ->doesntHave('children')
            ->orderBy('code')
            ->get(['id', 'code', 'name']);

        return inertia('master/asset-category/edit', [
            'category' => $category,
            'coas' => $coas,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateAssetCategoryRequest $request, string $id): RedirectResponse
    {
        $validated = $request->validated();
        
        $validated['useful_life_in_months'] = $validated['useful_life_in_years'] * 12;

        $category = AssetCategory::query()->findOrFail($id);

        $category->update($validated);

        return redirect()->route('asset-category-data.index');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id): RedirectResponse
    {
        $category = AssetCategory::query()->findOrFail($id);

        $category->delete();

        return redirect()->route('asset-category-data.index');
    }
}
