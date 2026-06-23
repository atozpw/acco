<?php

namespace App\Http\Controllers\UserManagement;

use App\Http\Controllers\Controller;
use App\Http\Requests\UserManagement\StoreUserRequest;
use App\Http\Requests\UserManagement\UpdateUserRequest;
use App\Models\Department;
use App\Models\User;
use App\Models\UserDepartment;
use Illuminate\Contracts\Pagination\Paginator;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Response;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $search = (string) $request->input('search');
        $perPage = (int) $request->input('perPage', 15);

        /** @var Paginator $users */
        $users = User::query()
            ->where('id', '>', 1)
            ->with('roles:id,name')
            ->with('departments:id,name')
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', '%' . $search . '%')
                        ->orWhere('username', 'like', '%' . $search . '%');
                });
            })
            ->orderBy('name')
            ->simplePaginate($perPage)
            ->withQueryString();

        return inertia('user-management/users/index', [
            'users' => $users,
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
        $roles = Role::query()->where('id', '>', 1)->orderBy('name')->get(['id', 'name']);
        $departments = Department::query()->get(['id', 'name']);

        return inertia('user-management/users/create', [
            'roles' => $roles,
            'departments' => $departments,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreUserRequest $request): RedirectResponse
    {
        $data = $request->validated();

        $user = User::create([
            'name' => $data['name'],
            'username' => $data['username'],
            'email' => $data['email'] ?? null,
            'password' => Hash::make($data['password']),
            'is_active' => $data['is_active'],
        ]);

        $roleIds = $request->input('roles', []);
        $user->syncRoles($roleIds);

        $departmentIds = $request->input('departments', []);
        foreach ($departmentIds as $departmentId) {
            UserDepartment::create([
                'user_id' => $user->id,
                'department_id' => $departmentId,
            ]);
        }

        return redirect()->route('users.index');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id): Response
    {
        $user = User::query()
            ->with('roles:id,name')
            ->with('departments:id,name')
            ->findOrFail($id);

        $roles = Role::query()->where('id', '>', 1)->orderBy('name')->get(['id', 'name']);
        $departments = Department::query()->get(['id', 'name']);

        return inertia('user-management/users/edit', [
            'user' => $user,
            'roles' => $roles,
            'departments' => $departments,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateUserRequest $request, string $id): RedirectResponse
    {
        $user = User::query()->findOrFail($id);

        $data = $request->validated();

        $updateData = [
            'name' => $data['name'],
            'username' => $data['username'],
            'email' => $data['email'] ?? null,
            'is_active' => $data['is_active'],
        ];

        if (! empty($data['password'])) {
            $updateData['password'] = Hash::make($data['password']);
        }

        $user->update($updateData);

        $roleIds = $request->input('roles', []);
        $user->syncRoles($roleIds);

        $departmentIds = $request->input('departments', []);
        UserDepartment::where('user_id', $user->id)->delete();

        foreach ($departmentIds as $departmentId) {
            UserDepartment::create([
                'user_id' => $user->id,
                'department_id' => $departmentId,
            ]);
        }

        return redirect()->route('users.index');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id): RedirectResponse
    {
        $user = User::query()->findOrFail($id);

        $user->delete();

        return redirect()->route('users.index');
    }
}
