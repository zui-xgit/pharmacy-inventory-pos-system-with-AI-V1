<?php

namespace Tests\Feature\Database;

use App\Models\Catalog\Batch;
use App\Models\Catalog\DosageForm;
use App\Models\Catalog\Product;
use App\Models\Core\Shop;
use App\Models\Inventory\StockMovement;
use App\Models\Sales\Sale;
use App\Models\Sales\SaleItem;
use App\Models\User;

/**
 * Builds a valid record graph for the pharmacy schema so database tests can
 * focus on constraints and relationships instead of repeated setup.
 */
trait CreatesPharmacyRecords
{
    protected function createShop(): Shop
    {
        return Shop::factory()->create();
    }

    protected function createDosageForm(Shop $shop, string $name = 'Tablet'): DosageForm
    {
        return DosageForm::create([
            'shop_id' => $shop->id,
            'name' => $name,
        ]);
    }

    protected function createProduct(Shop $shop, ?DosageForm $dosageForm = null, string $name = 'Paracetamol 500mg'): Product
    {
        $dosageForm ??= $this->createDosageForm($shop);

        return Product::create([
            'shop_id' => $shop->id,
            'dosage_form_id' => $dosageForm->id,
            'name' => $name,
        ]);
    }

    protected function createBatch(Shop $shop, ?Product $product = null, string $batchNumber = 'BATCH-001'): Batch
    {
        $product ??= $this->createProduct($shop);

        return Batch::create([
            'shop_id' => $shop->id,
            'product_id' => $product->id,
            'batch_number' => $batchNumber,
            'expiry_date' => now()->addYear()->toDateString(),
            'manufactured_date' => now()->subYear()->toDateString(),
            'packages_received' => 10,
            'units_per_package_received' => 10,
            'packages_remaining' => 10,
            'units_remaining' => 100,
            'cost_price' => 100,
            'selling_price' => 200,
        ]);
    }

    protected function createSale(Shop $shop, ?User $user = null, string $receiptNumber = 'RCP-20240101-0001'): Sale
    {
        $user ??= User::factory()->create();

        return Sale::create([
            'shop_id' => $shop->id,
            'user_id' => $user->id,
            'receipt_number' => $receiptNumber,
            'total_amount' => 200,
            'amount_paid' => 200,
        ]);
    }

    protected function createSaleItem(Sale $sale, ?Product $product = null, ?Batch $batch = null, int $quantity = 1): SaleItem
    {
        $product ??= $this->createProduct($sale->shop);
        $batch ??= $this->createBatch($sale->shop, $product);

        return SaleItem::create([
            'sale_id' => $sale->id,
            'product_id' => $product->id,
            'batch_id' => $batch->id,
            'quantity' => $quantity,
            'unit_price' => 200,
            'subtotal' => 200 * $quantity,
        ]);
    }

    protected function createStockMovement(Batch $batch, ?User $user = null): StockMovement
    {
        $user ??= User::factory()->create();

        return StockMovement::create([
            'batch_id' => $batch->id,
            'user_id' => $user->id,
            'type' => 'in',
            'reason' => 'purchase',
            'quantity' => 10,
            'previous_stock' => 90,
            'new_stock' => 100,
        ]);
    }
}
