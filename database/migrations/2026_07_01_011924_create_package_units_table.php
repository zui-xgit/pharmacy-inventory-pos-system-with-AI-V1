<?php

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
        Schema::create('package_units', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();

            $table->foreignIdFor(Shop::class)
                ->constrained()
                ->cascadeOnDelete();

            $table->string('name');
            $table->softDeletes();
            $table->timestamps();

            // unit names must be unique per shop
            $table->unique(['shop_id', 'name']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('package_units');
    }
};
