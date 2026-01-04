<?php

use App\Http\Controllers\Purchase\PurchaseInvoiceController;
use App\Http\Controllers\Purchase\PurchaseReceiptController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth')->prefix('purchases')->group(function () {
    Route::redirect('', '/purchases/purchase-receipt')->name('purchases.index');

    Route::get('purchase-receipt', [PurchaseReceiptController::class, 'index'])->name('purchase-receipt.index');
    Route::get('purchase-receipt/create', [PurchaseReceiptController::class, 'create'])->name('purchase-receipt.create');
    Route::post('purchase-receipt', [PurchaseReceiptController::class, 'store'])->name('purchase-receipt.store');
    Route::get('purchase-receipt/{id}/edit', [PurchaseReceiptController::class, 'edit'])->name('purchase-receipt.edit');
    Route::put('purchase-receipt/{id}', [PurchaseReceiptController::class, 'update'])->name('purchase-receipt.update');
    Route::delete('purchase-receipt/{id}', [PurchaseReceiptController::class, 'destroy'])->name('purchase-receipt.destroy');
    
    Route::get('purchase-invoice', [PurchaseInvoiceController::class, 'index'])->name('purchase-invoice.index');
    Route::get('purchase-invoice/create', [PurchaseInvoiceController::class, 'create'])->name('purchase-invoice.create');
    Route::post('purchase-invoice', [PurchaseInvoiceController::class, 'store'])->name('purchase-invoice.store');
    Route::get('purchase-invoice/{id}/edit', [PurchaseInvoiceController::class, 'edit'])->name('purchase-invoice.edit');
    Route::put('purchase-invoice/{id}', [PurchaseInvoiceController::class, 'update'])->name('purchase-invoice.update');
    Route::delete('purchase-invoice/{id}', [PurchaseInvoiceController::class, 'destroy'])->name('purchase-invoice.destroy');
});
