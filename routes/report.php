<?php

use App\Http\Controllers\Report\FinancialStatementController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth')->prefix('report')->group(function () {
    Route::redirect('', 'report/financial-statement')->name('report.index');

    Route::prefix('financial-statement')->group(function () {
        Route::get('', [FinancialStatementController::class, 'index'])
            ->name('financial-statement.index');
        Route::get('profit-loss', [FinancialStatementController::class, 'profitLoss'])
            ->name('financial-statement.profit-loss');
    });
});
