<?php

namespace App\Observers;

use App\Models\User;
use Illuminate\Support\Facades\Cache;

class UserObserver
{
    public function saved(User $user): void
    {
        $this->forgetPermissionCache($user);
    }

    public function deleted(User $user): void
    {
        $this->forgetPermissionCache($user);
    }

    public function forceDeleted(User $user): void
    {
        $this->forgetPermissionCache($user);
    }

    public function restored(User $user): void
    {
        $this->forgetPermissionCache($user);
    }

    public function pivotAttached(
        User $user,
        string $relationName,
        array $pivotIds,
        array $pivotIdsAttributes
    ): void {
        $this->forgetWhenRelationAffectsPermissions($user, $relationName);
    }

    public function pivotDetached(User $user, string $relationName, array $pivotIds): void
    {
        $this->forgetWhenRelationAffectsPermissions($user, $relationName);
    }

    public function pivotUpdated(
        User $user,
        string $relationName,
        array $pivotIds,
        array $pivotIdsAttributes
    ): void {
        $this->forgetWhenRelationAffectsPermissions($user, $relationName);
    }

    protected function forgetWhenRelationAffectsPermissions(User $user, string $relationName): void
    {
        if (in_array($relationName, ['roles', 'permissions'], true)) {
            $this->forgetPermissionCache($user);
        }
    }

    protected function forgetPermissionCache(User $user): void
    {
        Cache::forget("user_permissions:{$user->id}");
    }
}
