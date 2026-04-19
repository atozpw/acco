<?php

use App\Http\Controllers\PrintController;

Route::middleware('auth')->prefix('print')->group(function () {
    Route::get('journal-voucher/{id}', [PrintController::class, 'voucher'])
        ->name('print.voucher')
        ->middleware(['permission:general-journal.index']);
});