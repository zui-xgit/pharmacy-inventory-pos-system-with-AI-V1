<?php

use App\Http\Controllers\CatalogController;
use App\Http\Controllers\OverviewController;
use App\Http\Controllers\PosController;
use App\Http\Controllers\ReportsAndInsightsController;
use App\Http\Controllers\Settings\ProfileController;
use App\Http\Controllers\Settings\SecurityController;
use App\Http\Controllers\ShopStaffController;
use App\Http\Controllers\StockController;
use App\Models\Core\Shop;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::inertia('/', 'welcome')->name('home')->middleware('is.manager_or_cashier');

Route::prefix('shop/{shop:uuid}')->middleware(['auth', 'verified', 'shop.member'])->group(function () {

    // Main
    Route::get('/', [OverviewController::class, 'overview'])->name('current_shop.overview');
    Route::get('/pos', [PosController::class, 'posIndex'])->name('current_shop.pos');
    Route::post('/post/checkout', [PosController::class, 'checkout'])->name('current_shop.pos_checkout');

    // CATALOG
    Route::get('/catalog/products', [CatalogController::class, 'productsCatalog'])->name('catalog.products');
    Route::get('/catalog/batches', [CatalogController::class, 'batchesCatalog'])->name('catalog.batches');
    Route::get('/catalog/dosage-forms', [CatalogController::class, 'dosageFormsCatalog'])->name('catalog.dosage_forms');
    Route::get('/catalog/package-units', [CatalogController::class, 'packageUnitsCatalog'])->name('catalog.package_units');
    Route::post('/catalog/new-dosage-form', [CatalogController::class, 'createDosageForm'])->name('catalog.new_dosage_form');
    Route::post('/catalog/new-product', [CatalogController::class, 'createProduct'])->name('catalog.new_product');
    Route::post('/stock/new-batch', [CatalogController::class, 'createBatch'])->name('stock.new_batch');

    // Stock
    Route::get('/stock/receive-stock', [StockController::class, 'receiveStock'])->name('stock.receive_stock');
    Route::get('/stock/stock-adjustments', [StockController::class, 'stockAdjustments'])->name('stock.stock_adjustments');
    Route::post('/stock/stock-adjustments', [StockController::class, 'adjustStock'])->name('stock.adjust_stock');

    // Reports
    Route::get('/reports/sales', [ReportsAndInsightsController::class, 'salesReports'])->name('reports.sales');
    Route::get('/reports/inventory', [ReportsAndInsightsController::class, 'inventoryReports'])->name('reports.inventory');

});

// shop user settings
Route::prefix('staff/shop/{shop:uuid}')->middleware(['auth', 'verified', 'shop.member'])->group(function () {
    Route::get('staff/profile', [ProfileController::class, 'staffProfileEdit'])->name('staff.profile');
    Route::get('staff/security', [SecurityController::class, 'staffSecurityEdit'])->name('staff.security');

    Route::get('staff/appearance', function (Shop $shop) {
        return Inertia::render('staff_settings/appearance');
    })->name('staff.appearance');

});

// shop staff
Route::prefix('staff/{shop:uuid}')->middleware(['auth', 'verified', 'shop.member'])->group(function () {
    Route::get('shop-staff', [ShopStaffController::class, 'shopStaffEdit'])->name('shop-staff.edit');
});

require __DIR__.'/admin.php';

require __DIR__.'/settings.php';
