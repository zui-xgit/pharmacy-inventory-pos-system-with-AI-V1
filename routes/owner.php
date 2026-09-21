<?php

use App\Http\Controllers\OwnerController;
use Illuminate\Support\Facades\Route;

Route::prefix('shops')->middleware(['auth', 'verified', 'role:owner'])->group(function () {
    // OVERVIEW
    Route::get('/', [OwnerController::class, 'shops'])->name('owner.shops');

    // MANAGEMENT
    Route::get('staff', [OwnerController::class, 'staff'])->name('owner.staff');
    Route::post('create-shop', [OwnerController::class, 'createShop'])->name('owner.create-shop');
    Route::post('activiy-logs', [OwnerController::class, 'activityLogs'])->name('owner.activity-logs');

});
