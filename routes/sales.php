<?php

use App\Http\Controllers\Sales\SalesDeliveryController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth')->prefix('sales')->group(function () {
    Route::redirect('', '/sales/sales-delivery')->name('sales.index');

    Route::get('sales-delivery', [SalesDeliveryController::class, 'index'])->name('sales-delivery.index');
    Route::get('sales-delivery/create', [SalesDeliveryController::class, 'create'])->name('sales-delivery.create');
    Route::post('sales-delivery', [SalesDeliveryController::class, 'store'])->name('sales-delivery.store');
    Route::get('sales-delivery/{id}', [SalesDeliveryController::class, 'show'])->name('sales-delivery.show');
    Route::get('sales-delivery/{id}/edit', [SalesDeliveryController::class, 'edit'])->name('sales-delivery.edit');
    Route::put('sales-delivery/{id}', [SalesDeliveryController::class, 'update'])->name('sales-delivery.update');
    Route::delete('sales-delivery/{id}', [SalesDeliveryController::class, 'destroy'])->name('sales-delivery.destroy');
});
