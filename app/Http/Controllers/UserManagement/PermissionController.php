<?php

namespace App\Http\Controllers\UserManagement;

use App\Http\Controllers\Controller;
use App\Http\Requests\UserManagement\StorePermissionRequest;
use App\Http\Requests\UserManagement\UpdatePermissionRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Response;
use Spatie\Permission\Models\Permission;

class PermissionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $search = (string) $request->input('search');
        $perPage = (int) $request->input('perPage', 15);
        $guard = (string) $request->input('guard', config('auth.defaults.guard', 'web'));

        $permissions = Permission::query()
            ->when($guard, fn ($query) => $query->where('guard_name', $guard))
            ->when($search, function ($query, $search) {
                $query->where('name', 'like', '%' . $search . '%');
            })
            ->orderBy('name')
            ->simplePaginate($perPage)
            ->withQueryString();

        return inertia('user-management/permissions/index', [
            'permissions' => $permissions,
            'filters' => [
                'search' => $search,
                'perPage' => $perPage,
                'guard' => $guard,
            ],
            'availableGuards' => array_keys(config('auth.guards', [])),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(Request $request): Response
    {
        $guard = (string) $request->input('guard', config('auth.defaults.guard', 'web'));

        return inertia('user-management/permissions/create', [
            'guard' => $guard,
            'availableGuards' => array_keys(config('auth.guards', [])),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StorePermissionRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $data['guard_name'] ??= config('auth.defaults.guard', 'web');

        Permission::create($data);

        return redirect()->route('permissions.index');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id): Response
    {
        $permission = Permission::query()->findOrFail($id);

        return inertia('user-management/permissions/edit', [
            'permission' => $permission,
            'availableGuards' => array_keys(config('auth.guards', [])),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdatePermissionRequest $request, string $id): RedirectResponse
    {
        $permission = Permission::query()->findOrFail($id);

        $data = $request->validated();
        $data['guard_name'] ??= $permission->guard_name ?? config('auth.defaults.guard', 'web');

        $permission->update($data);

        return redirect()->route('permissions.index');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id): RedirectResponse
    {
        $permission = Permission::query()->findOrFail($id);

        $permission->delete();

        return redirect()->route('permissions.index');
    }
}
