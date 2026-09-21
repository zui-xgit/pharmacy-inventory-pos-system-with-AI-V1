<?php

use App\Http\Controllers\Catalog\CatalogController;
use App\Http\Controllers\ShopController;
use App\Http\Controllers\Stock\StockController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home')->middleware('is.manager_or_cashier');

Route::prefix('shop/{shop:uuid}')->middleware(['auth', 'verified', 'shop.member'])->group(function () {

    // shop overview
    Route::get('/', [ShopController::class, 'overviewDashboard'])->name('shop-overview');

    // SALES
    Route::get('new-sale-pos', [ShopController::class, 'newSalePos'])->name('sales.new-sale-pos');
    Route::get('sales-history', [ShopController::class, 'salesHistory'])->name('sales.history');

    // CATALOG
    Route::get('catalog/products', [CatalogController::class, 'productsCatalog'])->name('catalog.products');
    Route::get('catalog/batches', [CatalogController::class, 'batchesCatalog'])->name('catalog.batches');
    Route::get('catalog/dosage-forms', [CatalogController::class, 'dosageFormsCatalog'])->name('catalog.dosage-forms');
    Route::get('catalog/package-units', [CatalogController::class, 'packageUnitsCatalog'])->name('catalog.package-units');
    Route::post('catalog/new-dosage-form', [CatalogController::class, 'createDosageForm'])->name('catalog.new-dosage-form');
    Route::post('catalog/new-product', [CatalogController::class, 'createProduct'])->name('catalog.new-product');
    Route::post('stock/new-batch', [CatalogController::class, 'createBatch'])->name('stock.new-batch');

    // Stock
    Route::get('stock/receive-stock', [StockController::class, 'receiveStock'])->name('stock.receive-stock');
    Route::get('stock/stock-history', [StockController::class, 'stockHistory'])->name('stock.history');

});

require __DIR__.'/owner.php';
// require __DIR__.'/shop.php';
require __DIR__.'/settings.php';
