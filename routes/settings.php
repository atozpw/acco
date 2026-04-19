<?php

use App\Http\Controllers\BeginningBalance\AccountBeginningBalanceController;
use App\Http\Controllers\BeginningBalance\InventoryBeginningBalanceController;
use App\Http\Controllers\BeginningBalance\PayableBeginningBalanceController;
use App\Http\Controllers\BeginningBalance\ReceivableBeginningBalanceController;
use App\Http\Controllers\Settings\PasswordController;
use App\Http\Controllers\Settings\ProfileController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware('auth')->group(function () {
    Route::redirect('settings', '/settings/profile');

    Route::get('settings/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('settings/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('settings/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::get('settings/password', [PasswordController::class, 'edit'])->name('user-password.edit');

    Route::put('settings/password', [PasswordController::class, 'update'])
        ->middleware('throttle:6,1')
        ->name('user-password.update');

    Route::get('settings/appearance', function () {
        return Inertia::render('settings/appearance');
    })->name('appearance.edit');

    Route::prefix('settings/beginning-balance')->group(function () {
        Route::redirect('', '/settings/beginning-balance/account')->name('beginning-balance.index');

        Route::get('account', [AccountBeginningBalanceController::class, 'index'])
            ->name('beginning-balance.account.index')
            ->middleware(['permission:account-beginning-balance.index']);
        Route::put('account', [AccountBeginningBalanceController::class, 'update'])
            ->name('beginning-balance.account.update')
            ->middleware(['permission:account-beginning-balance.update']);

        Route::get('receivable', [ReceivableBeginningBalanceController::class, 'index'])
            ->name('beginning-balance.receivable.index')
            ->middleware(['permission:receivable-beginning-balance.index']);
        Route::get('receivable/create', [ReceivableBeginningBalanceController::class, 'create'])
            ->name('beginning-balance.receivable.create')
            ->middleware(['permission:receivable-beginning-balance.store']);
        Route::post('receivable', [ReceivableBeginningBalanceController::class, 'store'])
            ->name('beginning-balance.receivable.store')
            ->middleware(['permission:receivable-beginning-balance.store']);

        Route::get('payable', [PayableBeginningBalanceController::class, 'index'])
            ->name('beginning-balance.payable.index')
            ->middleware(['permission:payable-beginning-balance.index']);
        Route::get('payable/create', [PayableBeginningBalanceController::class, 'create'])
            ->name('beginning-balance.payable.create')
            ->middleware(['permission:payable-beginning-balance.store']);
        Route::post('payable', [PayableBeginningBalanceController::class, 'store'])
            ->name('beginning-balance.payable.store')
            ->middleware(['permission:payable-beginning-balance.store']);

        Route::get('inventory', [InventoryBeginningBalanceController::class, 'index'])
            ->name('beginning-balance.inventory.index')
            ->middleware(['permission:inventory-beginning-balance.index']);
        Route::get('inventory/create', [InventoryBeginningBalanceController::class, 'create'])
            ->name('beginning-balance.inventory.create')
            ->middleware(['permission:inventory-beginning-balance.store']);
        Route::post('inventory', [InventoryBeginningBalanceController::class, 'store'])
            ->name('beginning-balance.inventory.store')
            ->middleware(['permission:inventory-beginning-balance.store']);
    });
});
