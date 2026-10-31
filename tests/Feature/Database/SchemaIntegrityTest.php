<?php

namespace Tests\Feature\Database;

use App\Models\Core\Shop;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class SchemaIntegrityTest extends TestCase
{
    use CreatesPharmacyRecords;
    use RefreshDatabase;

    public function test_all_application_tables_are_created(): void
    {
        $tables = [
            'users',
            'password_reset_tokens',
            'sessions',
            'shops',
            'shop_user',
            'dosage_forms',
            'products',
            'batches',
            'stock_movements',
            'sales',
            'sale_items',
            'permissions',
            'roles',
            'model_has_permissions',
            'model_has_roles',
            'role_has_permissions',
        ];

        foreach ($tables as $table) {
            $this->assertTrue(Schema::hasTable($table), "Table [{$table}] is missing.");
        }
    }

    public function test_users_table_has_the_expected_columns(): void
    {
        $this->assertColumnsExist('users', [
            'id',
            'uuid',
            'username',
            'firstname',
            'lastname',
            'gender',
            'phone',
            'email',
            'status',
            'email_verified_at',
            'password',
            'remember_token',
            'created_at',
            'updated_at',
        ]);
    }

    public function test_shop_tables_have_the_expected_columns(): void
    {
        $this->assertColumnsExist('shops', [
            'id',
            'uuid',
            'name',
            'location',
            'address',
            'phone',
            'currency',
            'currency_symbol',
            'timezone',
            'logo_path',
            'low_stock_threshold',
            'expiry_alert_days',
            'is_active',
            'created_at',
            'updated_at',
            'deleted_at',
        ]);

        $this->assertColumnsExist('shop_user', [
            'id',
            'user_id',
            'shop_id',
            'created_at',
            'updated_at',
        ]);
    }

    public function test_catalog_tables_have_the_expected_columns(): void
    {
        $this->assertColumnsExist('dosage_forms', [
            'id',
            'uuid',
            'shop_id',
            'name',
            'created_at',
            'updated_at',
            'deleted_at',
        ]);

        $this->assertColumnsExist('products', [
            'id',
            'uuid',
            'shop_id',
            'dosage_form_id',
            'name',
            'reorder_point',
            'description',
            'created_at',
            'updated_at',
            'deleted_at',
        ]);

        $this->assertColumnsExist('batches', [
            'id',
            'uuid',
            'shop_id',
            'product_id',
            'batch_number',
            'expiry_date',
            'manufactured_date',
            'packages_received',
            'units_per_package_received',
            'packages_remaining',
            'units_remaining',
            'cost_price',
            'selling_price',
            'created_at',
            'updated_at',
            'deleted_at',
        ]);
    }

    public function test_sales_tables_have_the_expected_columns(): void
    {
        $this->assertColumnsExist('sales', [
            'id',
            'uuid',
            'shop_id',
            'user_id',
            'receipt_number',
            'total_amount',
            'discount',
            'amount_paid',
            'change_given',
            'payment_method',
            'status',
            'notes',
            'created_at',
            'updated_at',
        ]);

        $this->assertColumnsExist('sale_items', [
            'id',
            'uuid',
            'sale_id',
            'product_id',
            'batch_id',
            'quantity',
            'unit_price',
            'cost_price',
            'discount',
            'subtotal',
            'created_at',
            'updated_at',
        ]);
    }

    public function test_stock_movements_table_has_the_expected_columns(): void
    {
        $this->assertColumnsExist('stock_movements', [
            'id',
            'uuid',
            'batch_id',
            'user_id',
            'type',
            'reason',
            'quantity',
            'previous_stock',
            'new_stock',
            'notes',
            'created_at',
            'updated_at',
        ]);
    }

    public function test_nullable_columns_are_nullable(): void
    {
        $this->assertColumnIsNullable('users', 'email_verified_at');
        $this->assertColumnIsNullable('users', 'remember_token');
        $this->assertColumnIsNullable('shops', 'logo_path');
        $this->assertColumnIsNullable('shops', 'deleted_at');
        $this->assertColumnIsNullable('products', 'reorder_point');
        $this->assertColumnIsNullable('products', 'description');
        $this->assertColumnIsNullable('sales', 'notes');
        $this->assertColumnIsNullable('stock_movements', 'notes');
    }

    public function test_required_columns_are_not_nullable(): void
    {
        foreach (['uuid', 'username', 'firstname', 'lastname', 'gender', 'phone', 'email', 'password'] as $column) {
            $this->assertColumnIsNotNullable('users', $column);
        }

        $this->assertColumnIsNotNullable('shops', 'name');
        $this->assertColumnIsNotNullable('batches', 'batch_number');
        $this->assertColumnIsNotNullable('sales', 'receipt_number');
        $this->assertColumnIsNotNullable('stock_movements', 'previous_stock');
        $this->assertColumnIsNotNullable('stock_movements', 'new_stock');
    }

    public function test_unique_indexes_are_defined(): void
    {
        $this->assertUniqueIndexExists('users', ['uuid']);
        $this->assertUniqueIndexExists('users', ['username']);
        $this->assertUniqueIndexExists('users', ['email']);
        $this->assertUniqueIndexExists('shops', ['uuid']);
        $this->assertUniqueIndexExists('shops', ['name']);
        $this->assertUniqueIndexExists('shop_user', ['user_id', 'shop_id']);
        $this->assertUniqueIndexExists('dosage_forms', ['uuid']);
        $this->assertUniqueIndexExists('dosage_forms', ['shop_id', 'name']);
        $this->assertUniqueIndexExists('products', ['uuid']);
        $this->assertUniqueIndexExists('products', ['shop_id', 'name', 'dosage_form_id']);
        $this->assertUniqueIndexExists('batches', ['uuid']);
        $this->assertUniqueIndexExists('batches', ['shop_id', 'product_id', 'batch_number']);
        $this->assertUniqueIndexExists('sales', ['uuid']);
        $this->assertUniqueIndexExists('sales', ['receipt_number']);
        $this->assertUniqueIndexExists('sale_items', ['uuid']);
        $this->assertUniqueIndexExists('stock_movements', ['uuid']);
    }

    public function test_batches_have_an_index_for_fefo_lookups(): void
    {
        $indexes = collect(Schema::getIndexes('batches'));

        $this->assertTrue(
            $indexes->contains(fn (array $index): bool => $index['columns'] === ['shop_id', 'product_id', 'expiry_date']),
            'The batches table is missing the [shop_id, product_id, expiry_date] index used for FEFO lookups.'
        );
    }

    public function test_foreign_keys_and_delete_behaviour_are_defined(): void
    {
        $this->assertForeignKey('shop_user', 'user_id', 'users', 'cascade');
        $this->assertForeignKey('shop_user', 'shop_id', 'shops', 'cascade');

        $this->assertForeignKey('dosage_forms', 'shop_id', 'shops', 'cascade');

        $this->assertForeignKey('products', 'shop_id', 'shops', 'cascade');
        $this->assertForeignKey('products', 'dosage_form_id', 'dosage_forms', 'restrict');

        $this->assertForeignKey('batches', 'shop_id', 'shops', 'cascade');
        $this->assertForeignKey('batches', 'product_id', 'products', 'restrict');

        $this->assertForeignKey('stock_movements', 'batch_id', 'batches', 'restrict');
        $this->assertForeignKey('stock_movements', 'user_id', 'users', 'restrict');

        $this->assertForeignKey('sales', 'shop_id', 'shops', 'cascade');
        $this->assertForeignKey('sales', 'user_id', 'users', 'restrict');

        $this->assertForeignKey('sale_items', 'sale_id', 'sales', 'cascade');
        $this->assertForeignKey('sale_items', 'product_id', 'products', 'cascade');
        $this->assertForeignKey('sale_items', 'batch_id', 'batches', 'cascade');
    }

    public function test_shop_defaults_are_applied(): void
    {
        $shop = Shop::factory()->create()->refresh();

        $this->assertSame('TZS', $shop->currency);
        $this->assertSame('TSh', $shop->currency_symbol);
        $this->assertSame('Africa/Dar_es_Salaam', $shop->timezone);
        $this->assertSame(10, $shop->low_stock_threshold);
        $this->assertSame(30, $shop->expiry_alert_days);
        $this->assertTrue((bool) $shop->is_active);
        $this->assertNull($shop->logo_path);
    }

    public function test_user_status_defaults_to_active(): void
    {
        DB::table('users')->insert([
            'uuid' => (string) str()->uuid(),
            'username' => 'default.status',
            'firstname' => 'Default',
            'lastname' => 'Status',
            'gender' => 'male',
            'phone' => '0700000000',
            'email' => 'default.status@example.com',
            'password' => bcrypt('password'),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $this->assertSame('active', DB::table('users')->where('username', 'default.status')->value('status'));
    }

    public function test_sale_defaults_are_applied(): void
    {
        $sale = $this->createSale($this->createShop())->refresh();

        $this->assertEquals(0, (float) $sale->discount);
        $this->assertEquals(0, (float) $sale->change_given);
        $this->assertSame('cash', $sale->payment_method);
        $this->assertSame('completed', $sale->status);
        $this->assertNull($sale->notes);
    }

    public function test_sale_item_cost_and_discount_default_to_zero(): void
    {
        $shop = $this->createShop();
        $sale = $this->createSale($shop);

        $item = $this->createSaleItem($sale)->refresh();

        $this->assertEquals(0, (float) $item->cost_price);
        $this->assertEquals(0, (float) $item->discount);
    }

    public function test_models_using_has_uuids_generate_a_uuid(): void
    {
        $shop = $this->createShop();
        $dosageForm = $this->createDosageForm($shop);
        $product = $this->createProduct($shop, $dosageForm);
        $batch = $this->createBatch($shop, $product);
        $sale = $this->createSale($shop);
        $saleItem = $this->createSaleItem($sale, $product, $batch);
        $movement = $this->createStockMovement($batch);
        $user = User::factory()->create();

        foreach ([$shop, $dosageForm, $product, $batch, $sale, $saleItem, $movement, $user] as $model) {
            $this->assertTrue(
                str()->isUuid($model->uuid),
                class_basename($model).' did not generate a valid uuid.'
            );
        }
    }

    /**
     * @param  array<int, string>  $columns
     */
    private function assertColumnsExist(string $table, array $columns): void
    {
        $actual = collect(Schema::getColumns($table))->pluck('name')->all();

        foreach ($columns as $column) {
            $this->assertContains($column, $actual, "Column [{$table}.{$column}] is missing.");
        }
    }

    private function assertColumnIsNullable(string $table, string $column): void
    {
        $this->assertTrue(
            $this->column($table, $column)['nullable'],
            "Column [{$table}.{$column}] should be nullable."
        );
    }

    private function assertColumnIsNotNullable(string $table, string $column): void
    {
        $this->assertFalse(
            $this->column($table, $column)['nullable'],
            "Column [{$table}.{$column}] should not be nullable."
        );
    }

    /**
     * @return array<string, mixed>
     */
    private function column(string $table, string $column): array
    {
        $definition = collect(Schema::getColumns($table))->firstWhere('name', $column);

        $this->assertNotNull($definition, "Column [{$table}.{$column}] is missing.");

        return $definition;
    }

    /**
     * @param  array<int, string>  $columns
     */
    private function assertUniqueIndexExists(string $table, array $columns): void
    {
        $indexes = collect(Schema::getIndexes($table));

        $this->assertTrue(
            $indexes->contains(fn (array $index): bool => $index['unique'] && $index['columns'] === $columns),
            "Table [{$table}] is missing a unique index on [".implode(', ', $columns).'].'
        );
    }

    private function assertForeignKey(string $table, string $column, string $foreignTable, string $onDelete): void
    {
        $foreignKeys = collect(Schema::getForeignKeys($table));

        $foreignKey = $foreignKeys->first(
            fn (array $key): bool => $key['columns'] === [$column]
                && $key['foreign_table'] === $foreignTable
                && $key['on_delete'] === $onDelete
        );

        $this->assertNotNull(
            $foreignKey,
            "Table [{$table}] is missing a foreign key [{$column}] -> [{$foreignTable}.id] with on delete [{$onDelete}]."
        );
    }
}
