<?php

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Http\Requests\Master\StoreSalaryCategoryRequest;
use App\Http\Requests\Master\UpdateSalaryCategoryRequest;
use App\Models\SalaryCategory;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Response;

class SalaryCategoryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $search = (string) $request->input('search');
        $perPage = (int) $request->input('perPage', 15);

        $categories = SalaryCategory::query()
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('code', 'like', '%' . $search . '%')
                        ->orWhere('name', 'like', '%' . $search . '%');
                });
            })
            ->orderBy('name')
            ->simplePaginate($perPage)
            ->withQueryString();

        return inertia('master/salary-category/index', [
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
        return inertia('master/salary-category/create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreSalaryCategoryRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        SalaryCategory::create($validated);

        return redirect()->route('salary-category-data.index');
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
        $category = SalaryCategory::query()->findOrFail($id);

        return inertia('master/salary-category/edit', [
            'category' => $category,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateSalaryCategoryRequest $request, string $id): RedirectResponse
    {
        $category = SalaryCategory::query()->findOrFail($id);

        $validated = $request->validated();

        $category->update($validated);

        return redirect()->route('salary-category-data.index');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id): RedirectResponse
    {
        $category = SalaryCategory::query()->findOrFail($id);

        $category->delete();

        return redirect()->route('salary-category-data.index');
    }
}
