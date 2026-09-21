<?php

use App\Models\Core\Shop;
use App\Models\User;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    // A sale represents one complete transaction at the counter.
    // One sale has many sale_items — one per product/batch sold.
    //
    // When a sale is completed:
    //   1. A row is inserted here
    //   2. A sale_item row is inserted per product sold
    //   3. Stock quantity is deducted from the relevant batch
    //   4. A stock_movement row is written for each deduction
    //
    // All four steps happen in one database transaction — if any
    // step fails, nothing is saved.

    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('sales', function (Blueprint $table) {

            $table->id();
            $table->uuid('uuid')->unique();

            $table->foreignIdFor(Shop::class)
                ->constrained()
                ->cascadeOnDelete();

            // The cashier or staff member who processed this sale
            $table->foreignIdFor(User::class)
                ->constrained()
                ->restrictOnDelete();

            $table->string('receipt_number')->unique(); // auto generated e.g. RCP-20240101-0001
            $table->decimal('total_amount', 10, 2);     // sum of all sale items
            $table->decimal('discount', 10, 2)->default(0);
            $table->decimal('amount_paid', 10, 2);      // actual amount handed over
            $table->decimal('change_given', 10, 2)->default(0); // amount_paid - total_amount

            $table->enum('payment_method', ['cash', 'card', 'mobile'])->default('cash');

            $table->enum('status', ['completed', 'refunded', 'cancelled'])->default('completed');

            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sales');
    }
};
