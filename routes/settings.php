<?php

use App\Http\Controllers\BeginningBalance\AccountBeginningBalanceController;
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
            ->name('beginning-balance.account.index');
        Route::put('account', [AccountBeginningBalanceController::class, 'update'])
            ->name('beginning-balance.account.update');

        Route::get('receivable', [ReceivableBeginningBalanceController::class, 'index'])
            ->name('beginning-balance.receivable.index');
        Route::get('receivable/create', [ReceivableBeginningBalanceController::class, 'create'])
            ->name('beginning-balance.receivable.create');
        Route::post('receivable', [ReceivableBeginningBalanceController::class, 'store'])
            ->name('beginning-balance.receivable.store');

        Route::get('payable', [PayableBeginningBalanceController::class, 'index'])
            ->name('beginning-balance.payable.index');
        Route::get('payable/create', [PayableBeginningBalanceController::class, 'create'])
            ->name('beginning-balance.payable.create');
        Route::post('payable', [PayableBeginningBalanceController::class, 'store'])
            ->name('beginning-balance.payable.store');
    });
});
