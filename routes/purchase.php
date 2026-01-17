<?php

use App\Http\Controllers\Purchase\PayableController;
use App\Http\Controllers\Purchase\PayablePaymentController;
use App\Http\Controllers\Purchase\PurchaseInvoiceController;
use App\Http\Controllers\Purchase\PurchaseReceiptController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth')->prefix('purchases')->group(function () {
    Route::redirect('', '/purchases/purchase-receipt')->name('purchases.index');

    Route::get('purchase-receipt', [PurchaseReceiptController::class, 'index'])
        ->name('purchase-receipt.index')
        ->middleware(['permission:purchase-receipts.index']);
    Route::get('purchase-receipt/create', [PurchaseReceiptController::class, 'create'])
        ->name('purchase-receipt.create')
        ->middleware(['permission:purchase-receipts.store']);
    Route::post('purchase-receipt', [PurchaseReceiptController::class, 'store'])
        ->name('purchase-receipt.store')
        ->middleware(['permission:purchase-receipts.store']);
    Route::get('purchase-receipt/{id}', [PurchaseReceiptController::class, 'show'])
        ->name('purchase-receipt.show')
        ->middleware(['permission:purchase-receipts.index']);
    Route::get('purchase-receipt/{id}/edit', [PurchaseReceiptController::class, 'edit'])
        ->name('purchase-receipt.edit')
        ->middleware(['permission:purchase-receipts.update']);
    Route::put('purchase-receipt/{id}', [PurchaseReceiptController::class, 'update'])
        ->name('purchase-receipt.update')
        ->middleware(['permission:purchase-receipts.update']);
    Route::delete('purchase-receipt/{id}', [PurchaseReceiptController::class, 'destroy'])
        ->name('purchase-receipt.destroy')
        ->middleware(['permission:purchase-receipts.destroy']);
    Route::get('purchase-receipt/journal-voucher/{nomor}', [PurchaseReceiptController::class, 'voucher'])
        ->name('purchase-receipt.voucher')
        ->middleware(['permission:purchase-receipts.index']);

    Route::get('purchase-invoice', [PurchaseInvoiceController::class, 'index'])
        ->name('purchase-invoice.index')
        ->middleware(['permission:purchase-invoices.index']);
    Route::get('purchase-invoice/create', [PurchaseInvoiceController::class, 'create'])
        ->name('purchase-invoice.create')
        ->middleware(['permission:purchase-invoices.store']);
    Route::post('purchase-invoice', [PurchaseInvoiceController::class, 'store'])
        ->name('purchase-invoice.store')
        ->middleware(['permission:purchase-invoices.store']);
    Route::get('purchase-invoice/{id}', [PurchaseInvoiceController::class, 'show'])
        ->name('purchase-invoice.show')
        ->middleware(['permission:purchase-invoices.index']);
    Route::get('purchase-invoice/{id}/edit', [PurchaseInvoiceController::class, 'edit'])
        ->name('purchase-invoice.edit')
        ->middleware(['permission:purchase-invoices.update']);
    Route::put('purchase-invoice/{id}', [PurchaseInvoiceController::class, 'update'])
        ->name('purchase-invoice.update')
        ->middleware(['permission:purchase-invoices.update']);
    Route::delete('purchase-invoice/{id}', [PurchaseInvoiceController::class, 'destroy'])
        ->name('purchase-invoice.destroy')
        ->middleware(['permission:purchase-invoices.destroy']);
    Route::get('purchase-invoice/journal-voucher/{nomor}', [PurchaseInvoiceController::class, 'voucher'])
        ->name('purchase-invoice.voucher')
        ->middleware(['permission:purchase-invoices.index']);

    Route::get('account-payable', [PayableController::class, 'index'])
        ->name('account-payable.index');
    Route::get('account-payable/detail-account-payable/{id}', [PayableController::class, 'show'])
        ->name('account-payable.show');

    Route::get('payable-payment', [PayablePaymentController::class, 'index'])
        ->name('payable-payment.index')
        ->middleware(['permission:payable-payments.index']);
    Route::get('payable-payment/create', [PayablePaymentController::class, 'create'])
        ->name('payable-payment.create')
        ->middleware(['permission:payable-payments.store']);
    Route::post('payable-payment', [PayablePaymentController::class, 'store'])
        ->name('payable-payment.store')
        ->middleware(['permission:payable-payments.store']);
    Route::get('payable-payment/{id}', [PayablePaymentController::class, 'show'])
        ->name('payable-payment.show')
        ->middleware(['permission:payable-payments.index']);
    Route::get('payable-payment/{id}/edit', [PayablePaymentController::class, 'edit'])
        ->name('payable-payment.edit')
        ->middleware(['permission:payable-payments.update']);
    Route::put('payable-payment/{id}', [PayablePaymentController::class, 'update'])
        ->name('payable-payment.update')
        ->middleware(['permission:payable-payments.update']);
    Route::delete('payable-payment/{id}', [PayablePaymentController::class, 'destroy'])
        ->name('payable-payment.destroy')
        ->middleware(['permission:payable-payments.destroy']);
    Route::get('payable-payment/journal-voucher/{nomor}', [PayablePaymentController::class, 'voucher'])
        ->name('payable-payment.voucher')
        ->middleware(['permission:payable-payments.index']);
});
