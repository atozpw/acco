<?php

use App\Http\Controllers\Report\FinancialStatementController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth')->prefix('report')->group(function () {
    Route::redirect('', 'report/financial-statement')->name('report.index');

    Route::prefix('financial-statement')->group(function () {
        Route::get('', [FinancialStatementController::class, 'index'])
            ->name('financial-statement.index')
            ->middleware(['permission:financial-statement.index']);
        Route::get('profit-loss', [FinancialStatementController::class, 'profitLoss'])
            ->name('financial-statement.profit-loss')
            ->middleware(['permission:financial-statement.profit-loss']);
        Route::get('balance-sheet', [FinancialStatementController::class, 'balanceSheet'])
            ->name('financial-statement.balance-sheet')
            ->middleware(['permission:financial-statement.balance-sheet']);
        Route::get('cash-flow', [FinancialStatementController::class, 'cashFlow'])
            ->name('financial-statement.cash-flow')
            ->middleware(['permission:financial-statement.cash-flow']);
    });
});
