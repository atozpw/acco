<?php

use App\Http\Controllers\Master\CoaController;
use App\Http\Controllers\Master\ContactController;
use App\Http\Controllers\Master\ProductController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth')->prefix('data-store')->group(function () {
    Route::redirect('', '/data-store/contact-data')->name('data-store.index');

    Route::get('contact-data', [ContactController::class, 'index'])->name('contact-data.index');
    Route::get('contact-data/create', [ContactController::class, 'create'])->name('contact-data.create');
    Route::post('contact-data', [ContactController::class, 'store'])->name('contact-data.store');
    Route::get('contact-data/{id}/edit', [ContactController::class, 'edit'])->name('contact-data.edit');
    Route::put('contact-data/{id}', [ContactController::class, 'update'])->name('contact-data.update');
    Route::delete('contact-data/{id}', [ContactController::class, 'destroy'])->name('contact-data.destroy');

    Route::get('account-data', [CoaController::class, 'index'])->name('coa.index');
    Route::get('account-data/create', [CoaController::class, 'create'])->name('coa.create');
    Route::post('account-data', [CoaController::class, 'store'])->name('coa.store');
    Route::get('account-data/{id}/edit', [CoaController::class, 'edit'])->name('coa.edit');
    Route::put('account-data/{id}', [CoaController::class, 'update'])->name('coa.update');
    Route::delete('account-data/{id}', [CoaController::class, 'destroy'])->name('coa.destroy');

    Route::get('product-data', [ProductController::class, 'index'])->name('product-data.index');
    Route::get('product-data/create', [ProductController::class, 'create'])->name('product-data.create');
    Route::post('product-data', [ProductController::class, 'store'])->name('product-data.store');
    Route::get('product-data/{id}/edit', [ProductController::class, 'edit'])->name('product-data.edit');
    Route::put('product-data/{id}', [ProductController::class, 'update'])->name('product-data.update');
    Route::delete('product-data/{id}', [ProductController::class, 'destroy'])->name('product-data.destroy');
});
