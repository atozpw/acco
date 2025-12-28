<?php

use App\Http\Controllers\CashBank\ExpenseController;
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
});