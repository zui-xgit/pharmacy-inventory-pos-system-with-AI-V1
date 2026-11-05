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

Route::prefix('shop/{shop:uuid}')->middleware(['auth', 'verified', 'check.status', 'shop.member', ])->group(function () {

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
    Route::get('/reports/sales', [ReportsAndInsightsController::class, 'salesReports'])->name('shop.sales-report');
    Route::get('/reports/inventory', [ReportsAndInsightsController::class, 'inventoryReports'])->name('shop.inventory-report');

    // SHOP USER SETTINGS
    Route::get('staff/profile', [ProfileController::class, 'staffProfileEdit'])->name('shop.staff-profile');
    Route::get('staff/security', [SecurityController::class, 'staffSecurityEdit'])->name('shop.staff-security');

    Route::get('staff/appearance', function (Shop $shop) {
        return Inertia::render('staff-settings/appearance');
    })->name('shop.staff-appearance');

    // SHOP STAFF MANAGEMENT
    Route::middleware('role:admin|manager')->group(function () {
        Route::get('shop-staff', [ShopStaffController::class, 'staffEdit'])->name('shop.staff-edit');
        Route::post('shop-staff/create', [ShopStaffController::class, 'createStaff'])->name('shop.staff-create');
        // Scoped bindings would resolve the user through Shop::users(), turning
        // cross-shop requests into 404s. Resolve the user globally and let the
        // controller/middleware return a 403 for staff outside this shop.
        Route::patch('shop-staff/{user:uuid}/update', [ShopStaffController::class, 'updateStaff'])
            ->name('shop.staff-update')
            ->middleware('can:updateSelfUser,user')
            ->scopeBindings();

        Route::patch('shop-staff/{user:uuid}/update-credentials', [ShopStaffController::class, 'updateCredentials'])
            ->name('shop.staff-update-credentials')
            ->middleware('can:updateSelfUser,user')
            ->scopeBindings();

        Route::patch('shop-staff/{user:uuid}/activate', [ShopStaffController::class, 'activateStaff'])
            ->name('shop.staff-activate')
            ->middleware('can:updateSelfUser,user')
            ->scopeBindings();
        
        Route::patch('shop-staff/{user:uuid}/suspend', [ShopStaffController::class, 'suspendStaff'])
            ->name('shop.staff-suspend')
            ->middleware('can:updateSelfUser,user')
            ->scopeBindings(); 
    });

});

Route::middleware(['auth', 'verified', 'check.status', 'role:manager|cashier', ])->group(function () {
    Route::get('select-shop', [ShopSelectionController::class, 'index'])->name('staff.shops-select');
});

Route::middleware('guest')->group(function () {
    Route::get('inactive', function () {

        abort_unless(session()->has('account_status'), 404);
        session()->reflash(); // keeps it alive across a refresh

        return Inertia::render('account-status/inactive');
    })->name('account.inactive');

    Route::get('suspended', function () {

        abort_unless(session()->has('account_status'), 404);
        session()->reflash();

        return Inertia::render('account-status/suspended');
    })->name('account.suspended');
});

require __DIR__.'/admin.php';

require __DIR__.'/settings.php';
