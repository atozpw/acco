<?php

use App\Http\Controllers\Master\CoaController;
use App\Http\Controllers\Master\ContactController;
use App\Http\Controllers\Master\DepartmentController;
use App\Http\Controllers\Master\ProductCategoryController;
use App\Http\Controllers\Master\ProductController;
use App\Http\Controllers\Master\TaxController;
use App\Http\Controllers\Master\UnitMeasurementController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth')->prefix('data-store')->group(function () {
    Route::redirect('', '/data-store/contact-data')->name('data-store.index');

    Route::get('contact-data', [ContactController::class, 'index'])->name('contact-data.index');
    Route::get('contact-data/create', [ContactController::class, 'create'])->name('contact-data.create');
    Route::post('contact-data', [ContactController::class, 'store'])->name('contact-data.store');
    Route::get('contact-data/{id}/edit', [ContactController::class, 'edit'])->name('contact-data.edit');
    Route::put('contact-data/{id}', [ContactController::class, 'update'])->name('contact-data.update');
    Route::delete('contact-data/{id}', [ContactController::class, 'destroy'])->name('contact-data.destroy');

    Route::get('account-data', [CoaController::class, 'index'])->name('coa.index');
    Route::get('account-data/create', [CoaController::class, 'create'])->name('coa.create');
    Route::post('account-data', [CoaController::class, 'store'])->name('coa.store');
    Route::get('account-data/{id}/edit', [CoaController::class, 'edit'])->name('coa.edit');
    Route::put('account-data/{id}', [CoaController::class, 'update'])->name('coa.update');
    Route::delete('account-data/{id}', [CoaController::class, 'destroy'])->name('coa.destroy');

    Route::get('product-data', [ProductController::class, 'index'])->name('product-data.index');
    Route::get('product-data/create', [ProductController::class, 'create'])->name('product-data.create');
    Route::post('product-data', [ProductController::class, 'store'])->name('product-data.store');
    Route::get('product-data/{id}/edit', [ProductController::class, 'edit'])->name('product-data.edit');
    Route::put('product-data/{id}', [ProductController::class, 'update'])->name('product-data.update');
    Route::delete('product-data/{id}', [ProductController::class, 'destroy'])->name('product-data.destroy');

    Route::get('product-category', [ProductCategoryController::class, 'index'])->name('product-category.index');
    Route::get('product-category/create', [ProductCategoryController::class, 'create'])->name('product-category.create');
    Route::post('product-category', [ProductCategoryController::class, 'store'])->name('product-category.store');
    Route::get('product-category/{id}/edit', [ProductCategoryController::class, 'edit'])->name('product-category.edit');
    Route::put('product-category/{id}', [ProductCategoryController::class, 'update'])->name('product-category.update');
    Route::delete('product-category/{id}', [ProductCategoryController::class, 'destroy'])->name('product-category.destroy');

    Route::get('measurement-unit-data', [UnitMeasurementController::class, 'index'])->name('unit-measurement.index');
    Route::get('measurement-unit-data/create', [UnitMeasurementController::class, 'create'])->name('unit-measurement.create');
    Route::post('measurement-unit-data', [UnitMeasurementController::class, 'store'])->name('unit-measurement.store');
    Route::get('measurement-unit-data/{id}/edit', [UnitMeasurementController::class, 'edit'])->name('unit-measurement.edit');
    Route::put('measurement-unit-data/{id}', [UnitMeasurementController::class, 'update'])->name('unit-measurement.update');
    Route::delete('measurement-unit-data/{id}', [UnitMeasurementController::class, 'destroy'])->name('unit-measurement.destroy');

    Route::get('tax-data', [TaxController::class, 'index'])->name('tax-data.index');
    Route::get('tax-data/create', [TaxController::class, 'create'])->name('tax-data.create');
    Route::post('tax-data', [TaxController::class, 'store'])->name('tax-data.store');
    Route::get('tax-data/{id}/edit', [TaxController::class, 'edit'])->name('tax-data.edit');
    Route::put('tax-data/{id}', [TaxController::class, 'update'])->name('tax-data.update');
    Route::delete('tax-data/{id}', [TaxController::class, 'destroy'])->name('tax-data.destroy');

    Route::get('department-data', [DepartmentController::class, 'index'])->name('department-data.index');
    Route::get('department-data/create', [DepartmentController::class, 'create'])->name('department-data.create');
    Route::post('department-data', [DepartmentController::class, 'store'])->name('department-data.store');
    Route::get('department-data/{id}/edit', [DepartmentController::class, 'edit'])->name('department-data.edit');
    Route::put('department-data/{id}', [DepartmentController::class, 'update'])->name('department-data.update');
    Route::delete('department-data/{id}', [DepartmentController::class, 'destroy'])->name('department-data.destroy');
});
