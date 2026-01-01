<?php

use App\Http\Controllers\Sales\SalesDeliveryController;
use App\Http\Controllers\Sales\SalesInvoiceController;
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

    Route::get('sales-invoice', [SalesInvoiceController::class, 'index'])->name('sales-invoice.index');
    Route::get('sales-invoice/create', [SalesInvoiceController::class, 'create'])->name('sales-invoice.create');
    Route::post('sales-invoice', [SalesInvoiceController::class, 'store'])->name('sales-invoice.store');
    Route::get('sales-invoice/{id}', [SalesInvoiceController::class, 'show'])->name('sales-invoice.show');
    Route::get('sales-invoice/{id}/edit', [SalesInvoiceController::class, 'edit'])->name('sales-invoice.edit');
    Route::put('sales-invoice/{id}', [SalesInvoiceController::class, 'update'])->name('sales-invoice.update');
    Route::delete('sales-invoice/{id}', [SalesInvoiceController::class, 'destroy'])->name('sales-invoice.destroy');
});
