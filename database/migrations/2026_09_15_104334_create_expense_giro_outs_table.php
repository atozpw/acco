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
        Schema::create('expense_giro_outs', function (Blueprint $table) {
            $table->unsignedBigInteger('expense_id');
            $table->unsignedBigInteger('giro_out_id');

            $table->primary(['expense_id', 'giro_out_id']);

            $table->foreign('expense_id')->references('id')->on('expenses')->onUpdate('cascade');
            $table->foreign('giro_out_id')->references('id')->on('giro_outs')->onUpdate('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('expense_giro_outs');
    }
};
