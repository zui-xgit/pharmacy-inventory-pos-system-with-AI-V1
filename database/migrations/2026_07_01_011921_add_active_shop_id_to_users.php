<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */

    // TODO: remember to deal with this later if this column is of no use then it is better to remove it
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // foreignId for determining what shop the user is operating in

            $table->foreignId('active_shop_id')
                ->nullable()
                ->after('status')
                ->constrained('shops')
                ->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            //
            $table->dropForeign(['active_shop_id']);
            $table->dropColumn('active_shop_id');
        });
    }
};
