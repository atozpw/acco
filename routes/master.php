<?php

use App\Http\Controllers\Master\ContactController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth')->prefix('data-store')->group(function () {
    Route::redirect('', '/data-store/contact-data')->name('data-store.index');

    Route::get('contact-data', [ContactController::class, 'index'])->name('contact-data.index');
    Route::get('contact-data/create', [ContactController::class, 'create'])->name('contact-data.create');
    Route::post('contact-data', [ContactController::class, 'store'])->name('contact-data.store');
    Route::get('contact-data/{id}/edit', [ContactController::class, 'edit'])->name('contact-data.edit');
    Route::put('contact-data/{id}', [ContactController::class, 'update'])->name('contact-data.update');
    Route::delete('contact-data/{id}', [ContactController::class, 'destroy'])->name('contact-data.destroy');
});
