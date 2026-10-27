<?php

namespace Tests\Feature;

use App\Enum\StockMovementReason;
use App\Enum\StockMovementType;
use App\Http\Middleware\EnsureShopMember;
use App\Models\Catalog\Batch;
use App\Models\Catalog\DosageForm;
use App\Models\Catalog\Product;
use App\Models\Core\Shop;
use App\Models\Inventory\StockMovement;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class StockAdjustmentTest extends TestCase
{
    use RefreshDatabase;

    private function makeBatch(Shop $shop, string $productName, string $batchNumber, int $units = 50): Batch
    {
        $dosage = DosageForm::firstOrCreate([
            'shop_id' => $shop->id,
            'name' => 'Tablet',
        ]);

        $product = Product::create([
            'shop_id' => $shop->id,
            'dosage_form_id' => $dosage->id,
            'name' => $productName,
        ]);

        return Batch::create([
            'shop_id' => $shop->id,
            'product_id' => $product->id,
            'batch_number' => $batchNumber,
            'expiry_date' => '2027-01-01',
            'manufactured_date' => '2025-01-01',
            'packages_received' => 5,
            'units_per_package_received' => 10,
            'packages_remaining' => intdiv($units, 10),
            'units_remaining' => $units,
            'cost_price' => 100,
            'selling_price' => 200,
        ]);
    }

    public function test_page_returns_database_batches_and_search_filter(): void
    {
        $shop = Shop::factory()->create();
        $this->makeBatch($shop, 'paracetamol', 'PCM-001');
        $this->makeBatch($shop, 'amoxicillin', 'AMX-001');

        $this->actingAs(User::factory()->create());
        $this->withoutMiddleware(EnsureShopMember::class);

        $this->get(route('stock.stock_adjustments', ['shop' => $shop->uuid]))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('shop/stock/stock-adjustments')
                ->has('batches.data', 0)
                ->where('shop_uuid', $shop->uuid)
            );

        $this->get(route('stock.stock_adjustments', ['shop' => $shop->uuid, 'search' => 'amox']))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('shop/stock/stock-adjustments')
                ->has('batches.data', 1)
                ->where('batches.data.0.batch_number', 'AMX-001')
                ->where('filters.search', 'amox')
            );
    }

    public function test_adjust_stock_updates_batch_and_writes_audit_movement(): void
    {
        $shop = Shop::factory()->create();
        $user = User::factory()->create();
        $batch = $this->makeBatch($shop, 'paracetamol', 'PCM-001');

        $this->withoutMiddleware(EnsureShopMember::class);
        $this->actingAs($user);

        $this->post(route('stock.adjust_stock', ['shop' => $shop->uuid]), [
            'batch_uuid' => $batch->uuid,
            'units_remaining' => 30,
            'manufactured_date' => '2025-02-01',
            'expiry_date' => '2027-02-01',
            'notes' => 'Physical audit correction',
        ])->assertRedirect()->assertSessionHasNoErrors();

        $batch->refresh();

        $this->assertSame(30, $batch->units_remaining);
        $this->assertSame(3, $batch->packages_remaining);
        $this->assertSame('2027-02-01', $batch->expiry_date->format('Y-m-d'));

        $movement = StockMovement::sole();

        $this->assertSame(StockMovementType::OUT, $movement->type);
        $this->assertSame(StockMovementReason::ADJUSTMENT, $movement->reason);
        $this->assertEquals(20, $movement->quantity);
        $this->assertEquals(50, $movement->previous_stock);
        $this->assertEquals(30, $movement->new_stock);
        $this->assertSame('Physical audit correction', $movement->notes);
        $this->assertSame($user->id, $movement->user_id);
    }
}
