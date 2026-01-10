<?php

use App\Http\Controllers\UserManagement\PermissionController;
use App\Http\Controllers\UserManagement\RoleController;
use App\Http\Controllers\UserManagement\UserController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth')->prefix('user-management')->group(function () {
    Route::redirect('', '/user-management/permissions')->name('user-management.index');

    Route::get('permissions', [PermissionController::class, 'index'])
        ->name('permissions.index')
        ->middleware(['permission:permissions.index']);
    Route::get('permissions/create', [PermissionController::class, 'create'])
        ->name('permissions.create')
        ->middleware(['permission:permissions.store']);
    Route::post('permissions', [PermissionController::class, 'store'])
        ->name('permissions.store')
        ->middleware(['permission:permissions.store']);
    Route::get('permissions/{id}/edit', [PermissionController::class, 'edit'])
        ->name('permissions.edit')
        ->middleware(['permission:permissions.update']);
    Route::put('permissions/{id}', [PermissionController::class, 'update'])
        ->name('permissions.update')
        ->middleware(['permission:permissions.update']);
    Route::delete('permissions/{id}', [PermissionController::class, 'destroy'])
        ->name('permissions.destroy')
        ->middleware(['permission:permissions.destroy']);

    Route::get('roles', [RoleController::class, 'index'])
        ->name('roles.index')
        ->middleware(['permission:roles.index']);
    Route::get('roles/create', [RoleController::class, 'create'])
        ->name('roles.create')
        ->middleware(['permission:roles.store']);
    Route::post('roles', [RoleController::class, 'store'])
        ->name('roles.store')
        ->middleware(['permission:roles.store']);
    Route::get('roles/{id}/edit', [RoleController::class, 'edit'])
        ->name('roles.edit')
        ->middleware(['permission:roles.update']);
    Route::put('roles/{id}', [RoleController::class, 'update'])
        ->name('roles.update')
        ->middleware(['permission:roles.update']);
    Route::delete('roles/{id}', [RoleController::class, 'destroy'])
        ->name('roles.destroy')
        ->middleware(['permission:roles.destroy']);

    Route::get('users', [UserController::class, 'index'])
        ->name('users.index')
        ->middleware(['permission:users.index']);
    Route::get('users/create', [UserController::class, 'create'])
        ->name('users.create')
        ->middleware(['permission:users.store']);
    Route::post('users', [UserController::class, 'store'])
        ->name('users.store')
        ->middleware(['permission:users.store']);
    Route::get('users/{id}/edit', [UserController::class, 'edit'])
        ->name('users.edit')
        ->middleware(['permission:users.update']);
    Route::put('users/{id}', [UserController::class, 'update'])
        ->name('users.update')
        ->middleware(['permission:users.update']);
    Route::delete('users/{id}', [UserController::class, 'destroy'])
        ->name('users.destroy')
        ->middleware(['permission:users.destroy']);
});
