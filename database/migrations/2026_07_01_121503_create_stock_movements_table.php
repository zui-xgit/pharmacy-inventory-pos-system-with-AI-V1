<?php

use App\Models\Catalog\Batch;
use App\Models\Catalog\Product;
use App\Models\Core\Shop;
use App\Models\User;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    // The stock movements table is the ledger — it records every single
    // change to stock quantity with a reason and a reference.
    //
    // Types of movements:
    //   purchase    — stock received from a supplier (quantity goes up)
    //   sale        — stock sold to a customer (quantity goes down)
    //   adjustment  — stock take correction (quantity goes up or down)
    //   expiry      — expired stock written off (quantity goes down)
    //   transfer    — stock moved between shops (future phase)
    //   return      — customer returns (quantity goes up)
    //
    // This table is what makes these features possible:
    //   - Full activity history
    //   - Stock take reconciliation
    //   - Purchase history report
    //   - Cash flow report

    /**
     * Run the migrations.
     */
    public function up(): void
    {

        Schema::create('stock_movements', function (Blueprint $table) {

            $table->id();
            $table->uuid('uuid')->unique();

            $table->foreignIdFor(Shop::class)
                ->constrained()
                ->cascadeOnDelete();

            $table->foreignIdFor(Product::class)
                ->constrained()
                ->restrictOnDelete();

            $table->foreignIdFor(Batch::class)
                ->constrained()
                ->restrictOnDelete();

            // The user who triggered this movement
            $table->foreignIdFor(User::class)
                ->constrained()
                ->restrictOnDelete();

            $table->enum('type', [
                'purchase',   // batch received
                'sale',       // sold to customer
                'adjustment', // stock take correction
                'expiry',     // written off as expired
                'return',     // customer return
                'transfer',   // between shops (phase 2)
            ]);

            // Positive = stock coming in, Negative = stock going out
            $table->decimal('quantity', 10, 2);

            // Quantity before this movement — useful for audit trail
            $table->decimal('quantity_before', 10, 2);

            // Quantity after this movement
            $table->decimal('quantity_after', 10, 2);

            // Reference to the source record
            // e.g. sale_id, batch_id, stock_count_session_id
            $table->string('reference_type')->nullable(); // morph type
            $table->unsignedBigInteger('reference_id')->nullable(); // morph id

            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('stock_movements');
    }
};
