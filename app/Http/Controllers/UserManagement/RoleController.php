<?php

namespace App\Http\Controllers\UserManagement;

use App\Http\Controllers\Controller;
use App\Http\Requests\UserManagement\StoreRoleRequest;
use App\Http\Requests\UserManagement\UpdateRoleRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Inertia\Response;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RoleController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $search = (string) $request->input('search');
        $perPage = (int) $request->input('perPage', 15);
        $guard = (string) $request->input('guard', config('auth.defaults.guard', 'web'));

        $roles = Role::query()
            ->where('id', '>', 1)
            ->when($guard, fn ($query) => $query->where('guard_name', $guard))
            ->when($search, function ($query, $search) {
                $query->where('name', 'like', '%' . $search . '%');
            })
            ->withCount('permissions')
            ->orderBy('name')
            ->simplePaginate($perPage)
            ->withQueryString();

        return inertia('user-management/roles/index', [
            'roles' => $roles,
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

        return inertia('user-management/roles/create', [
            'guard' => $guard,
            'availableGuards' => array_keys(config('auth.guards', [])),
            'permissions' => $this->availablePermissions($guard),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreRoleRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $data['guard_name'] ??= config('auth.defaults.guard', 'web');

        $role = Role::create([
            'name' => $data['name'],
            'guard_name' => $data['guard_name'],
        ]);

        $permissionIds = $request->input('permissions', []);
        $role->syncPermissions($this->resolvePermissions($permissionIds));

        return redirect()->route('roles.index');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id): Response
    {
        $role = Role::query()->with('permissions:id,name,guard_name')->findOrFail($id);

        return inertia('user-management/roles/edit', [
            'role' => $role,
            'availableGuards' => array_keys(config('auth.guards', [])),
            'permissions' => $this->availablePermissions($role->guard_name),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateRoleRequest $request, string $id): RedirectResponse
    {
        $role = Role::query()->findOrFail($id);

        $data = $request->validated();
        $data['guard_name'] ??= $role->guard_name ?? config('auth.defaults.guard', 'web');

        $role->update([
            'name' => $data['name'],
            'guard_name' => $data['guard_name'],
        ]);

        $permissionIds = $request->input('permissions', []);
        $role->syncPermissions($this->resolvePermissions($permissionIds));

        return redirect()->route('roles.index');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id): RedirectResponse
    {
        $role = Role::query()->findOrFail($id);

        $role->delete();

        return redirect()->route('roles.index');
    }

    /**
     * Get all available permissions for the given guard.
     */
    private function availablePermissions(string $guard): Collection
    {
        return Permission::query()
            ->where('guard_name', $guard)
            ->orderBy('name')
            ->get(['id', 'name', 'guard_name']);
    }

    /**
     * Resolve a list of permission IDs into Permission models.
     */
    private function resolvePermissions(array $permissionIds): Collection
    {
        if (empty($permissionIds)) {
            return collect();
        }

        return Permission::query()->whereIn('id', $permissionIds)->get();
    }
}
