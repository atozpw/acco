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
        Schema::table('payable_payments', function (Blueprint $table) {
            $table->boolean('is_giro_out')->default(false)->after('amount');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('payable_payments', function (Blueprint $table) {
            $table->dropColumn('is_giro_out');
        });
    }
};
