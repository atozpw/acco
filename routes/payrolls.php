<?php

use App\Http\Controllers\Payrolls\PayrollFormulaController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth')->prefix('payrolls')->group(function () {
    Route::get('payroll-formulas', [PayrollFormulaController::class, 'index'])
        ->name('payroll-formulas.index')
        ->middleware('permission:payroll-formulas.index');
    Route::get('payroll-formulas/create', [PayrollFormulaController::class, 'create'])
        ->name('payroll-formulas.create')
        ->middleware('permission:payroll-formulas.store');
    Route::post('payroll-formulas', [PayrollFormulaController::class, 'store'])
        ->name('payroll-formulas.store')
        ->middleware('permission:payroll-formulas.store');
    Route::get('payroll-formulas/{id}', [PayrollFormulaController::class, 'show'])
        ->name('payroll-formulas.show')
        ->middleware('permission:payroll-formulas.index');
    Route::get('payroll-formulas/{id}/edit', [PayrollFormulaController::class, 'edit'])
        ->name('payroll-formulas.edit')
        ->middleware('permission:payroll-formulas.update');
    Route::put('payroll-formulas/{id}', [PayrollFormulaController::class, 'update'])
        ->name('payroll-formulas.update')
        ->middleware('permission:payroll-formulas.update');
    Route::delete('payroll-formulas/{id}', [PayrollFormulaController::class, 'destroy'])
        ->name('payroll-formulas.destroy')
        ->middleware('permission:payroll-formulas.destroy');
});