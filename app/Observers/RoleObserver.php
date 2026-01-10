<?php

namespace App\Observers;

use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;
use Spatie\Permission\Models\Role;

class RoleObserver
{
    public function saved(Role $role): void
    {
        $this->forgetAssignedUsersCache($role);
    }

    public function deleted(Role $role): void
    {
        $this->forgetAssignedUsersCache($role);
    }

    public function forceDeleted(Role $role): void
    {
        $this->forgetAssignedUsersCache($role);
    }

    public function restored(Role $role): void
    {
        $this->forgetAssignedUsersCache($role);
    }

    public function pivotAttached(
        Role $role,
        string $relationName,
        array $pivotIds,
        array $pivotIdsAttributes
    ): void {
        $this->forgetWhenPermissionRelation($role, $relationName);
    }

    public function pivotDetached(Role $role, string $relationName, array $pivotIds): void
    {
        $this->forgetWhenPermissionRelation($role, $relationName);
    }

    public function pivotUpdated(
        Role $role,
        string $relationName,
        array $pivotIds,
        array $pivotIdsAttributes
    ): void {
        $this->forgetWhenPermissionRelation($role, $relationName);
    }

    protected function forgetWhenPermissionRelation(Role $role, string $relationName): void
    {
        if ($relationName === 'permissions') {
            $this->forgetAssignedUsersCache($role);
        }
    }

    protected function forgetAssignedUsersCache(Role $role): void
    {
        $this->assignedUserIds($role)
            ->each(fn(int $userId) => Cache::forget("user_permissions:{$userId}"));
    }

    protected function assignedUserIds(Role $role): Collection
    {
        return $role->users()->pluck('id');
    }
}
