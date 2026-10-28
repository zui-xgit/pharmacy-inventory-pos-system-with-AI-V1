<?php

use App\Http\Controllers\CatalogController;
use App\Http\Controllers\OverviewController;
use App\Http\Controllers\PosController;
use App\Http\Controllers\ReportsAndInsightsController;
use App\Http\Controllers\StockController;
use Illuminate\Support\Facades\Route;


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

require __DIR__.'/owner.php';

require __DIR__.'/settings.php';
