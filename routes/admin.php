<?php

use App\Http\Controllers\AdminController;
use Illuminate\Support\Facades\Route;

Route::prefix('shops')->middleware(['auth', 'verified', 'check.status',  'role:admin'])->group(function () {
    Route::get('/', [AdminController::class, 'shops'])->name('admin.shops');
    Route::post('create-shop', [AdminController::class, 'createShop'])->name('admin.create-shop');

    // MANAGEMENT
    Route::get('staff-management', [AdminController::class, 'staffManagement'])->name('admin.staff');
    Route::patch('staff-management/{user:uuid}/update-credentials', [AdminController::class, 'updateCredentials'])->name('admin.staff-update-credentials');
    Route::patch('staff-management/{user:uuid}/update-staff', [AdminController::class, 'updateStaff'])->name('admin.staff-update');
    Route::get('activiy-logs', [AdminController::class, 'activityLogs'])->name('admin.activity-logs');

    // acivate / deactivate / suspend user
    Route::patch('/staff-management/{user:uuid}/activate', [AdminController::class, 'activateStaff'])
        ->name('admin.activate-staff')->middleware('can:updateSelfUser,user');


    Route::patch('/staff-management/{user:uuid}/suspend', [AdminController::class, 'suspendStaff'])
        ->name('admin.suspend-staff')->middleware('can:updateSelfUser,user');

    Route::post('/staff-management/create-staff', [AdminController::class, 'createStaff'])->name('admin.create-staff');

});
