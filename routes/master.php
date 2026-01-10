<?php

use App\Http\Controllers\Master\CoaController;
use App\Http\Controllers\Master\ContactController;
use App\Http\Controllers\Master\DepartmentController;
use App\Http\Controllers\Master\ProductCategoryController;
use App\Http\Controllers\Master\ProductController;
use App\Http\Controllers\Master\TaxController;
use App\Http\Controllers\Master\UnitMeasurementController;
use App\Http\Controllers\Master\WarehouseController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth')->prefix('data-store')->group(function () {
    Route::redirect('', '/data-store/contact-data')->name('data-store.index');

    Route::get('contact-data', [ContactController::class, 'index'])
        ->name('contact-data.index')
        ->middleware(['permission:contacts.index']);
    Route::get('contact-data/create', [ContactController::class, 'create'])
        ->name('contact-data.create')
        ->middleware(['permission:contacts.store']);
    Route::post('contact-data', [ContactController::class, 'store'])
        ->name('contact-data.store')
        ->middleware(['permission:contacts.store']);
    Route::get('contact-data/{id}/edit', [ContactController::class, 'edit'])
        ->name('contact-data.edit')
        ->middleware(['permission:contacts.update']);
    Route::put('contact-data/{id}', [ContactController::class, 'update'])
        ->name('contact-data.update')
        ->middleware(['permission:contacts.update']);
    Route::delete('contact-data/{id}', [ContactController::class, 'destroy'])
        ->name('contact-data.destroy')
        ->middleware(['permission:contacts.destroy']);

    Route::get('account-data', [CoaController::class, 'index'])
        ->name('coa.index')
        ->middleware(['permission:coas.index']);
    Route::get('account-data/create', [CoaController::class, 'create'])
        ->name('coa.create')
        ->middleware(['permission:coas.store']);
    Route::post('account-data', [CoaController::class, 'store'])
        ->name('coa.store')
        ->middleware(['permission:coas.store']);
    Route::get('account-data/{id}/edit', [CoaController::class, 'edit'])
        ->name('coa.edit')
        ->middleware(['permission:coas.update']);
    Route::put('account-data/{id}', [CoaController::class, 'update'])
        ->name('coa.update')
        ->middleware(['permission:coas.update']);
    Route::delete('account-data/{id}', [CoaController::class, 'destroy'])
        ->name('coa.destroy')
        ->middleware(['permission:coas.destroy']);

    Route::get('product-data', [ProductController::class, 'index'])
        ->name('product-data.index')
        ->middleware(['permission:products.index']);
    Route::get('product-data/create', [ProductController::class, 'create'])
        ->name('product-data.create')
        ->middleware(['permission:products.store']);
    Route::post('product-data', [ProductController::class, 'store'])
        ->name('product-data.store')
        ->middleware(['permission:products.store']);
    Route::get('product-data/{id}/edit', [ProductController::class, 'edit'])
        ->name('product-data.edit')
        ->middleware(['permission:products.update']);
    Route::put('product-data/{id}', [ProductController::class, 'update'])
        ->name('product-data.update')
        ->middleware(['permission:products.update']);
    Route::delete('product-data/{id}', [ProductController::class, 'destroy'])
        ->name('product-data.destroy')
        ->middleware(['permission:products.destroy']);

    Route::get('product-category', [ProductCategoryController::class, 'index'])
        ->name('product-category.index')
        ->middleware(['permission:product-categories.index']);
    Route::get('product-category/create', [ProductCategoryController::class, 'create'])
        ->name('product-category.create')
        ->middleware(['permission:product-categories.store']);
    Route::post('product-category', [ProductCategoryController::class, 'store'])
        ->name('product-category.store')
        ->middleware(['permission:product-categories.store']);
    Route::get('product-category/{id}/edit', [ProductCategoryController::class, 'edit'])
        ->name('product-category.edit')
        ->middleware(['permission:product-categories.update']);
    Route::put('product-category/{id}', [ProductCategoryController::class, 'update'])
        ->name('product-category.update')
        ->middleware(['permission:product-categories.update']);
    Route::delete('product-category/{id}', [ProductCategoryController::class, 'destroy'])
        ->name('product-category.destroy')
        ->middleware(['permission:product-categories.destroy']);

    Route::get('measurement-unit-data', [UnitMeasurementController::class, 'index'])
        ->name('unit-measurement.index')
        ->middleware(['permission:unit-measurements.index']);
    Route::get('measurement-unit-data/create', [UnitMeasurementController::class, 'create'])
        ->name('unit-measurement.create')
        ->middleware(['permission:unit-measurements.store']);
    Route::post('measurement-unit-data', [UnitMeasurementController::class, 'store'])
        ->name('unit-measurement.store')
        ->middleware(['permission:unit-measurements.store']);
    Route::get('measurement-unit-data/{id}/edit', [UnitMeasurementController::class, 'edit'])
        ->name('unit-measurement.edit')
        ->middleware(['permission:unit-measurements.update']);
    Route::put('measurement-unit-data/{id}', [UnitMeasurementController::class, 'update'])
        ->name('unit-measurement.update')
        ->middleware(['permission:unit-measurements.update']);
    Route::delete('measurement-unit-data/{id}', [UnitMeasurementController::class, 'destroy'])
        ->name('unit-measurement.destroy')
        ->middleware(['permission:unit-measurements.destroy']);

    Route::get('tax-data', [TaxController::class, 'index'])
        ->name('tax-data.index')
        ->middleware(['permission:taxes.index']);
    Route::get('tax-data/create', [TaxController::class, 'create'])
        ->name('tax-data.create')
        ->middleware(['permission:taxes.store']);
    Route::post('tax-data', [TaxController::class, 'store'])
        ->name('tax-data.store')
        ->middleware(['permission:taxes.store']);
    Route::get('tax-data/{id}/edit', [TaxController::class, 'edit'])
        ->name('tax-data.edit')
        ->middleware(['permission:taxes.update']);
    Route::put('tax-data/{id}', [TaxController::class, 'update'])
        ->name('tax-data.update')
        ->middleware(['permission:taxes.update']);
    Route::delete('tax-data/{id}', [TaxController::class, 'destroy'])
        ->name('tax-data.destroy')
        ->middleware(['permission:taxes.destroy']);

    Route::get('department-data', [DepartmentController::class, 'index'])
        ->name('department-data.index')
        ->middleware(['permission:departments.index']);
    Route::get('department-data/create', [DepartmentController::class, 'create'])
        ->name('department-data.create')
        ->middleware(['permission:departments.store']);
    Route::post('department-data', [DepartmentController::class, 'store'])
        ->name('department-data.store')
        ->middleware(['permission:departments.store']);
    Route::get('department-data/{id}/edit', [DepartmentController::class, 'edit'])
        ->name('department-data.edit')
        ->middleware(['permission:departments.update']);
    Route::put('department-data/{id}', [DepartmentController::class, 'update'])
        ->name('department-data.update')
        ->middleware(['permission:departments.update']);
    Route::delete('department-data/{id}', [DepartmentController::class, 'destroy'])
        ->name('department-data.destroy')
        ->middleware(['permission:departments.destroy']);

    Route::get('warehouse-data', [WarehouseController::class, 'index'])
        ->name('warehouse-data.index')
        ->middleware(['permission:warehouses.index']);
    Route::get('warehouse-data/create', [WarehouseController::class, 'create'])
        ->name('warehouse-data.create')
        ->middleware(['permission:warehouses.store']);
    Route::post('warehouse-data', [WarehouseController::class, 'store'])
        ->name('warehouse-data.store')
        ->middleware(['permission:warehouses.store']);
    Route::get('warehouse-data/{id}/edit', [WarehouseController::class, 'edit'])
        ->name('warehouse-data.edit')
        ->middleware(['permission:warehouses.update']);
    Route::put('warehouse-data/{id}', [WarehouseController::class, 'update'])
        ->name('warehouse-data.update')
        ->middleware(['permission:warehouses.update']);
    Route::delete('warehouse-data/{id}', [WarehouseController::class, 'destroy'])
        ->name('warehouse-data.destroy')
        ->middleware(['permission:warehouses.destroy']);
});
