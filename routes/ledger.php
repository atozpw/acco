<?php

use App\Http\Controllers\Ledger\GeneralJournalController;
use App\Http\Controllers\Ledger\LedgerController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth')->prefix('ledger')->group(function () {
    Route::redirect('', '/ledger/ledger-data')->name('ledger.index');

    Route::get('ledger-data', [LedgerController::class, 'index'])->name('ledger-data.index');
    Route::get('ledger-data/journal-voucher/{id}', [LedgerController::class, 'show'])->name('ledger-data.show');

    Route::get('general-journal', [GeneralJournalController::class, 'index'])->name('general-journal.index');
    Route::get('general-journal/create', [GeneralJournalController::class, 'create'])->name('general-journal.create');
    Route::post('general-journal', [GeneralJournalController::class, 'store'])->name('general-journal.store');
    Route::get('general-journal/{id}', [GeneralJournalController::class, 'show'])->name('general-journal.show');
    Route::get('general-journal/{id}/edit', [GeneralJournalController::class, 'edit'])->name('general-journal.edit');
    Route::put('general-journal/{id}', [GeneralJournalController::class, 'update'])->name('general-journal.update');
    Route::delete('general-journal/{id}', [GeneralJournalController::class, 'destroy'])->name('general-journal.destroy');
});
