<?php

use App\Models\Core\Shop;
use App\Models\User;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */

    // A stock count session represents one full stock take exercise.
    // The owner or manager initiates a session, staff count physical
    // stock and enter the numbers, then the session is finalized.
    //
    // On finalization:
    //   1. System count is compared to physical count per batch
    //   2. Variances are calculated
    //   3. Stock quantities are adjusted to match physical count
    //   4. A stock_movement row of type 'adjustment' is written per variance
    //
    // Status flow:
    //   open → in_progress → finalized

    public function up(): void
    {
        Schema::create('stock_count_sessions', function (Blueprint $table) {

            $table->id();

            $table->foreignIdFor(Shop::class)
                ->constrained()
                ->cascadeOnDelete();

            // The manager or owner who initiated the session
            $table->foreignIdFor(User::class)
                ->constrained()
                ->restrictOnDelete();

            $table->enum('status', ['open', 'in_progress', 'finalized'])->default('open');

            $table->text('notes')->nullable();
            $table->timestamp('finalized_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('stock_count_sessions');
    }
};
