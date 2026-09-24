<?php

use App\Models\Catalog\Product;
use App\Models\Catalog\Supplier;
use App\Models\Core\Shop;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('batches', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();

            $table->foreignIdFor(Shop::class)
                ->constrained()
                ->cascadeOnDelete();

            $table->foreignIdFor(Product::class)
                ->constrained()
                ->restrictOnDelete(); // cannot delete a product that has batches


            $table->string('batch_number'); // manufacturer batch number

            $table->date('expiry_date');
            $table->date('manufactured_date');

            $table->integer('packages_received');
            $table->integer('units_per_package_received');

            $table->integer('packages_remaining');
            $table->integer('units_remaining');

            $table->integer('cost_price');        // buying price per unit
            $table->integer('selling_price');     // selling price per unit

            $table->timestamps();
            $table->softDeletes();

            // batch number must be unique per product per shop
            // $table->unique(['shop_id', 'product_id', 'batch_number']);

            // Uniqueness constraint
            $table->unique(['shop_id', 'product_id', 'batch_number']);

            // Composite index for fast FEFO lookups
            $table->index(['shop_id', 'product_id', 'expiry_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('batches');
    }
};
