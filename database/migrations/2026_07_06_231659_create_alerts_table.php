<?php

use App\Models\Catalog\Batch;
use App\Models\Catalog\Product;
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
        Schema::create('alerts', function (Blueprint $table) {

            $table->id();

            $table->foreignIdFor(Shop::class)
                ->constrained()
                ->cascadeOnDelete();

            $table->foreignIdFor(Product::class)
                ->nullable()
                ->constrained()
                ->cascadeOnDelete();

            // Nullable — only set for expiry alerts
            $table->foreignIdFor(Batch::class)
                ->nullable()
                ->constrained()
                ->cascadeOnDelete();

            $table->enum('type', ['low_stock', 'expiry', 'reorder']);
            $table->enum('status', ['unread', 'read', 'dismissed'])->default('unread');

            $table->string('message'); // human readable alert message
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('alerts');
    }
};
