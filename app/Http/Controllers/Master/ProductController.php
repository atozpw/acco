<?php

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Http\Requests\Master\StoreProductRequest;
use App\Http\Requests\Master\UpdateProductRequest;
use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\Stock;
use App\Models\Tax;
use App\Models\UnitMeasurement;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Response;

class ProductController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $search = (string) $request->input('search');
        $perPage = (int) $request->input('perPage', 15);

        $products = Product::query()
            ->with(['category', 'unitMeasurement', 'salesTax', 'purchaseTax'])
            ->withSum('stocks as available_qty', 'qty')
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('code', 'like', '%' . $search . '%')
                        ->orWhere('name', 'like', '%' . $search . '%');
                });
            })
            ->orderBy('name')
            ->simplePaginate($perPage)
            ->withQueryString();

        return inertia('master/product/index', [
            'products' => $products,
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
        $categories = ProductCategory::query()
            ->orderBy('name')
            ->where('is_active', true)
            ->get(['id', 'code', 'name']);

        $units = UnitMeasurement::query()
            ->orderBy('name')
            ->where('is_active', true)
            ->get(['id', 'code', 'name']);

        $taxes = Tax::query()
            ->orderBy('name')
            ->where('is_active', true)
            ->get(['id', 'code', 'name']);

        return inertia('master/product/create', [
            'categories' => $categories,
            'units' => $units,
            'taxes' => $taxes,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreProductRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        $product = new Product($validated);

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('products', 'public');
            $product->image = '/storage/' . $path;
        }

        $product->save();

        return redirect()->route('product-data.index');
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
        $product = Product::query()->findOrFail($id);

        $categories = ProductCategory::query()
            ->orderBy('name')
            ->where('is_active', true)
            ->get(['id', 'code', 'name']);

        $units = UnitMeasurement::query()
            ->orderBy('name')
            ->where('is_active', true)
            ->get(['id', 'code', 'name']);

        $taxes = Tax::query()
            ->orderBy('name')
            ->where('is_active', true)
            ->get(['id', 'code', 'name']);

        return inertia('master/product/edit', [
            'product' => $product,
            'categories' => $categories,
            'units' => $units,
            'taxes' => $taxes,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateProductRequest $request, string $id): RedirectResponse
    {
        $validated = $request->validated();

        $product = Product::query()->findOrFail($id);

        if (array_key_exists('image', $validated)) {
            unset($validated['image']);
        }

        $product->fill($validated);

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('products', 'public');
            $product->image = '/storage/' . $path;
        }

        $product->save();

        return redirect()->route('product-data.index');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id): RedirectResponse
    {
        $product = Product::query()->findOrFail($id);

        $product->delete();

        return redirect()->route('product-data.index');
    }
}
