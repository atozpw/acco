<?php

use App\Http\Controllers\DashboardController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::prefix('dashboard')->middleware('auth')->group(function () {
    Route::get('', [DashboardController::class, 'index'])
        ->name('dashboard');
    Route::get('profit-loss', [DashboardController::class, 'profitLoss'])
        ->name('dashboard.profit-loss');
});

require __DIR__ . '/settings.php';
require __DIR__ . '/master.php';
require __DIR__ . '/ledger.php';
require __DIR__ . '/user-management.php';
require __DIR__ . '/cashbank.php';
require __DIR__ . '/sales.php';
require __DIR__ . '/purchase.php';
require __DIR__ . '/report.php';
