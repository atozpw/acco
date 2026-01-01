<?php

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Http\Requests\Master\StoreProductCategoryRequest;
use App\Http\Requests\Master\UpdateProductCategoryRequest;
use App\Models\Coa;
use App\Models\ProductCategory;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Response;

class ProductCategoryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $search = (string) $request->input('search');
        $perPage = (int) $request->input('perPage', 15);

        $categories = ProductCategory::query()
            ->with([
                'inventoryCoa:id,code,name',
                'purchaseCoa:id,code,name',
                'purchaseReceiptCoa:id,code,name',
                'purchaseReturnCoa:id,code,name',
                'salesCoa:id,code,name',
                'salesDeliveryCoa:id,code,name',
                'salesReturnCoa:id,code,name',
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

        return inertia('master/product-category/index', [
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

        return inertia('master/product-category/create', [
            'coas' => $coas,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreProductCategoryRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        ProductCategory::create($validated);

        return redirect()->route('product-category.index');
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
        $category = ProductCategory::query()->findOrFail($id);

        $coas = Coa::query()
            ->active()
            ->doesntHave('children')
            ->orderBy('code')
            ->get(['id', 'code', 'name']);

        return inertia('master/product-category/edit', [
            'category' => $category,
            'coas' => $coas,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateProductCategoryRequest $request, string $id): RedirectResponse
    {
        $validated = $request->validated();

        $category = ProductCategory::query()->findOrFail($id);

        $category->update($validated);

        return redirect()->route('product-category.index');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id): RedirectResponse
    {
        $category = ProductCategory::query()->findOrFail($id);

        $category->delete();

        return redirect()->route('product-category.index');
    }
}
