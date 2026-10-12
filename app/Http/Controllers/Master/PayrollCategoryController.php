<?php

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Http\Requests\Master\StorePayrollCategoryRequest;
use App\Http\Requests\Master\UpdatePayrollCategoryRequest;
use App\Models\PayrollCategory;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Response;

class PayrollCategoryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $search = (string) $request->input('search');
        $perPage = (int) $request->input('perPage', 15);

        $categories = PayrollCategory::query()
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('code', 'like', '%' . $search . '%')
                        ->orWhere('name', 'like', '%' . $search . '%');
                });
            })
            ->orderBy('name')
            ->simplePaginate($perPage)
            ->withQueryString();

        return inertia('master/payroll-category/index', [
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
        return inertia('master/payroll-category/create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StorePayrollCategoryRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        PayrollCategory::create($validated);

        return redirect()->route('payroll-category-data.index');
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
        $category = PayrollCategory::query()->findOrFail($id);

        return inertia('master/payroll-category/edit', [
            'category' => $category,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdatePayrollCategoryRequest $request, string $id): RedirectResponse
    {
        $category = PayrollCategory::query()->findOrFail($id);

        $validated = $request->validated();

        $category->update($validated);

        return redirect()->route('payroll-category-data.index');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id): RedirectResponse
    {
        $category = PayrollCategory::query()->findOrFail($id);

        $category->delete();

        return redirect()->route('payroll-category-data.index');
    }
}
