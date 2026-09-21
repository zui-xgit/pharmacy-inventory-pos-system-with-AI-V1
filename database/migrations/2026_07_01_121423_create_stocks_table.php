<?php

use App\Models\Catalog\Batch;
use App\Models\Core\Shop;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    // Stock tracks the CURRENT available quantity of each batch in a shop.
    // It is the live number you see on the shelf right now.
    //
    // When a sale happens — stock.quantity goes down.
    // When a batch is received — stock.quantity goes up.
    // When a stock take adjustment happens — stock.quantity is corrected.
    //
    // Every change to stock.quantity MUST write a corresponding row
    // in stock_movements — that is the rule that makes the ledger work.

    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('stocks', function (Blueprint $table) {

            $table->id();
            $table->uuid('uuid')->unique();

            $table->foreignIdFor(Shop::class)
                ->constrained()
                ->cascadeOnDelete();

            $table->foreignIdFor(Batch::class)
                ->constrained()
                ->restrictOnDelete();

            // Current available quantity of this batch in this shop

            $table->unsignedInteger('quantity_received'); // original quantity received
            $table->unsignedInteger('quantity_remaining'); // original quantity received

            $table->timestamps();

            // one stock row per batch per shop
            $table->unique(['shop_id', 'batch_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('stocks');
    }
};
