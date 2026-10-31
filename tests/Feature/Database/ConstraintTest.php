<?php

namespace Tests\Feature\Database;

use App\Enum\StockMovementReason;
use App\Enum\StockMovementType;
use App\Models\Core\Shop;
use App\Models\User;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class ConstraintTest extends TestCase
{
    use CreatesPharmacyRecords;
    use RefreshDatabase;

    public function test_users_must_be_unique_by_email_username_and_uuid(): void
    {
        $user = User::factory()->create([
            'email' => 'unique@example.com',
            'username' => 'unique.user',
        ]);

        $this->assertDatabaseRejects(fn () => User::factory()->create(['email' => 'unique@example.com']));
        $this->assertDatabaseRejects(fn () => User::factory()->create(['username' => 'unique.user']));
        $this->assertDatabaseRejects(fn () => User::factory()->create(['uuid' => $user->uuid]));
    }

    public function test_shop_name_and_uuid_must_be_unique(): void
    {
        $shop = $this->createShop();

        $this->assertDatabaseRejects(fn () => Shop::factory()->create(['name' => $shop->name]));
        $this->assertDatabaseRejects(fn () => Shop::factory()->create(['uuid' => $shop->uuid]));
    }

    public function test_a_user_can_only_join_the_same_shop_once(): void
    {
        $shop = $this->createShop();
        $user = User::factory()->create();

        $user->shops()->attach($shop->id);

        $this->assertDatabaseRejects(fn () => $user->shops()->attach($shop->id));
    }

    public function test_dosage_form_names_are_unique_per_shop_only(): void
    {
        $firstShop = $this->createShop();
        $secondShop = $this->createShop();

        $this->createDosageForm($firstShop, 'Tablet');

        $this->assertDatabaseRejects(fn () => $this->createDosageForm($firstShop, 'Tablet'));

        $this->assertSame('Tablet', $this->createDosageForm($secondShop, 'Tablet')->name);
    }

    public function test_product_names_are_unique_per_shop_and_dosage_form(): void
    {
        $shop = $this->createShop();
        $tablet = $this->createDosageForm($shop, 'Tablet');
        $syrup = $this->createDosageForm($shop, 'Syrup');

        $this->createProduct($shop, $tablet, 'Paracetamol 500mg');

        $this->assertDatabaseRejects(fn () => $this->createProduct($shop, $tablet, 'Paracetamol 500mg'));

        $this->assertSame('Paracetamol 500mg', $this->createProduct($shop, $syrup, 'Paracetamol 500mg')->name);
    }

    public function test_batch_numbers_are_unique_per_shop_and_product(): void
    {
        $shop = $this->createShop();
        $dosageForm = $this->createDosageForm($shop);
        $product = $this->createProduct($shop, $dosageForm, 'Paracetamol 500mg');
        $otherProduct = $this->createProduct($shop, $dosageForm, 'Ibuprofen 400mg');

        $this->createBatch($shop, $product, 'BATCH-001');

        $this->assertDatabaseRejects(fn () => $this->createBatch($shop, $product, 'BATCH-001'));

        $this->assertSame('BATCH-001', $this->createBatch($shop, $otherProduct, 'BATCH-001')->batch_number);
    }

    public function test_receipt_numbers_must_be_unique(): void
    {
        $shop = $this->createShop();
        $user = User::factory()->create();

        $this->createSale($shop, $user, 'RCP-20240101-0001');

        $this->assertDatabaseRejects(fn () => $this->createSale($shop, $user, 'RCP-20240101-0001'));
    }

    public function test_enum_columns_reject_unknown_values(): void
    {
        $user = User::factory()->create();
        $sale = $this->createSale($this->createShop());

        $this->assertDatabaseRejects(fn () => DB::table('users')->where('id', $user->id)->update(['gender' => 'unknown']));
        $this->assertDatabaseRejects(fn () => DB::table('users')->where('id', $user->id)->update(['status' => 'unknown']));
        $this->assertDatabaseRejects(fn () => DB::table('sales')->where('id', $sale->id)->update(['payment_method' => 'bitcoin']));
        $this->assertDatabaseRejects(fn () => DB::table('sales')->where('id', $sale->id)->update(['status' => 'unknown']));
    }

    public function test_shop_memberships_cascade_when_a_shop_is_force_deleted(): void
    {
        $shop = $this->createShop();
        $user = User::factory()->create();
        $user->shops()->attach($shop->id);

        $shop->forceDelete();

        $this->assertDatabaseMissing('shop_user', ['shop_id' => $shop->id, 'user_id' => $user->id]);
        $this->assertDatabaseHas('users', ['id' => $user->id]);
    }

    public function test_sales_cascade_when_a_shop_is_force_deleted(): void
    {
        $shop = $this->createShop();
        $sale = $this->createSale($shop);

        $shop->forceDelete();

        $this->assertDatabaseMissing('sales', ['id' => $sale->id]);
    }

    public function test_sale_items_cascade_when_a_sale_is_deleted(): void
    {
        $shop = $this->createShop();
        $sale = $this->createSale($shop);
        $item = $this->createSaleItem($sale);

        $sale->delete();

        $this->assertDatabaseMissing('sale_items', ['id' => $item->id]);
    }

    public function test_sale_items_cascade_when_a_batch_is_deleted(): void
    {
        $shop = $this->createShop();
        $sale = $this->createSale($shop);
        $item = $this->createSaleItem($sale);

        $item->batch->delete();

        $this->assertDatabaseMissing('sale_items', ['id' => $item->id]);
    }

    public function test_deleting_a_dosage_form_with_products_is_restricted(): void
    {
        $shop = $this->createShop();
        $dosageForm = $this->createDosageForm($shop);
        $this->createProduct($shop, $dosageForm);

        $this->assertDatabaseRejects(fn () => $dosageForm->delete());

        $this->assertDatabaseHas('dosage_forms', ['id' => $dosageForm->id]);
    }

    public function test_deleting_a_product_with_batches_is_restricted(): void
    {
        $shop = $this->createShop();
        $product = $this->createProduct($shop);
        $this->createBatch($shop, $product);

        $this->assertDatabaseRejects(fn () => $product->forceDelete());

        $this->assertDatabaseHas('products', ['id' => $product->id]);
    }

    public function test_deleting_a_batch_with_stock_movements_is_restricted(): void
    {
        $shop = $this->createShop();
        $batch = $this->createBatch($shop);
        $this->createStockMovement($batch);

        $this->assertDatabaseRejects(fn () => $batch->delete());

        $this->assertDatabaseHas('batches', ['id' => $batch->id]);
    }

    public function test_deleting_a_user_with_sales_is_restricted(): void
    {
        $shop = $this->createShop();
        $user = User::factory()->create();
        $this->createSale($shop, $user);

        $this->assertDatabaseRejects(fn () => $user->delete());

        $this->assertDatabaseHas('users', ['id' => $user->id]);
    }

    public function test_soft_deleted_products_are_hidden_from_shop_relations(): void
    {
        $shop = $this->createShop();
        $product = $this->createProduct($shop);

        $product->delete();

        $this->assertSoftDeleted('products', ['id' => $product->id]);
        $this->assertSame(0, $shop->products()->count());
        $this->assertSame(1, $shop->products()->withTrashed()->count());
    }

    public function test_belongs_to_shop_helper_matches_the_pivot_table(): void
    {
        $shop = $this->createShop();
        $otherShop = $this->createShop();
        $user = User::factory()->create();

        $this->assertFalse($user->belongsToShop($shop->id));

        $user->shops()->attach($shop->id);

        $this->assertTrue($user->belongsToShop($shop->id));
        $this->assertFalse($user->belongsToShop($otherShop->id));
    }

    public function test_model_relationships_are_wired_correctly(): void
    {
        $shop = $this->createShop();
        $user = User::factory()->create();
        $user->shops()->attach($shop->id);

        $dosageForm = $this->createDosageForm($shop);
        $product = $this->createProduct($shop, $dosageForm);
        $batch = $this->createBatch($shop, $product);
        $sale = $this->createSale($shop, $user);
        $item = $this->createSaleItem($sale, $product, $batch);
        $movement = $this->createStockMovement($batch, $user);

        $this->assertTrue($shop->users->contains($user));
        $this->assertTrue($shop->dosageForms->contains($dosageForm));
        $this->assertTrue($shop->products->contains($product));
        $this->assertTrue($shop->batches->contains($batch));
        $this->assertTrue($shop->sales->contains($sale));

        $this->assertTrue($user->shops->contains($shop));

        $this->assertTrue($dosageForm->shop->is($shop));
        $this->assertTrue($dosageForm->products->contains($product));

        $this->assertTrue($product->shop->is($shop));
        $this->assertTrue($product->dosageForm->is($dosageForm));
        $this->assertTrue($product->batches->contains($batch));
        $this->assertTrue($product->saleItems->contains($item));

        $this->assertTrue($batch->shop->is($shop));
        $this->assertTrue($batch->product->is($product));
        $this->assertTrue($batch->stockMovements->contains($movement));
        $this->assertTrue($batch->saleItems->contains($item));

        $this->assertTrue($sale->shop->is($shop));
        $this->assertTrue($sale->user->is($user));
        $this->assertTrue($sale->items->contains($item));
        $this->assertTrue($sale->saleItems->contains($item));

        $this->assertTrue($item->sale->is($sale));
        $this->assertTrue($item->product->is($product));
        $this->assertTrue($item->batch->is($batch));

        $this->assertTrue($movement->batch->is($batch));
        $this->assertTrue($movement->user->is($user));
        $this->assertSame(StockMovementType::IN, $movement->type);
        $this->assertSame(StockMovementReason::PURCHASE, $movement->reason);
    }

    private function assertDatabaseRejects(callable $callback): void
    {
        try {
            $callback();
        } catch (QueryException) {
            $this->addToAssertionCount(1);

            return;
        }

        $this->fail('Expected the database to reject the operation, but it succeeded.');
    }
}
