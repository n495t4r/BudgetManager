<?php

use App\Http\Controllers\BucketController;
use App\Http\Controllers\BudgetPlanController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ExpenseController;
use App\Http\Controllers\IncomeSourceController;
use App\Http\Controllers\LineItemController;
use App\Http\Controllers\TeamController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    // Route::get('dashboard', function () {
    //     return Inertia::render('dashboard');
    // })->name('dashboard');
    Route::get('/prayer-chain', function () {
        return Inertia::render('prayer/dailyprayerchain');
    })->name('prayer-chain');

    //Dashboard
    Route::get('/dashboard', [DashboardController::class,'index'])->name('dashboard');

    //Team
    Route::resource('settings/teams', TeamController::class);

    // Budget Plans
    Route::resource('budget-plans', BudgetPlanController::class);
    Route::post('budget-plans/rollover', [BudgetPlanController::class, 'rollover'])->name('budget-plans.rollover');

    //Income Sources
    Route::resource('income-sources', IncomeSourceController::class);
    // ->except(['show', 'create', 'edit']);

    //Buckets
    Route::resource('buckets', BucketController::class)
    ->except(['show', 'create', 'edit']);

    //Line Items

    Route::post('/buckets/{bucket}/line-items', [LineItemController::class, 'store'])
        ->name('buckets.line-items.store');

    Route::resource('line-items', LineItemController::class)
        ->except(['index', 'show', 'create', 'edit', 'store']);

    //Expenses
    Route::resource('expenses', ExpenseController::class);

});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
