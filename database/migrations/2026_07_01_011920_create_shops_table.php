<?php

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
        Schema::create('shops', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();

            $table->string('name')->unique();
            $table->string('location');
            $table->string('address');
            $table->string('phone');
            $table->string('currency', 3)->default('TZS');
            $table->string('currency_symbol', 5)->default('TSh');
            $table->string('timezone')->default('Africa/Dar_es_Salaam');

            $table->string('logo_path')->nullable();

            $table->unsignedInteger('low_stock_threshold')->default(10);
            $table->unsignedInteger('expiry_alert_days')->default(30);

            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('shops');
    }
};
