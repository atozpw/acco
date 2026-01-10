<?php

use App\Http\Controllers\CashBank\CashTransferController;
use App\Http\Controllers\CashBank\ExpenseController;
use App\Http\Controllers\CashBank\IncomeController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth')->prefix('cash-bank')->group(function () {
    Route::redirect('', '/cash-bank/disbursement')->name('cash-bank.index');

    Route::get('disbursement', [ExpenseController::class, 'index'])
        ->name('expense.index')
        ->middleware(['permission:expenses.index']);
    Route::get('disbursement/create', [ExpenseController::class, 'create'])
        ->name('expense.create')
        ->middleware(['permission:expenses.store']);
    Route::post('disbursement', [ExpenseController::class, 'store'])
        ->name('expense.store')
        ->middleware(['permission:expenses.store']);
    Route::get('disbursement/{id}', [ExpenseController::class, 'show'])
        ->name('expense.show')
        ->middleware(['permission:expenses.index']);
    Route::get('disbursement/{id}/edit', [ExpenseController::class, 'edit'])
        ->name('expense.edit')
        ->middleware(['permission:expenses.update']);
    Route::put('disbursement/{id}', [ExpenseController::class, 'update'])
        ->name('expense.update')
        ->middleware(['permission:expenses.update']);
    Route::delete('disbursement/{id}', [ExpenseController::class, 'destroy'])
        ->name('expense.destroy')
        ->middleware(['permission:expenses.destroy']);
    Route::get('disbursement/journal-voucher/{nomor}', [ExpenseController::class, 'voucher'])
        ->name('expense.voucher')
        ->middleware(['permission:expenses.index']);

    Route::get('cash-in', [IncomeController::class, 'index'])
        ->name('income.index')
        ->middleware(['permission:incomes.index']);
    Route::get('cash-in/create', [IncomeController::class, 'create'])
        ->name('income.create')
        ->middleware(['permission:incomes.store']);
    Route::post('cash-in', [IncomeController::class, 'store'])
        ->name('income.store')
        ->middleware(['permission:incomes.store']);
    Route::get('cash-in/{id}', [IncomeController::class, 'show'])
        ->name('income.show')
        ->middleware(['permission:incomes.index']);
    Route::get('cash-in/{id}/edit', [IncomeController::class, 'edit'])
        ->name('income.edit')
        ->middleware(['permission:incomes.update']);
    Route::put('cash-in/{id}', [IncomeController::class, 'update'])
        ->name('income.update')
        ->middleware(['permission:incomes.update']);
    Route::delete('cash-in/{id}', [IncomeController::class, 'destroy'])
        ->name('income.destroy')
        ->middleware(['permission:incomes.destroy']);
    Route::get('cash-in/journal-voucher/{nomor}', [IncomeController::class, 'voucher'])
        ->name('income.voucher')
        ->middleware(['permission:incomes.index']);

    Route::get('cash-transfer', [CashTransferController::class, 'index'])
        ->name('cash-transfer.index')
        ->middleware(['permission:cash-transfers.index']);
    Route::get('cash-transfer/create', [CashTransferController::class, 'create'])
        ->name('cash-transfer.create')
        ->middleware(['permission:cash-transfers.store']);
    Route::post('cash-transfer', [CashTransferController::class, 'store'])
        ->name('cash-transfer.store')
        ->middleware(['permission:cash-transfers.store']);
    Route::get('cash-transfer/{id}', [CashTransferController::class, 'show'])
        ->name('cash-transfer.show')
        ->middleware(['permission:cash-transfers.index']);
    Route::get('cash-transfer/{id}/edit', [CashTransferController::class, 'edit'])
        ->name('cash-transfer.edit')
        ->middleware(['permission:cash-transfers.update']);
    Route::put('cash-transfer/{id}', [CashTransferController::class, 'update'])
        ->name('cash-transfer.update')
        ->middleware(['permission:cash-transfers.update']);
    Route::delete('cash-transfer/{id}', [CashTransferController::class, 'destroy'])
        ->name('cash-transfer.destroy')
        ->middleware(['permission:cash-transfers.destroy']);
    Route::get('cash-transfer/journal-voucher/{nomor}', [CashTransferController::class, 'voucher'])
        ->name('cash-transfer.voucher')
        ->middleware(['permission:cash-transfers.index']);
});
