<?php

use App\Models\Catalog\Batch;
use App\Models\User;
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

        Schema::create('stock_movements', function (Blueprint $table) {

            $table->id();
            $table->uuid('uuid')->unique();

            $table->foreignIdFor(Batch::class)
                ->constrained()
                ->restrictOnDelete();

            // The user who performed the movement
            $table->foreignIdFor(User::class, 'performed_by')
                ->constrained()
                ->restrictOnDelete();

            $table->string('type');
            $table->string('reason');

            $table->integer('quantity');
            $table->integer('previous_stock');
            $table->integer('new_stock');
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
