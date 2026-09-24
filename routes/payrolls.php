<?php

use App\Http\Controllers\Payrolls\PayrollFormulaController;
use App\Http\Controllers\Payrolls\PayrollPeriodController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth')->prefix('payrolls')->group(function () {
    Route::redirect('', 'payrolls/payroll-periods')->name('payrolls');

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

    Route::get('payroll-periods', [PayrollPeriodController::class, 'index'])
        ->name('payroll-periods.index')
        ->middleware('permission:payroll-periods.index');
    Route::post('payroll-periods', [PayrollPeriodController::class, 'store'])
        ->name('payroll-periods.store')
        ->middleware('permission:payroll-periods.store');
    Route::get('payroll-periods/{id}', [PayrollPeriodController::class, 'show'])
        ->name('payroll-periods.show')
        ->middleware('permission:payroll-periods.index');
    Route::get('payroll-periods/{period}/detail-payroll/{payroll}', [PayrollPeriodController::class, 'payroll'])
        ->name('payroll-periods.payroll')
        ->middleware('permission:payroll-periods.index');
    Route::delete('payroll-periods/{id}', [PayrollPeriodController::class, 'destroy'])
        ->name('payroll-periods.destroy')
        ->middleware('permission:payroll-periods.destroy');
});