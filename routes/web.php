<?php

use App\Http\Controllers\CatalogController;
use App\Http\Controllers\OverviewController;
use App\Http\Controllers\PosController;
use App\Http\Controllers\ReportsAndInsightsController;
use App\Http\Controllers\Settings\ProfileController;
use App\Http\Controllers\Settings\SecurityController;
use App\Http\Controllers\ShopSelectionController;
use App\Http\Controllers\ShopStaffController;
use App\Http\Controllers\StockController;
use App\Models\Core\Shop;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::inertia('/', 'welcome')->name('home');

Route::prefix('shop/{shop:uuid}')->middleware(['auth', 'verified', 'shop.member', 'check.status'])->group(function () {

    // Main
    Route::get('/', [OverviewController::class, 'overview'])->name('shop.overview');
    Route::get('/pos', [PosController::class, 'posIndex'])->name('shop.pos');
    Route::post('/post/checkout', [PosController::class, 'checkout'])->name('shop.pos-checkout');

    // CATALOG
    Route::get('/catalog/products', [CatalogController::class, 'productsCatalog'])->name('shop.catalog-products');
    Route::get('/catalog/batches', [CatalogController::class, 'batchesCatalog'])->name('shop.catalog-batches');
    Route::get('/catalog/dosage-forms', [CatalogController::class, 'dosageFormsCatalog'])->name('shop.catalog-dosage-forms');
    Route::get('/catalog/package-units', [CatalogController::class, 'packageUnitsCatalog'])->name('shop.catalog-package-units');
    Route::post('/catalog/new-dosage-form', [CatalogController::class, 'createDosageForm'])->name('shop.catalog-new-dosage-form');
    Route::post('/catalog/new-product', [CatalogController::class, 'createProduct'])->name('shop.catalog-new-product');
    Route::post('/stock/new-batch', [CatalogController::class, 'createBatch'])->name('shop.stock-new-batch');

    // Stock
    Route::get('/stock/receive-stock', [StockController::class, 'receiveStock'])->name('shop.receive-stock');
    Route::get('/stock/stock-adjustments', [StockController::class, 'stockAdjustments'])->name('shop.stock-adjustments');
    Route::post('/stock/stock-adjustments', [StockController::class, 'adjustStock'])->name('shop.adjust-stock');

    // Reports
    Route::get('/reports/sales', [ReportsAndInsightsController::class, 'salesReports'])->name('shop.report-sales');
    Route::get('/reports/inventory', [ReportsAndInsightsController::class, 'inventoryReports'])->name('shop.report-inventory');



    // SHOP USER SETTINGS
    Route::get('staff/profile', [ProfileController::class, 'staffProfileEdit'])->name('shop.staff-profile');
    Route::get('staff/security', [SecurityController::class, 'staffSecurityEdit'])->name('shop.staff-security');

    Route::get('staff/appearance', function (Shop $shop) {
        return Inertia::render('staff-settings/appearance');
    })->name('shop.staff-appearance');

    Route::get('shop-staff', [ShopStaffController::class, 'shopStaffEdit'])->name('shop.staff-edit');

});


Route::middleware(['auth', 'verified', 'role:manager|cashier', 'check.status'])->group(function (){
    Route::get('select-shop', [ShopSelectionController::class, 'index'])->name('staff.shops-select');
});



Route::middleware('guest')->group(function () {
    Route::get('inactive', function () {
        return Inertia::render('account-status/inactive');  
        })->name('account.inactive'); 
    Route::get('suspended', function () {
        return Inertia::render('account-status/suspended');  
        })->name('account.suspended');     
});


require __DIR__.'/admin.php';

require __DIR__.'/settings.php';
