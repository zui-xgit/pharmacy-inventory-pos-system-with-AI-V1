<?php

use App\Models\Catalog\DosageForm;
use App\Models\Catalog\PackageUnit;
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
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();

            $table->foreignIdFor(Shop::class)
                ->constrained()
                ->cascadeOnDelete();

            $table->foreignIdFor(DosageForm::class)
                ->constrained()
                ->restrictOnDelete(); // prevent deleting a unit that has products

         

            $table->string('name');
            // $table->string('sku')->nullable();  // barcode or internal code

            // Reorder point — when stock falls below this number,
            // a low stock alert is triggered for this specific product.
            // Falls back to shop's low_stock_threshold if null.
            $table->unsignedInteger('reorder_point')->nullable();

            $table->text('description')->nullable();
            // $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();

            // SKU must be unique within a shop
            // $table->unique(['shop_id', 'sku']);
            // $table->unique(['shop_id', 'name', 'dosage_form_id', 'package_unit_id']);
            $table->unique(['shop_id', 'name', 'dosage_form_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
