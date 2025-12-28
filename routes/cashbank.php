<?php

use App\Http\Controllers\CashBank\ExpenseController;
use App\Http\Controllers\CashBank\IncomeController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth')->prefix('cash-bank')->group(function () {
    Route::redirect('', '/cash-bank/disbursement')->name('cash-bank.index');

    Route::get('disbursement', [ExpenseController::class, 'index'])->name('expense.index');
    Route::get('disbursement/create', [ExpenseController::class, 'create'])->name('expense.create');
    Route::post('disbursement', [ExpenseController::class, 'store'])->name('expense.store');
    Route::get('disbursement/{id}', [ExpenseController::class, 'show'])->name('expense.show');
    Route::get('disbursement/{id}/edit', [ExpenseController::class, 'edit'])->name('expense.edit');
    Route::put('disbursement/{id}', [ExpenseController::class, 'update'])->name('expense.update');
    Route::delete('disbursement/{id}', [ExpenseController::class, 'destroy'])->name('expense.destroy');

    Route::get('cash-in', [IncomeController::class, 'index'])->name('income.index');
    Route::get('cash-in/create', [IncomeController::class, 'create'])->name('income.create');
    Route::post('cash-in', [IncomeController::class, 'store'])->name('income.store');
    Route::get('cash-in/{id}', [IncomeController::class, 'show'])->name('income.show');
    Route::get('cash-in/{id}/edit', [IncomeController::class, 'edit'])->name('income.edit');
    Route::put('cash-in/{id}', [IncomeController::class, 'update'])->name('income.update');
    Route::delete('cash-in/{id}', [IncomeController::class, 'destroy'])->name('income.destroy');
});