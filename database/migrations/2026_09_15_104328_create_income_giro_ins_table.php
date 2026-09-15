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
        Schema::create('income_giro_ins', function (Blueprint $table) {
            $table->unsignedBigInteger('income_id');
            $table->unsignedBigInteger('giro_in_id');

            $table->primary(['income_id', 'giro_in_id']);

            $table->foreign('income_id')->references('id')->on('incomes')->onUpdate('cascade');
            $table->foreign('giro_in_id')->references('id')->on('giro_ins')->onUpdate('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('income_giro_ins');
    }
};
