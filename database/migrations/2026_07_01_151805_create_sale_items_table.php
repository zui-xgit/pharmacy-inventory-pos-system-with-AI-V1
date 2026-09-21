<?php

use App\Models\Catalog\Batch;
use App\Models\Catalog\Product;
use App\Models\Sales\Sale;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    // Each row here is one line on the receipt — one product from one batch.
    //
    // We store selling_price here at the time of sale because batch prices
    // can change in the future. This locks in the exact price that was
    // charged — critical for accurate P&L reports later.
    //
    // We also store cost_price at time of sale for the same reason —
    // so profit per item can always be calculated even if the batch
    // cost price is updated later.
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('sale_items', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();

            $table->foreignIdFor(Sale::class)
                ->constrained()
                ->cascadeOnDelete();

            $table->foreignIdFor(Product::class)
                ->constrained()
                ->restrictOnDelete();

            $table->foreignIdFor(Batch::class)
                ->constrained()
                ->restrictOnDelete();

            $table->decimal('quantity', 10, 2);
            $table->decimal('unit_price', 10, 2);   // selling price at time of sale
            $table->decimal('cost_price', 10, 2);   // cost price at time of sale — for P&L
            $table->decimal('discount', 10, 2)->default(0);
            $table->decimal('subtotal', 10, 2);     // (unit_price - discount) * quantity

            $table->timestamps();

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sale_items');
    }
};
