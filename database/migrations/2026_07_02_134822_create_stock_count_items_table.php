<?php

use App\Models\Catalog\Batch;
use App\Models\Catalog\Product;
use App\Models\StockTaking\StockCountSession;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */

    // Each row here is one product/batch counted during a stock take session.
    //
    // system_quantity — what the database says should be there
    // physical_quantity — what staff actually counted on the shelf
    // variance — the difference (physical - system)
    //            positive = more stock than expected
    //            negative = less stock than expected (shrinkage, theft, damage)

    public function up(): void
    {
        Schema::create('stock_count_items', function (Blueprint $table) {

            $table->id();
            $table->uuid('uuid')->unique();

            $table->foreignIdFor(StockCountSession::class)
                ->constrained()
                ->cascadeOnDelete();

            $table->foreignIdFor(Product::class)
                ->constrained()
                ->restrictOnDelete();

            $table->foreignIdFor(Batch::class)
                ->constrained()
                ->restrictOnDelete();

            $table->decimal('system_quantity', 10, 2);    // what system says
            $table->decimal('physical_quantity', 10, 2);  // what staff counted
            $table->decimal('variance', 10, 2);           // physical - system

            $table->text('notes')->nullable();
            $table->timestamps();

            // one count per batch per session
            $table->unique(['stock_count_session_id', 'batch_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('stock_count_items');
    }
};
