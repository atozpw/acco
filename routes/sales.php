<?php

use App\Http\Controllers\Sales\ReceivablePaymentController;
use App\Http\Controllers\Sales\SalesDeliveryController;
use App\Http\Controllers\Sales\SalesInvoiceController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth')->prefix('sales')->group(function () {
    Route::redirect('', '/sales/sales-delivery')->name('sales.index');

    Route::get('sales-delivery', [SalesDeliveryController::class, 'index'])
        ->name('sales-delivery.index')
        ->middleware(['permission:sales-deliveries.index']);
    Route::get('sales-delivery/create', [SalesDeliveryController::class, 'create'])
        ->name('sales-delivery.create')
        ->middleware(['permission:sales-deliveries.store']);
    Route::post('sales-delivery', [SalesDeliveryController::class, 'store'])
        ->name('sales-delivery.store')
        ->middleware(['permission:sales-deliveries.store']);
    Route::get('sales-delivery/{id}', [SalesDeliveryController::class, 'show'])
        ->name('sales-delivery.show')
        ->middleware(['permission:sales-deliveries.index']);
    Route::get('sales-delivery/{id}/edit', [SalesDeliveryController::class, 'edit'])
        ->name('sales-delivery.edit')
        ->middleware(['permission:sales-deliveries.update']);
    Route::put('sales-delivery/{id}', [SalesDeliveryController::class, 'update'])
        ->name('sales-delivery.update')
        ->middleware(['permission:sales-deliveries.update']);
    Route::delete('sales-delivery/{id}', [SalesDeliveryController::class, 'destroy'])
        ->name('sales-delivery.destroy')
        ->middleware(['permission:sales-deliveries.destroy']);
    Route::get('sales-delivery/journal-voucher/{nomor}', [SalesDeliveryController::class, 'voucher'])
        ->name('sales-delivery.voucher')
        ->middleware(['permission:sales-deliveries.index']);

    Route::get('sales-invoice', [SalesInvoiceController::class, 'index'])
        ->name('sales-invoice.index')
        ->middleware(['permission:sales-invoices.index']);
    Route::get('sales-invoice/create', [SalesInvoiceController::class, 'create'])
        ->name('sales-invoice.create')
        ->middleware(['permission:sales-invoices.store']);
    Route::post('sales-invoice', [SalesInvoiceController::class, 'store'])
        ->name('sales-invoice.store')
        ->middleware(['permission:sales-invoices.store']);
    Route::get('sales-invoice/{id}', [SalesInvoiceController::class, 'show'])
        ->name('sales-invoice.show')
        ->middleware(['permission:sales-invoices.index']);
    Route::get('sales-invoice/{id}/edit', [SalesInvoiceController::class, 'edit'])
        ->name('sales-invoice.edit')
        ->middleware(['permission:sales-invoices.update']);
    Route::put('sales-invoice/{id}', [SalesInvoiceController::class, 'update'])
        ->name('sales-invoice.update')
        ->middleware(['permission:sales-invoices.update']);
    Route::delete('sales-invoice/{id}', [SalesInvoiceController::class, 'destroy'])
        ->name('sales-invoice.destroy')
        ->middleware(['permission:sales-invoices.destroy']);
    Route::get('sales-invoice/journal-voucher/{nomor}', [SalesInvoiceController::class, 'voucher'])
        ->name('sales-invoice.voucher')
        ->middleware(['permission:sales-invoices.index']);

    Route::get('account-receivable-payment', [ReceivablePaymentController::class, 'index'])
        ->name('receivable-payment.index')
        ->middleware(['permission:receivable-payments.index']);
    Route::get('account-receivable-payment/create', [ReceivablePaymentController::class, 'create'])
        ->name('receivable-payment.create')
        ->middleware(['permission:receivable-payments.store']);
    Route::post('account-receivable-payment', [ReceivablePaymentController::class, 'store'])
        ->name('receivable-payment.store')
        ->middleware(['permission:receivable-payments.store']);
    Route::get('account-receivable-payment/{id}', [ReceivablePaymentController::class, 'show'])
        ->name('receivable-payment.show')
        ->middleware(['permission:receivable-payments.index']);
    Route::get('account-receivable-payment/{id}/edit', [ReceivablePaymentController::class, 'edit'])
        ->name('receivable-payment.edit')
        ->middleware(['permission:receivable-payments.update']);
    Route::put('account-receivable-payment/{id}', [ReceivablePaymentController::class, 'update'])
        ->name('receivable-payment.update')
        ->middleware(['permission:receivable-payments.update']);
    Route::delete('account-receivable-payment/{id}', [ReceivablePaymentController::class, 'destroy'])
        ->name('receivable-payment.destroy')
        ->middleware(['permission:receivable-payments.destroy']);
    Route::get('account-receivable-payment/journal-voucher/{nomor}', [ReceivablePaymentController::class, 'voucher'])
        ->name('receivable-payment.voucher')
        ->middleware(['permission:receivable-payments.index']);
});
