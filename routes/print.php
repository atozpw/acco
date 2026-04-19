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
        ->middleware(['permission:receivable-payments.index']);
    
    Route::get('purchase-receipt/{id}', [PrintController::class, 'purchaseReceipt'])
        ->name('print.purchase-receipt')
        ->middleware(['permission:purchase-receipts.index']);
    Route::get('purchase-invoice/{id}', [PrintController::class, 'purchaseInvoice'])
        ->name('print.purchase-invoice')
        ->middleware(['permission:purchase-invoices.index']);
    Route::get('payable-payment/{id}', [PrintController::class, 'payablePayment'])
        ->name('print.payable-payment')
        ->middleware(['permission:payable-payments.index']);

    Route::get('disbursement/{id}', [PrintController::class, 'expense'])
        ->name('print.expense')
        ->middleware(['permission:expenses.index']);
    Route::get('cash-in/{id}', [PrintController::class, 'income'])
        ->name('print.income')
        ->middleware(['permission:incomes.index']);
    Route::get('cash-transfer/{id}', [PrintController::class, 'cashTransfer'])
        ->name('print.cash-transfer')
        ->middleware(['permission:cash-transfers.index']);
});