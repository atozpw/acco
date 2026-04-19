<?php

use App\Http\Controllers\PrintController;

Route::middleware('auth')->prefix('print')->group(function () {
    Route::get('journal-voucher/{id}', [PrintController::class, 'voucher'])
        ->name('print.voucher')
        ->middleware(['permission:general-journal.index']);

    Route::get('sales-delivery/{id}', [PrintController::class, 'salesDelivery'])
        ->name('print.sales-delivery')
        ->middleware(['permission:sales-deliveries.index']);
    Route::get('sales-invoice/{id}', [PrintController::class, 'salesInvoice'])
        ->name('print.sales-invoice')
        ->middleware(['permission:sales-invoices.index']);
    Route::get('account-receivable-payment/{id}', [PrintController::class, 'accountReceivablePayment'])
        ->name('print.account-receivable-payment')
        ->middleware(['permission:account-receivable-payments.index']);
});